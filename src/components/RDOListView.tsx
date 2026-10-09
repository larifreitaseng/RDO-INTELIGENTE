import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { RDOReport } from '../types';
import { generateRDOPDF } from '../lib/pdfGenerator';
import { RDOViewerModal } from './RDOViewerModal';
import {
  FileText,
  Plus,
  Sparkles,
  Search,
  Filter,
  FileDown,
  Edit2,
  Trash2,
  Calendar,
  Eye,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';

interface RDOListViewProps {
  onNewRDO: () => void;
  onEditRDO: (rdo: RDOReport) => void;
  onOpenVoiceModal: () => void;
}

export const RDOListView: React.FC<RDOListViewProps> = ({
  onNewRDO,
  onEditRDO,
  onOpenVoiceModal,
}) => {
  const { isEditor } = useAuth();
  const { rdos, works, selectedWorkId, setSelectedWorkId, deleteRDO, companies, activeWork } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'Todos' | 'Finalizado' | 'Rascunho'>('Todos');
  const [filterWork, setFilterWork] = useState<string>('all');
  const [viewingRDO, setViewingRDO] = useState<RDOReport | null>(null);

  const filteredRdos = rdos.filter((r) => {
    const matchesSearch =
      r.activities?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.date?.includes(searchTerm) ||
      r.workName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(r.sequentialNumber).includes(searchTerm);

    const matchesStatus = filterStatus === 'Todos' || r.status === filterStatus;
    const matchesWork = filterWork === 'all' || r.workId === filterWork;

    return matchesSearch && matchesStatus && matchesWork;
  });

  const handleDownloadPDF = (rdo: RDOReport) => {
    const work = works.find((w) => w.id === rdo.workId) || activeWork;
    const company = companies.find((c) => c.id === work?.companyId) || companies[0];
    generateRDOPDF(rdo, work, company);
  };

  const currentViewingWork = viewingRDO ? works.find((w) => w.id === viewingRDO.workId) || activeWork : undefined;
  const currentViewingCompany = currentViewingWork ? companies.find((c) => c.id === currentViewingWork.companyId) || companies[0] : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span>Relatórios Diários de Obra (RDO)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Consulte, elabore, edite, finalize e exporte relatórios técnicos diários em formato PDF oficial.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isEditor && (
            <button
              onClick={onOpenVoiceModal}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Gravar com IA</span>
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
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por atividade, data ou nº..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Work Filter */}
          <select
            value={filterWork}
            onChange={(e) => setFilterWork(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value="all">Todas as Obras</option>
            {works.map((w) => (
              <option key={w.id} value={w.id}>
                {w.code} - {w.name}
              </option>
            ))}
          </select>

          {/* Status Tabs */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
            {(['Todos', 'Finalizado', 'Rascunho'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  filterStatus === st ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RDOs List */}
      <div className="space-y-3">
        {filteredRdos.length > 0 ? (
          filteredRdos.map((rdo) => (
            <div
              key={rdo.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-lg transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div
                onClick={() => setViewingRDO(rdo)}
                className="space-y-1.5 flex-1 cursor-pointer group"
                title="Clique para visualizar o relatório completo sem editar"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-white text-base group-hover:text-amber-400 transition">
                    RDO #{String(rdo.sequentialNumber || 1).padStart(3, '0')}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      rdo.status === 'Finalizado'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {rdo.status}
                  </span>
                  <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" /> {rdo.date}
                  </span>
                  {rdo.isDemo && (
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      [DADOS DE DEMONSTRAÇÃO]
                    </span>
                  )}
                </div>

                <div className="text-sm font-semibold text-slate-200">{rdo.workName}</div>

                <p className="text-xs text-slate-300 line-clamp-2 max-w-3xl leading-relaxed">
                  <strong className="text-slate-400 font-medium">Atividades: </strong>
                  {rdo.activities || 'Nenhuma atividade detalhada ainda.'}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-1">
                  <span>
                    Clima: <strong className="text-slate-300">{rdo.weatherMorning || 'N/A'}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Avanço: <strong className="text-amber-400">{rdo.progressPercent || 0}%</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Elaborador: <strong className="text-slate-300">{rdo.authorName}</strong>
                  </span>
                  {rdo.photos && rdo.photos.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-amber-400 font-medium">📷 {rdo.photos.length} fotos anexadas</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                {/* Visualizar Relatório Direto (Sem Editar) */}
                <button
                  onClick={() => setViewingRDO(rdo)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition flex items-center gap-1.5 border border-slate-700 cursor-pointer shadow-sm"
                  title="Visualizar o relatório completo sem editar"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>Visualizar</span>
                </button>

                {/* Editar RDO (se for Editor) */}
                {isEditor && (
                  <button
                    onClick={() => onEditRDO(rdo)}
                    className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                    title="Editar informações deste relatório"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                )}

                {/* Gerar PDF */}
                <button
                  onClick={() => handleDownloadPDF(rdo)}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
                  title="Gerar e Baixar PDF"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>

                {isEditor && (
                  <button
                    onClick={() => {
                      if (confirm(`Excluir o RDO #${rdo.sequentialNumber}?`)) {
                        deleteRDO(rdo.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition cursor-pointer"
                    title="Excluir RDO"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs space-y-2">
            <FileText className="w-8 h-8 mx-auto text-slate-600" />
            <p className="font-semibold text-slate-300">Nenhum Relatório Diário de Obra encontrado.</p>
            <p>Clique em "Novo RDO Manual" ou utilize a "IA por Voz" para registrar o dia da obra.</p>
          </div>
        )}
      </div>

      {/* RDO Viewer Modal (Visualização Sem Editar) */}
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
