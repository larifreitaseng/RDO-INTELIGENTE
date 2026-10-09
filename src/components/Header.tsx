import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import {
  HardHat,
  LogOut,
  User,
  Shield,
  Building,
  ChevronDown,
  Sparkles,
  Check,
  Menu,
  X,
  FileText,
  Users,
  Briefcase,
  FolderArchive,
  Sliders,
  LayoutDashboard,
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenVoiceModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab, onOpenVoiceModal }) => {
  const { profile, logout, switchUserRole } = useAuth();
  const { works, selectedWorkId, setSelectedWorkId, activeWork } = useData();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [workMenuOpen, setWorkMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'works', label: 'Obras', icon: Building },
    { id: 'rdos', label: 'RDOs', icon: FileText },
    { id: 'companies', label: 'Empresas', icon: Briefcase },
    { id: 'team', label: 'Equipe', icon: Users },
    { id: 'documents', label: 'Documentos', icon: FolderArchive },
    { id: 'users', label: 'Usuários', icon: User },
    { id: 'settings', label: 'Configurações', icon: Sliders },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 shadow-md">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-base sm:text-lg">RDO Inteligente</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Engenharia Civil
              </span>
            </div>
          </div>
        </div>

        {/* Center: Active Work Quick Selector */}
        <div className="hidden lg:flex items-center">
          <div className="relative">
            <button
              onClick={() => setWorkMenuOpen(!workMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs hover:border-slate-700 transition"
            >
              <Building className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Obra ativa:</span>
              <span className="font-semibold text-white max-w-[200px] truncate">
                {activeWork ? activeWork.name : 'Selecionar Obra'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {workMenuOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-72 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-50">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Selecionar Obra de Referência
                </div>
                {works.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => {
                      setSelectedWorkId(w.id);
                      setWorkMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800/80 transition ${
                      selectedWorkId === w.id ? 'bg-amber-500/10 text-amber-400 font-medium' : 'text-slate-300'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="font-medium text-white truncate">{w.name}</div>
                      <div className="text-[10px] text-slate-500">{w.code} • {w.status}</div>
                    </div>
                    {selectedWorkId === w.id && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick IA Action & User Profile Badge */}
        <div className="flex items-center gap-2.5">
          {/* Quick AI Voice Button */}
          <button
            onClick={onOpenVoiceModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Gravar RDO com IA</span>
            <span className="sm:hidden">Gravar IA</span>
          </button>

          {/* User Profile & Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs transition"
            >
              <div className="w-7 h-7 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-amber-400 font-bold">
                {profile?.displayName?.charAt(0) || <User className="w-3.5 h-3.5" />}
              </div>
              <div className="hidden sm:block text-left">
                <div className="font-semibold text-white truncate max-w-[120px]">
                  {profile?.displayName || 'Usuário Conectado'}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                  <Shield className="w-2.5 h-2.5" />
                  <span>{profile?.role || 'Editor'}</span>
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-800">
                  <div className="font-semibold text-sm text-white">{profile?.displayName}</div>
                  <div className="text-xs text-slate-400 truncate">{profile?.email}</div>
                  <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Shield className="w-2.5 h-2.5" />
                    <span>Perfil: {profile?.role}</span>
                  </div>
                </div>

                {/* Role Switcher for Testing Editor vs Visualizador */}
                <div className="px-4 py-2 border-b border-slate-800">
                  <div className="text-[11px] text-slate-400 mb-1.5">Alternar Perfil de Acesso:</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => {
                        switchUserRole('Editor');
                        setUserMenuOpen(false);
                      }}
                      className={`px-2 py-1 rounded text-[11px] font-medium border text-center transition ${
                        profile?.role === 'Editor'
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Editor
                    </button>
                    <button
                      onClick={() => {
                        switchUserRole('Visualizador');
                        setUserMenuOpen(false);
                      }}
                      className={`px-2 py-1 rounded text-[11px] font-medium border text-center transition ${
                        profile?.role === 'Visualizador'
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Visualizador
                    </button>
                  </div>
                </div>

                <div className="px-2 py-1">
                  <button
                    onClick={() => {
                      setCurrentTab('users');
                      setUserMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Gerenciar Usuários</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentTab('settings');
                      setUserMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-2"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Configurações e Drive</span>
                  </button>

                  <button
                    onClick={async () => {
                      setUserMenuOpen(false);
                      await logout();
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair do Sistema</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar (Desktop) */}
      <div className="hidden md:block bg-slate-950/70 border-t border-slate-800/80 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center space-x-1 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                  isActive
                    ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileNavOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-1">
          <div className="mb-3 pb-2 border-b border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 uppercase mb-1">Obra Selecionada</div>
            <select
              value={selectedWorkId}
              onChange={(e) => setSelectedWorkId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
            >
              {works.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileNavOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  isActive ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da conta</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
