import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContext';
import { LandingPage } from './components/LandingPage';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { WorksView } from './components/WorksView';
import { RDOListView } from './components/RDOListView';
import { CompaniesView } from './components/CompaniesView';
import { TeamView } from './components/TeamView';
import { DocumentsView } from './components/DocumentsView';
import { UsersView } from './components/UsersView';
import { SettingsView } from './components/SettingsView';
import { RDOEditor } from './components/RDOEditor';
import { VoiceAIModal } from './components/VoiceAIModal';
import { RDOReport, AIParsedRDO } from './types';
import { HardHat, Sparkles } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const { activeWork } = useData();

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [editingRDO, setEditingRDO] = useState<RDOReport | undefined>(undefined);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [appliedAIData, setAppliedAIData] = useState<AIParsedRDO | null>(null);

  // While verifying authentication, display neutral splash without exposing internal data
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 animate-pulse">
          <HardHat className="w-8 h-8" />
        </div>
        <div className="text-sm font-semibold text-white">Carregando RDO Inteligente...</div>
        <div className="text-xs text-slate-500">Verificando credenciais e integridade de acesso</div>
      </div>
    );
  }

  // Not authenticated: strictly show Landing Page
  if (!user) {
    return <LandingPage />;
  }

  const handleNewRDO = () => {
    setEditingRDO(undefined);
    setCurrentTab('rdo-editor');
  };

  const handleEditRDO = (rdo: RDOReport) => {
    setEditingRDO(rdo);
    setCurrentTab('rdo-editor');
  };

  const handleApplyVoiceData = (data: AIParsedRDO) => {
    setAppliedAIData(data);
    setCurrentTab('rdo-editor');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Background technical grid pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b14_1px,transparent_1px),linear-gradient(to_bottom,#1e293b14_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Header with Navigation & User Profile */}
      <Header
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab !== 'rdo-editor') setEditingRDO(undefined);
          setCurrentTab(tab);
        }}
        onOpenVoiceModal={() => setVoiceModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1">
        {currentTab === 'dashboard' && (
          <DashboardView
            onNewRDO={handleNewRDO}
            onEditRDO={handleEditRDO}
            onOpenVoiceModal={() => setVoiceModalOpen(true)}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'works' && <WorksView />}

        {currentTab === 'rdos' && (
          <RDOListView
            onNewRDO={handleNewRDO}
            onEditRDO={handleEditRDO}
            onOpenVoiceModal={() => setVoiceModalOpen(true)}
          />
        )}

        {currentTab === 'companies' && <CompaniesView />}

        {currentTab === 'team' && <TeamView />}

        {currentTab === 'documents' && <DocumentsView />}

        {currentTab === 'users' && <UsersView />}

        {currentTab === 'settings' && <SettingsView />}

        {currentTab === 'rdo-editor' && (
          <RDOEditor
            initialRDO={editingRDO}
            onBack={() => setCurrentTab('rdos')}
            onOpenVoiceModal={() => setVoiceModalOpen(true)}
            appliedAIData={appliedAIData}
            onClearAIData={() => setAppliedAIData(null)}
          />
        )}
      </main>

      {/* Global Voice AI Modal */}
      <VoiceAIModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onApplyParsedData={handleApplyVoiceData}
        workName={activeWork?.name}
      />

      {/* Minimal Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/80 px-4 py-4 text-center text-[11px] text-slate-500">
        RDO Inteligente • Sistema para Engenharia Civil com IA por Voz • CONFEA • CREA-SP • MÚTUA
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainLayout />
      </DataProvider>
    </AuthProvider>
  );
}
