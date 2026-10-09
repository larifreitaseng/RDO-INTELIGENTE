import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { RDOReport } from '../types';
import { generateRDOPDF } from '../lib/pdfGenerator';
import { RDOViewerModal } from './RDOViewerModal';
import {
  Building2,
  FileCheck2,
  Clock,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Plus,
  FileText,
  FileDown,
  ArrowRight,
  ChevronRight,
  FolderOpen,
  Eye,
  Edit2,
} from 'lucide-react';

interface DashboardViewProps {
  onNewRDO: () => void;
  onEditRDO: (rdo: RDOReport) => void;
  onOpenVoiceModal: () => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNewRDO,
  onEditRDO,
  onOpenVoiceModal,
  onNavigateTab,
}) => {
  const { isEditor, profile } = useAuth();
  const { works, rdos, activeWork, companies } = useData();
  const [viewingRDO, setViewingRDO] = useState<RDOReport | null>(null);

  // Metrics
  const activeWorksCount = works.filter((w) => w.status === 'Em andamento').length;
  const finalizedRdosCount = rdos.filter((r) => r.status === 'Finalizado').length;
  const draftRdosCount = rdos.filter((r) => r.status === 'Rascunho').length;

  const totalProgress = works.length
    ? Math.round(works.reduce((acc, w) => acc + (w.physicalProgress || 0), 0) / works.length)
    : 0;

  // Filter RDOs for current active work or global latest
  const recentRdos = [...rdos].sort((a, b) => (b.sequentialNumber || 0) - (a.sequentialNumber || 0)).slice(0, 5);

  // Recent occurrences
  const recentOccurrences = rdos
    .filter((r) => r.occurrences && !r.occurrences.toLowerCase().includes('sem ocorrências'))
    .slice(0, 3);

  const handleDownloadPDF = (rdo: RDOReport) => {
    const work = works.find((w) => w.id === rdo.workId) || activeWork;
    const company = companies.find((c) => c.id === work?.companyId) || companies[0];
    generateRDOPDF(rdo, work, company);
  };

  const currentViewingWork = viewingRDO ? works.find((w) => w.id === viewingRDO.workId) || activeWork : undefined;
  const currentViewingCompany = currentViewingWork ? companies.find((c) => c.id === currentViewingWork.companyId) || companies[0] : undefined;

  return (
    <div className="space-y-6">
      {/* Welcome e Quick Action Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 border border-slate-800 rounded-2xl p-5 sm:p-7 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Painel de Controle de Engenharia</span>
              {activeWork && (
                <span className="text-slate-400">• Obra: {activeWork.name}</span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Olá, {profile?.displayName || 'Engenheiro(a)'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Gerencie os Relatórios Diários de Obra com agilidade. Fale direto pelo celular ou elabore relatórios técnicos completos com validação por IA.
            </p>
          </div>

          {/* Quick Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {isEditor && (
              <button
                onClick={onOpenVoiceModal}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Gravar RDO por Voz</span>
              </button>
            )}

            {isEditor && (
              <button
                onClick={onNewRDO}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Novo RDO Manual</span>
              </button>
            )}

            <button
              onClick={() => onNavigateTab('documents')}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
              title="Abrir pasta no Google Drive"
            >
              <FolderOpen className="w-4 h-4 text-blue-400" />
              <span>Drive da Obra</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Obras Ativas */}
        <div
          onClick={() => onNavigateTab('works')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 transition shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Obras Ativas</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{activeWorksCount}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Total cadastradas: {works.length}</span>
            <ChevronRight className="w-3 h-3 ml-auto text-slate-500" />
          </div>
        </div>

        {/* Card 2: RDOs Emitidos (Finalizados) */}
        <div
          onClick={() => onNavigateTab('rdos')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 transition shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">RDOs Emitidos</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{finalizedRdosCount}</div>
          <div className="text-[11px] text-emerald-400/90 mt-1 flex items-center gap-1">
            <span>Prontos para PDF</span>
            <ChevronRight className="w-3 h-3 ml-auto text-slate-500" />
          </div>
        </div>

        {/* Card 3: RDOs Pendentes (Rascunhos) */}
        <div
          onClick={() => onNavigateTab('rdos')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 transition shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">RDOs Pendentes</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{draftRdosCount}</div>
          <div className="text-[11px] text-amber-400/90 mt-1 flex items-center gap-1">
            <span>Rascunhos em aberto</span>
            <ChevronRight className="w-3 h-3 ml-auto text-slate-500" />
          </div>
        </div>

        {/* Card 4: Avanço Físico Médio */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 transition shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Avanço Físico Médio</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{totalProgress}%</div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-full" style={{ width: `${totalProgress}%` }} />
          </div>
        </div>
      </div>

      {/* Main Split: Últimos RDOs e Ocorrências Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Últimos RDOs */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Últimos Relatórios Diários de Obra</span>
              </h3>
              <p className="text-xs text-slate-400">Histórico recente de emissões e rascunhos</p>
            </div>
            <button
              onClick={() => onNavigateTab('rdos')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentRdos.map((rdo) => (
              <div
                key={rdo.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div
                  onClick={() => setViewingRDO(rdo)}
                  className="space-y-1 cursor-pointer group flex-1"
                  title="Clique para visualizar o relatório sem editar"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm group-hover:text-amber-400 transition">
                      RDO #{String(rdo.sequentialNumber || 1).padStart(3, '0')}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        rdo.status === 'Finalizado'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {rdo.status}
                    </span>
                    {rdo.isDemo && (
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        [DADOS DE DEMONSTRAÇÃO]
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-300 font-medium truncate max-w-md">
                    {rdo.workName}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-3">
                    <span>Data: {rdo.date}</span>
                    <span>•</span>
                    <span>Avanço: {rdo.progressPercent || 0}%</span>
                    <span>•</span>
                    <span>Resp: {rdo.authorName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Visualizar direto sem editar */}
                  <button
                    onClick={() => setViewingRDO(rdo)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition flex items-center gap-1 border border-slate-700 cursor-pointer"
                    title="Visualizar relatório sem editar"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>Visualizar</span>
                  </button>

                  {isEditor && (
                    <button
                      onClick={() => onEditRDO(rdo)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                      title="Editar relatório"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDownloadPDF(rdo)}
                    className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition cursor-pointer"
                    title="Baixar PDF Técnico"
                  >
                    <FileDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (1 col): Ocorrências Recentes e Google Drive */}
        <div className="space-y-6">
          {/* Card Ocorrências Recentes */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <span>Ocorrências e Paralisações</span>
            </h3>

            {recentOccurrences.length > 0 ? (
              <div className="space-y-2.5">
                {recentOccurrences.map((r, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="font-semibold text-amber-400">RDO #{r.sequentialNumber} ({r.date})</span>
                      <span>{r.weatherMorning?.split(' ')[0]}</span>
                    </div>
                    <p className="text-slate-300 leading-snug">{r.occurrences}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950 text-slate-400 text-xs text-center">
                Nenhum imprevisto crítico registrado nos últimos relatórios.
              </div>
            )}
          </div>

          {/* Quick Drive Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-blue-400" />
                <span>Google Drive da Obra</span>
              </h3>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Organizado
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Estrutura de pastas automática vinculada a <strong>{activeWork?.name || 'Obra Ativa'}</strong>:
            </p>
            <div className="space-y-1 text-xs font-mono bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300">
              <div>📁 {activeWork?.code || 'OBRA'}/</div>
              <div className="pl-4">├── 📁 01_RDOs (PDFs emitidos)</div>
              <div className="pl-4">├── 📁 02_Fotos (Relatório fotográfico)</div>
              <div className="pl-4">└── ������ 03_Documentos (ARTs e projetos)</div>
            </div>
            <button
              onClick={() => onNavigateTab('documents')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Gerenciar Pastas e Arquivos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* RDO Viewer Modal */}
      <RDOViewerModal
        isOpen={!!viewingRDO}
        rdo={viewingRDO}
        work={currentViewingWork}
        company={currentViewingCompany}
        onClose={() => setViewingRDO(null)}
        onEdit={onEditRDO}
        isEditor={isEditor}
      />
    </div>
  );
};
