import type {
  SensorData,
  ParameterThresholds,
  DecisionResult,
  ParameterStatus,
  WaterStatus
} from '../types/aquorix';

export const DEFAULT_THRESHOLDS: ParameterThresholds = {
  ph: {
    acceptableMin: 6.5,
    acceptableMax: 8.5,
    unit: 'pH'
  },
  tds: {
    acceptableLimit: 500,
    permissibleLimit: 2000,
    unit: 'mg/L'
  },
  turbidity: {
    acceptableLimit: 1.0,
    permissibleLimit: 5.0,
    unit: 'NTU'
  },
  temperature: {
    operationalMin: 15.0,
    operationalMax: 35.0,
    unit: '°C'
  },
  flowRate: {
    targetMin: 3.0,
    targetMax: 6.0,
    unit: 'L/min'
  }
};

/**
 * Evaluate single parameter against BIS standards and operational ranges
 */
export function evaluateParameter(
  param: 'ph' | 'tds' | 'turbidity' | 'temperature' | 'flowRate',
  value: number,
  thresholds: ParameterThresholds = DEFAULT_THRESHOLDS
): { status: ParameterStatus; message: string; safe: boolean } {
  switch (param) {
    case 'ph': {
      const { acceptableMin, acceptableMax } = thresholds.ph;
      if (value >= acceptableMin && value <= acceptableMax) {
        return {
          status: 'SAFE',
          message: `Within BIS acceptable range (${acceptableMin} – ${acceptableMax})`,
          safe: true
        };
      } else if (value >= 6.0 && value < acceptableMin) {
        return {
          status: 'WARNING',
          message: `Slightly acidic (${value.toFixed(1)}). Acceptable: ${acceptableMin}–${acceptableMax}`,
          safe: false
        };
      } else if (value > acceptableMax && value <= 9.0) {
        return {
          status: 'WARNING',
          message: `Slightly alkaline (${value.toFixed(1)}). Acceptable: ${acceptableMin}–${acceptableMax}`,
          safe: false
        };
      } else {
        return {
          status: 'UNSAFE',
          message: `Outside permissible range (${value.toFixed(1)}). Risk of mineral/heavy metal toxicity or caustic imbalance.`,
          safe: false
        };
      }
    }

    case 'tds': {
      const { acceptableLimit, permissibleLimit } = thresholds.tds;
      if (value <= acceptableLimit) {
        return {
          status: 'SAFE',
          message: `Optimal drinking water TDS (≤${acceptableLimit} mg/L)`,
          safe: true
        };
      } else if (value <= permissibleLimit) {
        return {
          status: 'WARNING',
          message: `Above acceptable (${acceptableLimit} mg/L) but within permissible limit (${permissibleLimit} mg/L)`,
          safe: false
        };
      } else {
        return {
          status: 'UNSAFE',
          message: `Exceeds permissible limit (>2000 mg/L). Heavy mineralization detected.`,
          safe: false
        };
      }
    }

    case 'turbidity': {
      const { acceptableLimit, permissibleLimit } = thresholds.turbidity;
      if (value <= acceptableLimit) {
        return {
          status: 'SAFE',
          message: `Crystal clear (≤${acceptableLimit} NTU, BIS standard)`,
          safe: true
        };
      } else if (value <= permissibleLimit) {
        return {
          status: 'WARNING',
          message: `Above acceptable (1 NTU) but within permissible limit (5 NTU). Suspended solids present.`,
          safe: false
        };
      } else {
        return {
          status: 'UNSAFE',
          message: `Exceeds permissible limit (>5 NTU). High coal/particulate suspension.`,
          safe: false
        };
      }
    }

    case 'temperature': {
      const { operationalMin, operationalMax } = thresholds.temperature;
      if (value >= operationalMin && value <= operationalMax) {
        return {
          status: 'NORMAL',
          message: `Standard operational temperature range (${operationalMin}°C–${operationalMax}°C)`,
          safe: true
        };
      } else {
        return {
          status: 'WARNING',
          message: `Temperature outside optimal membrane efficiency range (${operationalMin}°C–${operationalMax}°C)`,
          safe: true // Temperature is not a drinking safety parameter
        };
      }
    }

    case 'flowRate': {
      const { targetMin, targetMax } = thresholds.flowRate;
      if (value >= targetMin && value <= targetMax) {
        return {
          status: 'NORMAL',
          message: `Nominal system processing flow (${targetMin}–${targetMax} L/min)`,
          safe: true
        };
      } else if (value > 0 && value < targetMin) {
        return {
          status: 'WARNING',
          message: `Low processing flow (${value.toFixed(1)} L/min). Check pre-filter fouling or inlet pressure.`,
          safe: true // Operational only
        };
      } else if (value <= 0) {
        return {
          status: 'UNSAFE',
          message: `No flow detected. Pump or inlet blockage.`,
          safe: true
        };
      } else {
        return {
          status: 'WARNING',
          message: `High velocity flow (${value.toFixed(1)} L/min). Reduced UV-C contact time.`,
          safe: true
        };
      }
    }
  }
}

/**
 * Master Decision Engine
 * Determines: SAFE / RE-TREAT / REJECT with mathematical rationale
 */
export function evaluateWaterSafety(
  finalData: SensorData,
  thresholds: ParameterThresholds = DEFAULT_THRESHOLDS,
  systemFaultOverride?: string
): DecisionResult {
  const phEval = evaluateParameter('ph', finalData.ph, thresholds);
  const tdsEval = evaluateParameter('tds', finalData.tds, thresholds);
  const turbEval = evaluateParameter('turbidity', finalData.turbidity, thresholds);
  const tempEval = evaluateParameter('temperature', finalData.temperature, thresholds);
  const flowEval = evaluateParameter('flowRate', finalData.flowRate, thresholds);

  const reasons: string[] = [];
  let isCriticalReject = false;
  let recirculateNeeded = false;

  if (systemFaultOverride) {
    return {
      decision: 'REJECT',
      score: 15,
      statusColor: '#EF4444',
      reasons: [`Critical Hardware Interlock: ${systemFaultOverride}`],
      recommendedAction: 'Emergency shutdown active. Isolate manifold and inspect hardware.',
      recirculateNeeded: false,
      isCriticalReject: true,
      parametersEvaluation: {
        ph: phEval,
        tds: tdsEval,
        turbidity: turbEval,
        temperature: tempEval,
        flowRate: flowEval
      }
    };
  }

  // Check for REJECT criteria (exceeding permissible limit)
  if (finalData.tds > thresholds.tds.permissibleLimit) {
    isCriticalReject = true;
    reasons.push(
      `TDS is ${finalData.tds} mg/L (Exceeds BIS Permissible Limit of ${thresholds.tds.permissibleLimit} mg/L)`
    );
  }
  if (finalData.turbidity > thresholds.turbidity.permissibleLimit) {
    isCriticalReject = true;
    reasons.push(
      `Turbidity is ${finalData.turbidity.toFixed(1)} NTU (Exceeds BIS Permissible Limit of ${thresholds.turbidity.permissibleLimit} NTU)`
    );
  }
  if (finalData.ph < 5.8 || finalData.ph > 9.2) {
    isCriticalReject = true;
    reasons.push(
      `pH is ${finalData.ph.toFixed(1)} (Critical deviation beyond drinkable permissible threshold)`
    );
  }

  // Check for RE-TREAT criteria (exceeding acceptable but within permissible)
  if (!isCriticalReject) {
    if (finalData.tds > thresholds.tds.acceptableLimit) {
      recirculateNeeded = true;
      reasons.push(
        `TDS is ${finalData.tds} mg/L (Above acceptable limit of ${thresholds.tds.acceptableLimit} mg/L, but within permissible ${thresholds.tds.permissibleLimit} mg/L)`
      );
    }
    if (finalData.turbidity > thresholds.turbidity.acceptableLimit) {
      recirculateNeeded = true;
      reasons.push(
        `Turbidity is ${finalData.turbidity.toFixed(1)} NTU (Above acceptable 1.0 NTU, within permissible 5.0 NTU)`
      );
    }
    if (
      (finalData.ph >= 5.8 && finalData.ph < thresholds.ph.acceptableMin) ||
      (finalData.ph > thresholds.ph.acceptableMax && finalData.ph <= 9.2)
    ) {
      recirculateNeeded = true;
      reasons.push(
        `pH is ${finalData.ph.toFixed(1)} (Outside acceptable range ${thresholds.ph.acceptableMin}–${thresholds.ph.acceptableMax})`
      );
    }
  }

  let decision: WaterStatus;
  let statusColor: string;
  let recommendedAction: string;

  if (isCriticalReject) {
    decision = 'REJECT';
    statusColor = '#EF4444';
    recommendedAction =
      'Automatic diversion to reject drain. Do NOT route to clean water tank. Inspect membrane integrity or excessive raw water loading.';
  } else if (recirculateNeeded) {
    decision = 'RE-TREAT';
    statusColor = '#F59E0B';
    recommendedAction =
      'Actuate Recirculation Valve (V-REC). Re-pass water through RO/NF membrane polishing and secondary UV-C exposure.';
  } else {
    decision = 'SAFE';
    statusColor = '#10B981';
    reasons.push('All parameters (pH, TDS, Turbidity) meet BIS IS-10500 drinking water acceptable limits.');
    recommendedAction =
      'Safe for human consumption. Direct clean water to rural community storage reservoir.';
  }

  // Calculate Transparent Water Safety Index (0 to 100)
  // Contribution: TDS (35%), Turbidity (35%), pH (30%)
  const score = calculateWaterSafetyScore(finalData, thresholds);

  return {
    decision,
    score,
    statusColor,
    reasons,
    recommendedAction,
    recirculateNeeded,
    isCriticalReject,
    parametersEvaluation: {
      ph: phEval,
      tds: tdsEval,
      turbidity: turbEval,
      temperature: tempEval,
      flowRate: flowEval
    }
  };
}

/**
 * Transparent calculation of Water Safety Index (0-100)
 * Evaluates deviation from ideal points based on standards
 */
export function calculateWaterSafetyScore(
  data: SensorData,
  thresholds: ParameterThresholds = DEFAULT_THRESHOLDS
): number {
  // pH score: Ideal is 7.2 (range 6.5 to 8.5 gives 100 to 80 points)
  let phScore = 100;
  if (data.ph < 6.5) {
    const diff = 6.5 - data.ph;
    phScore = Math.max(0, 100 - diff * 35);
  } else if (data.ph > 8.5) {
    const diff = data.ph - 8.5;
    phScore = Math.max(0, 100 - diff * 35);
  } else {
    // Within 6.5 - 8.5
    const distFromNeutral = Math.abs(data.ph - 7.2);
    phScore = 100 - distFromNeutral * 8;
  }

  // TDS score: Ideal is 150-300 mg/L; <= 500 is 90-100, 500-2000 drops from 80 to 40, > 2000 drops to 10
  let tdsScore = 100;
  if (data.tds <= 300) {
    tdsScore = 100;
  } else if (data.tds <= thresholds.tds.acceptableLimit) {
    tdsScore = 95 - ((data.tds - 300) / 200) * 10;
  } else if (data.tds <= thresholds.tds.permissibleLimit) {
    const ratio = (data.tds - 500) / 1500;
    tdsScore = 80 - ratio * 45; // 80 down to 35
  } else {
    const excess = data.tds - thresholds.tds.permissibleLimit;
    tdsScore = Math.max(5, 30 - (excess / 1000) * 20);
  }

  // Turbidity score: Ideal <= 0.5 NTU (100); <= 1.0 (90); 1.0 - 5.0 (80 down to 30); > 5.0 (<20)
  let turbScore = 100;
  if (data.turbidity <= 0.5) {
    turbScore = 100;
  } else if (data.turbidity <= thresholds.turbidity.acceptableLimit) {
    turbScore = 95 - (data.turbidity - 0.5) * 15;
  } else if (data.turbidity <= thresholds.turbidity.permissibleLimit) {
    const ratio = (data.turbidity - 1.0) / 4.0;
    turbScore = 80 - ratio * 50; // 80 down to 30
  } else {
    const excess = data.turbidity - thresholds.turbidity.permissibleLimit;
    turbScore = Math.max(5, 25 - excess * 3);
  }

  const weighted = phScore * 0.3 + tdsScore * 0.35 + turbScore * 0.35;
  return Math.round(Math.min(100, Math.max(5, weighted)));
}

/**
 * Calculate dynamic reduction percentage
 */
export function calculateReduction(raw: number, final: number): number {
  if (raw <= 0) return 0;
  const reduction = ((raw - final) / raw) * 100;
  return Math.max(0, Math.min(100, parseFloat(reduction.toFixed(1))));
}
