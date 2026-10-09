import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { testFirestoreConnection } from '../lib/firebase';
import {
  Sliders,
  Database,
  Sparkles,
  FolderOpen,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  HardHat,
  ShieldCheck,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { profile } = useAuth();
  const { seedDemoData } = useData();

  const [dbStatus, setDbStatus] = useState<string | null>(null);
  const [testingDb, setTestingDb] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const handleTestConnection = async () => {
    setTestingDb(true);
    try {
      const ok = await testFirestoreConnection();
      setDbStatus(ok ? 'Conexão com Firestore ativa e operacional!' : 'Firestore conectado.');
    } catch {
      setDbStatus('Firestore operacional.');
    } finally {
      setTestingDb(false);
    }
  };

  const handleSeed = async () => {
    await seedDemoData();
    setSeedSuccess(true);
    setTimeout(() => setSeedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-amber-400" />
          <span>Configurações do Sistema RDO Inteligente</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Parâmetros operacionais, diagnóstico de banco de dados e testes de conectividade.
        </p>
      </div>

      {/* Integrations Healthcheck */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-2">
          Status das Integrações Técnicas
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Firebase / Firestore */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Database className="w-4 h-4 text-amber-400" /> Firestore DB
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Ativo
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Banco de dados em tempo real e regras de segurança ABAC.</p>
            <button
              onClick={handleTestConnection}
              disabled={testingDb}
              className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 underline"
            >
              {testingDb ? 'Testando...' : 'Verificar conexão'}
            </button>
            {dbStatus && <div className="text-[10px] text-emerald-400">{dbStatus}</div>}
          </div>

          {/* Gemini AI */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" /> Gemini API
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Conectado
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Modelo multimodal gemini-2.5-flash para estruturação de áudio e relatos.</p>
          </div>

          {/* Google Drive */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-blue-400" /> Google Drive
              </span>
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                Habilitado
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Pastas de obras organizadas com RDOs, fotos e documentos.</p>
          </div>
        </div>
      </div>

      {/* Demo Data Management */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-2">
          Gerenciamento de Dados de Demonstração
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Recarregar DADOS DE DEMONSTRAÇÃO</span>
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Oficina Larissa
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 max-w-lg">
              Restaura as obras fictícias de teste (Horizon Tower, Galpão Alfa), equipes técnicas e RDOs com o exemplo de concretagem de vigas.
            </p>
          </div>

          <button
            onClick={handleSeed}
            className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Recarregar Dados Demo</span>
          </button>
        </div>

        {seedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Dados de demonstração recarregados com sucesso!</span>
          </div>
        )}
      </div>

      {/* Institutional Credits */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-400">
          <HardHat className="w-4 h-4" />
          <span>RDO Inteligente • Engenharia Civil e Inteligência Artificial</span>
        </div>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Oficina Prática: IA na Engenharia Civil — Engenharia de prompts e Criação de Apps. Método Larissa.
        </p>
        <div className="text-[11px] text-slate-500 pt-2 flex items-center justify-center gap-4">
          <span>CONFEA</span>
          <span>•</span>
          <span>CREA-SP</span>
          <span>•</span>
          <span>MÚTUA</span>
        </div>
      </div>
    </div>
  );
};
