import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  HardHat,
  Sparkles,
  ShieldCheck,
  FileText,
  Mic,
  FolderSync,
  Lock,
  Mail,
  UserCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { UserRole } from '../types';

export const LandingPage: React.FC = () => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, resetPassword, loginDemo, loading } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('Editor');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        if (!email || !password) {
          setErrorMsg('Por favor, informe e-mail e senha.');
          return;
        }
        await loginWithEmail(email, password);
      } else if (mode === 'register') {
        if (!email || !password || !name) {
          setErrorMsg('Preencha todos os campos obrigatórios.');
          return;
        }
        if (password.length < 6) {
          setErrorMsg('A senha deve ter pelo menos 6 caracteres.');
          return;
        }
        await registerWithEmail(email, password, name, role);
      } else if (mode === 'forgot') {
        if (!email) {
          setErrorMsg('Digite seu e-mail para receber as instruções de recuperação.');
          return;
        }
        await resetPassword(email);
        setSuccessMsg('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
      }
    } catch (err: any) {
      console.error('Auth error caught:', err);
      if (err.code === 'auth/email-already-in-use') {
        setMode('login');
        setErrorMsg('Este e-mail já possui cadastro no sistema. Digite sua senha para entrar, use "Entrar com Google" ou clique no botão de Acesso Rápido abaixo.');
      } else if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        setErrorMsg('Credenciais não reconhecidas pelo Firebase. Se você já tem conta vinculada ao Google, utilize "Entrar com Google" ou clique no botão de Acesso Imediato abaixo.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('A senha informada deve ter pelo menos 6 caracteres.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setErrorMsg('Login por e-mail/senha não habilitado no Firebase Console. Utilize "Entrar com Google" ou o Acesso Rápido.');
      } else {
        setErrorMsg(err.message || 'Erro ao processar autenticação.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Não foi possível entrar com Google. Tente pelo e-mail ou modo demonstração.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      {/* Background architectural grid pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b18_1px,transparent_1px),linear-gradient(to_bottom,#1e293b18_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950">
            <HardHat className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">RDO Inteligente</span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Engenharia Civil
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Gestão inteligente do dia a dia da sua obra</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loginDemo('Editor')}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Entrar como Demo (Editor)</span>
          </button>
        </div>
      </header>

      {/* Hero e Login Section */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex-1 flex flex-col lg:flex-row items-center justify-between gap-10">
        {/* Left Column: Apresentação e Recursos */}
        <div className="lg:w-1/2 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-amber-400 text-xs font-medium shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Oficina Prática: IA na Engenharia Civil • Método Larissa</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Relatórios Diários de Obra com{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400">
              Inteligência Artificial por Voz
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Elimine a burocracia do canteiro. Grave áudios rápidos no celular, deixe o Gemini estruturar clima, atividades,
            mão de obra e materiais, anexe fotos e emita o PDF oficial em minutos.
          </p>

          {/* Core Feature Badges */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">IA por Voz no Celular</h4>
                <p className="text-xs text-slate-400 mt-0.5">Fale os serviços do dia e a IA preenche o formulário.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">PDF Técnico Oficial</h4>
                <p className="text-xs text-slate-400 mt-0.5">Cabeçalho, fotos legendadas e 3 campos de assinatura.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Gestão Segregada</h4>
                <p className="text-xs text-slate-400 mt-0.5">Obras, empresas contratadas e equipe técnica vinculada.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                <FolderSync className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Google Drive Nativo</h4>
                <p className="text-xs text-slate-400 mt-0.5">Pastas automáticas de RDOs, fotos e documentos da obra.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="w-full lg:w-[440px]">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-slate-800 mb-6">
              <button
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                }}
                className={`flex-1 pb-3 text-sm font-semibold transition border-b-2 ${
                  mode === 'login'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => {
                  setMode('register');
                  setErrorMsg(null);
                }}
                className={`flex-1 pb-3 text-sm font-semibold transition border-b-2 ${
                  mode === 'register'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Cadastrar
              </button>
            </div>

            <div className="mb-4">
              <h3 className="text-xl font-bold text-white">
                {mode === 'login' && 'Acesse sua conta'}
                {mode === 'register' && 'Criar nova conta técnica'}
                {mode === 'forgot' && 'Recuperar acesso'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {mode === 'login' && 'Ambiente seguro para engenheiros e fiscais de obra.'}
                {mode === 'register' && 'Cadastre-se como Editor ou Visualizador.'}
                {mode === 'forgot' && 'Insira seu e-mail para redefinir sua senha.'}
              </p>
            </div>

            {/* Alerts */}
            {errorMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
                <div className="pt-2 border-t border-red-500/20 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => loginDemo('Editor', email || 'larifreitaseng@gmail.com', name || 'Engª. Larissa Freitas')}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px] shadow hover:bg-amber-400 transition cursor-pointer"
                  >
                    Acessar Imediatamente como Editor
                  </button>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-[11px] font-medium hover:bg-slate-700 transition cursor-pointer"
                  >
                    Tentar com Google
                  </button>
                </div>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Nome completo / Título</label>
                    <input
                      type="text"
                      placeholder="Ex: Engª. Larissa Freitas"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Perfil de Acesso</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('Editor')}
                        className={`p-2 rounded-xl text-xs font-medium border text-left transition ${
                          role === 'Editor'
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="font-semibold text-white">Editor</div>
                        <div className="text-[10px] text-slate-400">Criar, editar e finalizar RDOs</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole('Visualizador')}
                        className={`p-2 rounded-xl text-xs font-medium border text-left transition ${
                          role === 'Visualizador'
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="font-semibold text-white">Visualizador</div>
                        <div className="text-[10px] text-slate-400">Somente consulta e relatórios</div>
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">E-mail corporativo</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="email"
                    placeholder="seu.email@obra.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                    required
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-300">Senha</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setErrorMsg(null);
                        }}
                        className="text-[11px] text-amber-400 hover:underline"
                      >
                        Esqueci minha senha
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>
                  {mode === 'login' && 'Entrar no RDO Inteligente'}
                  {mode === 'register' && 'Concluir Cadastro'}
                  {mode === 'forgot' && 'Enviar E-mail de Recuperação'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {mode === 'forgot' && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Voltar para tela de login
                </button>
              </div>
            )}

            {mode !== 'forgot' && (
              <>
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-[11px] uppercase">
                    <span className="bg-slate-900 px-3 text-slate-500">ou acesse com</span>
                  </div>
                </div>

                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={submitting || loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-medium text-xs transition flex items-center justify-center gap-3 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Entrar com Google</span>
                </button>

                {/* Quick Demo Access Bar */}
                <div className="mt-4 pt-4 border-t border-slate-800/80">
                  <div className="text-[11px] text-slate-400 text-center mb-2 font-medium">
                    Acesso Imediato para Avaliação:
                  </div>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => loginDemo('Editor', 'larifreitaseng@gmail.com', 'Engª. Larissa Freitas')}
                      className="w-full py-2 px-3 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold text-center transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <HardHat className="w-3.5 h-3.5 text-amber-400" />
                      <span>Entrar como Engª. Larissa Freitas (Editor)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => loginDemo('Visualizador', 'fiscal@fiscalizacao.gov.br', 'Fiscal Carlos Andrade')}
                      className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-[11px] font-medium text-center transition cursor-pointer"
                    >
                      Entrar como Fiscal de Obra (Visualizador)
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 text-center mt-2">
                    Não requer senha manual. Clique acima para liberar todo o canteiro.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Rodapé e Credenciais */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 sm:px-8 py-4 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sistema Seguro • Firebase Auth e Firestore</span>
          </div>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="text-slate-400">Oficina Técnica Engª. Larissa Freitas</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>CONFEA</span>
          <span>•</span>
          <span>CREA-SP</span>
          <span>•</span>
          <span>MÚTUA</span>
        </div>
      </footer>
    </div>
  );
};
