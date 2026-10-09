import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { User, Shield, CheckCircle2, ShieldAlert, KeyRound } from 'lucide-react';

export const UsersView: React.FC = () => {
  const { profile, switchUserRole } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-amber-400" />
          <span>Gerenciamento de Perfis de Acesso e Usuários</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Controle de permissões baseado em funções (RBAC): perfil <strong>Editor</strong> com permissões completas de escrita e finalização; perfil <strong>Visualizador</strong> com permissões estritas de leitura.
        </p>
      </div>

      {/* Current User Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-lg">
              {profile?.displayName?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{profile?.displayName}</h3>
              <p className="text-xs text-slate-400">{profile?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Shield className="w-3.5 h-3.5" />
            <span>Perfil Atual: {profile?.role}</span>
          </div>
        </div>

        {/* Permissions Matrix */}
        <div className="space-y-3 pt-2">
          <div className="text-xs font-semibold text-slate-300">
            Alternar perfil ativo para simulação de permissões:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Editor Box */}
            <div
              onClick={() => switchUserRole('Editor')}
              className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                profile?.role === 'Editor'
                  ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>Perfil: Editor</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Permissão total de engenheiro residente e gestor de obra.
                  </p>
                </div>
                {profile?.role === 'Editor' && (
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                )}
              </div>

              <div className="text-[11px] text-slate-300 space-y-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                <div className="text-emerald-400 font-semibold">✓ Criar e editar RDOs</div>
                <div className="text-emerald-400 font-semibold">✓ Gravar áudio por voz com IA</div>
                <div className="text-emerald-400 font-semibold">✓ Finalizar relatórios e gerar PDF</div>
                <div className="text-emerald-400 font-semibold">✓ Cadastrar obras, empresas e equipes</div>
              </div>
            </div>

            {/* Visualizador Box */}
            <div
              onClick={() => switchUserRole('Visualizador')}
              className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                profile?.role === 'Visualizador'
                  ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span>Perfil: Visualizador</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Permissão de auditoria, fiscalização externa e contratante.
                  </p>
                </div>
                {profile?.role === 'Visualizador' && (
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                )}
              </div>

              <div className="text-[11px] text-slate-300 space-y-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                <div className="text-emerald-400 font-semibold">✓ Consultar todos os RDOs e obras</div>
                <div className="text-emerald-400 font-semibold">✓ Baixar PDFs e fotos oficiais</div>
                <div className="text-red-400 font-semibold">✗ Bloqueado para criar ou alterar dados</div>
                <div className="text-red-400 font-semibold">✗ Bloqueado para excluir registros</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
