import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Company } from '../types';
import { Briefcase, Plus, UserCheck, Phone, Mail, X, Shield, Building } from 'lucide-react';

export const CompaniesView: React.FC = () => {
  const { isEditor } = useAuth();
  const { companies, addCompany } = useData();

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    corporateName: '',
    tradeName: '',
    cnpj: '',
    contact: '',
    technicalLead: 'Engª. Larissa Freitas',
    creaCau: 'CREA-SP 506.123/D',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.corporateName || !formData.cnpj) return;
    await addCompany(formData);
    setModalOpen(false);
    setFormData({
      corporateName: '',
      tradeName: '',
      cnpj: '',
      contact: '',
      technicalLead: 'Engª. Larissa Freitas',
      creaCau: 'CREA-SP 506.123/D',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-400" />
            <span>Empresas e Construtoras</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Cadastre as empresas contratantes, construtoras e empreiteiras parceiras da obra.
          </p>
        </div>

        {isEditor && (
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Empresa</span>
          </button>
        )}
      </div>

      {/* Grid of Companies */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {companies.map((comp) => (
          <div
            key={comp.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Building className="w-5 h-5" />
                </span>
                {comp.isDemo && (
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    [DADOS DE DEMONSTRAÇÃO]
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-base text-white">{comp.tradeName || comp.corporateName}</h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">{comp.corporateName}</p>
                <div className="text-xs font-mono text-slate-400 mt-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 w-fit">
                  CNPJ: {comp.cnpj}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <div className="text-[11px] font-semibold text-slate-400">Responsável Técnico / Registro:</div>
                <div className="font-medium text-slate-200 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>{comp.technicalLead}</span>
                </div>
                <div className="text-[11px] text-amber-400/90 font-mono pl-5">
                  CREA/CAU: {comp.creaCau}
                </div>
              </div>

              {comp.contact && (
                <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{comp.contact}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nova Empresa */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-base text-white">Cadastrar Empresa / Construtora</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Razão Social *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Engenharia e Construções Aliança Ltda"
                  value={formData.corporateName}
                  onChange={(e) => setFormData({ ...formData, corporateName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome Fantasia *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aliança Construtora"
                  value={formData.tradeName}
                  onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">CNPJ *</label>
                <input
                  type="text"
                  required
                  placeholder="00.000.000/0001-00"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Contato (Telefone / E-mail)</label>
                <input
                  type="text"
                  placeholder="contato@empresa.com.br | (11) 99999-9999"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
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
                  Salvar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
