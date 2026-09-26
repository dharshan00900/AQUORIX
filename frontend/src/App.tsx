import { useState, useEffect } from 'react';
import { iotSimulator } from './services/iotSimulator';
import type { ActiveNavTab, DemoScenario, ParameterThresholds } from './types/aquorix';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DemoControlBar } from './components/DemoControlBar';
import { NotificationDrawer } from './components/NotificationDrawer';

// Views
import { OverviewView } from './views/OverviewView';
import { LiveMonitoringView } from './views/LiveMonitoringView';
import { WaterQualityView } from './views/WaterQualityView';
import { PurificationPipelineView } from './views/PurificationPipelineView';
import { DecisionEngineView } from './views/DecisionEngineView';
import { AlertsCenterView } from './views/AlertsCenterView';
import { AnalyticsView } from './views/AnalyticsView';
import { TreatmentHistoryView } from './views/TreatmentHistoryView';
import { SystemHealthView } from './views/SystemHealthView';
import { SettingsView } from './views/SettingsView';

export function App() {
  // Subscription state to force re-render on IoT telemetry updates
  const [, setTick] = useState(0);

  // UI Navigation & drawer state
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDemoBarOpen, setIsDemoBarOpen] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = iotSimulator.subscribe(() => {
      setTick(prev => prev + 1);
    });
    return () => unsubscribe();
  }, []);

  const handleToggleDemoMode = () => {
    iotSimulator.isDemoMode = !iotSimulator.isDemoMode;
    setIsDemoBarOpen(iotSimulator.isDemoMode);
    setTick(prev => prev + 1);
  };

  const handleSelectScenario = (scenario: DemoScenario) => {
    iotSimulator.triggerScenario(scenario);
  };

  const handleToggleActuator = (id: string) => {
    iotSimulator.toggleActuator(id);
  };

  const handleAcknowledgeAlert = (id: string) => {
    iotSimulator.acknowledgeAlert(id);
  };

  const handleClearAllAlerts = () => {
    iotSimulator.clearAllAlerts();
  };

  const handleMarkNotificationRead = (id: string) => {
    iotSimulator.markNotificationRead(id);
  };

  const handleMarkAllNotificationsRead = () => {
    iotSimulator.markAllNotificationsRead();
  };

  const handleUpdateThresholds = (updated: ParameterThresholds) => {
    iotSimulator.thresholds = updated;
    iotSimulator.evaluateCurrentState();
    setTick(prev => prev + 1);
  };

  const unreadNotifCount = iotSimulator.notifications.filter(n => !n.read).length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-canvas)' }}>
      {/* Top Sticky Header */}
      <Header
        iotStatus={iotSimulator.iotStatus}
        decision={iotSimulator.decision}
        isDemoMode={iotSimulator.isDemoMode}
        onToggleDemoMode={handleToggleDemoMode}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        unreadCount={unreadNotifCount}
      />

      {/* SIH Judge Demo / Presentation Control Bar */}
      {iotSimulator.isDemoMode && (
        <DemoControlBar
          activeScenario={iotSimulator.activeScenario}
          onSelectScenario={handleSelectScenario}
          isOpen={isDemoBarOpen}
          onToggleOpen={() => setIsDemoBarOpen(!isDemoBarOpen)}
          isPurificationRunning={iotSimulator.isPurificationRunning}
        />
      )}

      {/* Main Layout: Left Sidebar + Content Area */}
      <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 72px)' }}>
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          alertCount={iotSimulator.alerts.length}
          waterStatus={iotSimulator.decision.decision}
        />

        {/* Center Content Workspace */}
        <main
          style={{
            flex: 1,
            padding: '24px 28px 48px 28px',
            maxWidth: '1600px',
            margin: '0 auto',
            width: '100%',
            overflowX: 'hidden'
          }}
        >
          {activeTab === 'overview' && (
            <OverviewView
              rawWater={iotSimulator.rawWater}
              finalWater={iotSimulator.finalWater}
              decision={iotSimulator.decision}
              stages={iotSimulator.stages}
              actuators={iotSimulator.actuators}
              iotStatus={iotSimulator.iotStatus}
              alerts={iotSimulator.alerts}
              history={iotSimulator.treatmentHistory}
              volumeStats={iotSimulator.volumeStats}
              thresholds={iotSimulator.thresholds}
              isRunning={iotSimulator.isPurificationRunning}
              onToggleActuator={handleToggleActuator}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'live' && (
            <LiveMonitoringView
              rawWater={iotSimulator.rawWater}
              finalWater={iotSimulator.finalWater}
              decision={iotSimulator.decision}
              volumeStats={iotSimulator.volumeStats}
              thresholds={iotSimulator.thresholds}
            />
          )}

          {activeTab === 'quality' && (
            <WaterQualityView
              rawWater={iotSimulator.rawWater}
              finalWater={iotSimulator.finalWater}
              decision={iotSimulator.decision}
              thresholds={iotSimulator.thresholds}
            />
          )}

          {activeTab === 'purification' && (
            <PurificationPipelineView
              stages={iotSimulator.stages}
              actuators={iotSimulator.actuators}
              recirculationStatus={iotSimulator.recirculationStatus}
              recirculationCycle={iotSimulator.recirculationCycle}
              maxCycles={iotSimulator.maxRecirculationCycles}
              isRunning={iotSimulator.isPurificationRunning}
              onToggleActuator={handleToggleActuator}
            />
          )}

          {activeTab === 'decision' && (
            <DecisionEngineView
              finalWater={iotSimulator.finalWater}
              decision={iotSimulator.decision}
              thresholds={iotSimulator.thresholds}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertsCenterView
              alerts={iotSimulator.alerts}
              onAcknowledge={handleAcknowledgeAlert}
              onClearAll={handleClearAllAlerts}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              trendHistory={iotSimulator.trendHistory}
              thresholds={iotSimulator.thresholds}
            />
          )}

          {activeTab === 'history' && (
            <TreatmentHistoryView history={iotSimulator.treatmentHistory} />
          )}

          {activeTab === 'health' && (
            <SystemHealthView
              filters={iotSimulator.filterHealth}
              iotStatus={iotSimulator.iotStatus}
              actuators={iotSimulator.actuators}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              thresholds={iotSimulator.thresholds}
              onUpdateThresholds={handleUpdateThresholds}
            />
          )}
        </main>
      </div>

      {/* Slide-over Real-time Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={iotSimulator.notifications}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
      />
    </div>
  );
}

export default App;
