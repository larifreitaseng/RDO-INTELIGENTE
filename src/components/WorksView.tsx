import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Work, WorkStatus } from '../types';
import {
  Building,
  Plus,
  FolderOpen,
  Calendar,
  UserCheck,
  Check,
  X,
  ExternalLink,
  Edit2,
  Trash2,
  Percent,
} from 'lucide-react';

export const WorksView: React.FC = () => {
  const { isEditor } = useAuth();
  const { works, selectedWorkId, setSelectedWorkId, addWork, updateWork, deleteWork, companies } = useData();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<Work | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    clientName: '',
    address: '',
    technicalLead: 'Engª. Larissa Freitas',
    creaCau: 'CREA-SP 506.123/D',
    startDate: '',
    expectedEndDate: '',
    status: 'Em andamento' as WorkStatus,
    physicalProgress: 0,
    driveFolderUrl: '',
    companyId: '',
  });

  const openNew = () => {
    setEditingWork(null);
    setFormData({
      code: `OBRA-${new Date().getFullYear()}/0${works.length + 1}`,
      name: '',
      clientName: '',
      address: '',
      technicalLead: 'Engª. Larissa Freitas',
      creaCau: 'CREA-SP 506.123/D',
      startDate: new Date().toISOString().split('T')[0],
      expectedEndDate: '',
      status: 'Em andamento',
      physicalProgress: 0,
      driveFolderUrl: '',
      companyId: companies[0]?.id || '',
    });
    setModalOpen(true);
  };

  const openEdit = (work: Work) => {
    setEditingWork(work);
    setFormData({
      code: work.code,
      name: work.name,
      clientName: work.clientName,
      address: work.address,
      technicalLead: work.technicalLead,
      creaCau: work.creaCau,
      startDate: work.startDate,
      expectedEndDate: work.expectedEndDate,
      status: work.status,
      physicalProgress: work.physicalProgress,
      driveFolderUrl: work.driveFolderUrl || '',
      companyId: work.companyId || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    if (editingWork) {
      await updateWork(editingWork.id, formData);
    } else {
      await addWork(formData);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-amber-400" />
            <span>Gestão de Obras e Empreendimentos</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Cadastre os canteiros de obra, vincule contratos, responsáveis técnicos e pastas do Google Drive.
          </p>
        </div>

        {isEditor && (
          <button
            onClick={openNew}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Nova Obra</span>
          </button>
        )}
      </div>

      {/* Grid of Works */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {works.map((work) => {
          const isSelected = selectedWorkId === work.id;
          return (
            <div
              key={work.id}
              className={`bg-slate-900 border rounded-2xl p-5 transition flex flex-col justify-between shadow-xl relative ${
                isSelected ? 'border-amber-500/80 ring-1 ring-amber-500/40' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>Obra Ativa</span>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-start justify-between pr-20">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {work.code}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-white leading-snug">{work.name}</h3>
                  {work.isDemo && (
                    <span className="inline-block mt-1 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      [DADOS DE DEMONSTRAÇÃO]
                    </span>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    Cliente: <strong className="text-slate-300">{work.clientName}</strong>
                  </p>
                  <p className="text-xs text-slate-400 truncate">Endereço: {work.address}</p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Avanço Físico:</span>
                    <span className="font-bold text-amber-400">{work.physicalProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-amber-600 h-full transition-all"
                      style={{ width: `${work.physicalProgress}%` }}
                    />
                  </div>
                </div>

                {/* Technical Lead & CREA */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span className="truncate">{work.technicalLead}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 pl-5">CREA/CAU: {work.creaCau}</div>
                </div>

                {/* Dates */}
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" /> Início: {work.startDate || 'N/A'}
                  </span>
                  <span>Término: {work.expectedEndDate || 'N/A'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedWorkId(work.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {isSelected ? 'Selecionada' : 'Definir como Ativa'}
                </button>

                <div className="flex items-center gap-1.5">
                  {work.driveFolderUrl && (
                    <a
                      href={work.driveFolderUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition"
                      title="Abrir pasta no Google Drive"
                    >
                      <FolderOpen className="w-4 h-4" />
                    </a>
                  )}

                  {isEditor && (
                    <>
                      <button
                        onClick={() => openEdit(work)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        title="Editar Obra"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir a obra "${work.name}"?`)) {
                            deleteWork(work.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition"
                        title="Excluir Obra"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Cadastro/Edição de Obra */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-base text-white">
                {editingWork ? 'Editar Obra' : 'Cadastrar Nova Obra'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Código da Obra *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Em andamento">Em andamento</option>
                    <option value="Concluída">Concluída</option>
                    <option value="Paralisada">Paralisada</option>
                    <option value="Planejamento">Planejamento</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome da Obra *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Edifício Residencial Horizon Tower"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Cliente / Contratante *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Incorporadora Vanguarda S/A"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Endereço Completo</label>
                <input
                  type="text"
                  placeholder="Ex: Av. Paulista, 1850 - São Paulo, SP"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Responsável Técnico *</label>
                  <input
                    type="text"
                    required
                    value={formData.technicalLead}
                    onChange={(e) => setFormData({ ...formData, technicalLead: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">CREA / CAU *</label>
                  <input
                    type="text"
                    required
                    value={formData.creaCau}
                    onChange={(e) => setFormData({ ...formData, creaCau: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Data Início</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Término Previsto</label>
                  <input
                    type="date"
                    value={formData.expectedEndDate}
                    onChange={(e) => setFormData({ ...formData, expectedEndDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Avanço Físico (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.physicalProgress}
                    onChange={(e) => setFormData({ ...formData, physicalProgress: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Pasta Vinculada no Google Drive</label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={formData.driveFolderUrl}
                  onChange={(e) => setFormData({ ...formData, driveFolderUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md cursor-pointer"
                >
                  {editingWork ? 'Salvar Alterações' : 'Cadastrar Obra'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
