import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { TeamCategory, TeamMember } from '../types';
import { Users, Plus, Phone, Mail, Building, Trash2, X, HardHat, Award } from 'lucide-react';

export const TeamView: React.FC = () => {
  const { isEditor } = useAuth();
  const { teamMembers, works, addTeamMember, deleteTeamMember, selectedWorkId } = useData();

  const [modalOpen, setModalOpen] = useState(false);
  const [filterWork, setFilterWork] = useState<string>('all');

  const [formData, setFormData] = useState({
    name: '',
    category: 'Engenheiro' as TeamCategory,
    role: '',
    company: 'Aliança Construtora',
    phone: '',
    email: '',
    workId: selectedWorkId || '',
  });

  const filteredMembers = teamMembers.filter((m) => {
    return filterWork === 'all' || m.workId === filterWork;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.role) return;

    await addTeamMember({
      ...formData,
      workId: formData.workId || works[0]?.id || '',
    });
    setModalOpen(false);
    setFormData({
      name: '',
      category: 'Engenheiro',
      role: '',
      company: 'Aliança Construtora',
      phone: '',
      email: '',
      workId: selectedWorkId || '',
    });
  };

  const getCategoryColor = (cat: TeamCategory) => {
    switch (cat) {
      case 'Engenheiro':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Mestre':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Encarregado':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Estagiário':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>Equipe Técnica do Canteiro</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gestão de engenheiros, mestres de obras, encarregados, estagiários e equipes vinculadas às frentes de trabalho.
          </p>
        </div>

        {isEditor && (
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Integrante</span>
          </button>
        )}
      </div>

      {/* Filter by Work */}
      <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <span className="text-xs text-slate-400 font-semibold">Filtrar por Obra:</span>
        <select
          value={filterWork}
          onChange={(e) => setFilterWork(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
        >
          <option value="all">Todas as Obras ({teamMembers.length} integrantes)</option>
          {works.map((w) => (
            <option key={w.id} value={w.id}>
              {w.code} - {w.name}
            </option>
          ))}
        </select>
      </div>

      {/* Grid of Team Members */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMembers.map((member) => {
          const workLinked = works.find((w) => w.id === member.workId);
          return (
            <div
              key={member.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getCategoryColor(
                      member.category
                    )}`}
                  >
                    {member.category}
                  </span>
                  {member.isDemo && (
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      [DEMO]
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-base text-white">{member.name}</h3>
                  <p className="text-xs font-semibold text-amber-400 mt-0.5">{member.role}</p>
                  <p className="text-xs text-slate-400 mt-1">Empresa: {member.company}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="text-[11px] text-slate-400">Obra Vinculada:</div>
                  <div className="font-medium text-slate-200 truncate flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{workLinked?.name || 'Obra Geral'}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-400">
                  {member.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                  {member.email && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {isEditor && (
                <div className="pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => {
                      if (confirm(`Remover "${member.name}" da equipe?`)) {
                        deleteTeamMember(member.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition"
                    title="Remover integrante"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Novo Integrante */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-base text-white">Cadastrar Integrante da Equipe</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Valdomiro Pereira da Silva"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Categoria *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Engenheiro">Engenheiro</option>
                    <option value="Mestre">Mestre de Obras</option>
                    <option value="Encarregado">Encarregado</option>
                    <option value="Estagiário">Estagiário</option>
                    <option value="Outro">Demais Integrantes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Função / Cargo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mestre Geral de Obras"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Vincular à Obra *</label>
                  <select
                    value={formData.workId}
                    onChange={(e) => setFormData({ ...formData, workId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    {works.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.code} - {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Empresa</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">E-mail</label>
                  <input
                    type="email"
                    placeholder="nome@empresa.com.br"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
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
                  Salvar Integrante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
