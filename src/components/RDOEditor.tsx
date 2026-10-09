import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { RDOReport, RDOPhoto, AIParsedRDO } from '../types';
import { generateRDOPDF } from '../lib/pdfGenerator';
import {
  Save,
  CheckCircle2,
  FileDown,
  Sparkles,
  ArrowLeft,
  Calendar,
  CloudSun,
  Users,
  Wrench,
  AlertOctagon,
  Camera,
  Trash2,
  Plus,
  Eye,
  Lock,
  Building,
} from 'lucide-react';

interface RDOEditorProps {
  initialRDO?: RDOReport;
  onBack: () => void;
  onOpenVoiceModal: () => void;
  appliedAIData?: AIParsedRDO | null;
  onClearAIData?: () => void;
}

export const RDOEditor: React.FC<RDOEditorProps> = ({
  initialRDO,
  onBack,
  onOpenVoiceModal,
  appliedAIData,
  onClearAIData,
}) => {
  const { isEditor, profile } = useAuth();
  const { works, companies, activeWork, saveRDO } = useData();

  // Active step in mobile wizard: 1. Informações & Clima | 2. Atividades | 3. Recursos | 4. Ocorrências & Segurança | 5. Fotos
  const [activeTab, setActiveTab] = useState<'info' | 'activities' | 'resources' | 'occurrences' | 'photos'>('info');

  const targetWork = initialRDO ? works.find((w) => w.id === initialRDO.workId) : activeWork;
  const company = companies.find((c) => c.id === targetWork?.companyId) || companies[0];

  // Format today's date as DD/MM/AAAA
  const getTodayFormatted = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const [formData, setFormData] = useState<Partial<RDOReport>>({
    id: initialRDO?.id,
    sequentialNumber: initialRDO?.sequentialNumber,
    workId: initialRDO?.workId || targetWork?.id || '',
    workName: initialRDO?.workName || targetWork?.name || '',
    date: initialRDO?.date || getTodayFormatted(),
    status: initialRDO?.status || 'Rascunho',
    authorName: initialRDO?.authorName || profile?.displayName || 'Engenheiro Responsável',
    authorRole: initialRDO?.authorRole || 'Engenheiro Civil',
    weatherMorning: initialRDO?.weatherMorning || 'Bom / Estável',
    weatherAfternoon: initialRDO?.weatherAfternoon || 'Bom / Estável',
    weatherNight: initialRDO?.weatherNight || 'Estável',
    workFronts: initialRDO?.workFronts || '',
    activities: initialRDO?.activities || '',
    progressPercent: initialRDO?.progressPercent || 0,
    labor: initialRDO?.labor || '',
    equipment: initialRDO?.equipment || '',
    materials: initialRDO?.materials || '',
    occurrences: initialRDO?.occurrences || 'Sem ocorrências adversas no período.',
    safety: initialRDO?.safety || 'DDS diário realizado. EPIs verificados. Nenhum acidente registrado.',
    observations: initialRDO?.observations || '',
    photos: initialRDO?.photos || [],
  });

  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // If AI data was passed from Voice modal, prefill/merge fields!
  React.useEffect(() => {
    if (appliedAIData) {
      setFormData((prev) => ({
        ...prev,
        weatherMorning: appliedAIData.weatherMorning || prev.weatherMorning,
        weatherAfternoon: appliedAIData.weatherAfternoon || prev.weatherAfternoon,
        weatherNight: appliedAIData.weatherNight || prev.weatherNight,
        workFronts: appliedAIData.workFronts || prev.workFronts,
        activities: appliedAIData.activities || prev.activities,
        progressPercent: appliedAIData.progressPercent ?? prev.progressPercent,
        labor: appliedAIData.labor || prev.labor,
        equipment: appliedAIData.equipment || prev.equipment,
        materials: appliedAIData.materials || prev.materials,
        occurrences: appliedAIData.occurrences || prev.occurrences,
        safety: appliedAIData.safety || prev.safety,
        observations: appliedAIData.observations || prev.observations,
      }));
      setSaveSuccessMsg('Dados de voz com IA incorporados ao formulário com sucesso!');
      if (onClearAIData) onClearAIData();
    }
  }, [appliedAIData]);

  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    const newP: RDOPhoto = {
      id: 'photo-' + Date.now(),
      url: newPhotoUrl.trim(),
      caption: newPhotoCaption.trim() || 'Registro fotográfico da obra',
      createdAt: new Date().toISOString(),
    };
    setFormData((prev) => ({
      ...prev,
      photos: [...(prev.photos || []), newP],
    }));
    setNewPhotoUrl('');
    setNewPhotoCaption('');
  };

  const handleRemovePhoto = (photoId: string) => {
    setFormData((prev) => ({
      ...prev,
      photos: (prev.photos || []).filter((p) => p.id !== photoId),
    }));
  };

  const handleSave = async (status: 'Rascunho' | 'Finalizado') => {
    if (!isEditor) return;
    setSaving(true);
    setSaveSuccessMsg(null);
    try {
      const savedId = await saveRDO({
        ...formData,
        status,
        workId: formData.workId || targetWork?.id || '',
        date: formData.date || getTodayFormatted(),
      });
      setFormData((prev) => ({ ...prev, id: savedId, status }));
      setSaveSuccessMsg(
        status === 'Finalizado'
          ? 'RDO finalizado com sucesso! Agora você pode gerar e baixar o PDF oficial.'
          : 'RDO salvo como rascunho. Você pode continuar editando a qualquer momento.'
      );
    } catch (err: any) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePDF = () => {
    const fullReport: RDOReport = {
      id: formData.id || 'rdo-temp',
      sequentialNumber: formData.sequentialNumber || 1,
      date: formData.date || getTodayFormatted(),
      workId: formData.workId || targetWork?.id || '',
      workName: formData.workName || targetWork?.name || '',
      status: (formData.status as any) || 'Rascunho',
      authorId: profile?.id || 'author',
      authorName: formData.authorName || 'Engenheiro Responsável',
      authorRole: formData.authorRole || 'Engenheiro Civil',
      weatherMorning: formData.weatherMorning || '',
      weatherAfternoon: formData.weatherAfternoon || '',
      weatherNight: formData.weatherNight || '',
      workFronts: formData.workFronts || '',
      activities: formData.activities || '',
      progressPercent: Number(formData.progressPercent) || 0,
      labor: formData.labor || '',
      equipment: formData.equipment || '',
      materials: formData.materials || '',
      occurrences: formData.occurrences || '',
      safety: formData.safety || '',
      observations: formData.observations || '',
      photos: formData.photos || [],
      pdfGenerated: true,
      createdBy: profile?.id || 'author',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    generateRDOPDF(fullReport, targetWork, company);
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Voltar para listagem de RDOs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                {formData.id ? `Editar RDO #${String(formData.sequentialNumber || 1).padStart(3, '0')}` : 'Novo Relatório Diário de Obra'}
              </h2>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  formData.status === 'Finalizado'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {formData.status}
              </span>
            </div>
            <p className="text-xs text-slate-400">{formData.workName}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Voice AI Prompt Trigger */}
          {isEditor && (
            <button
              onClick={onOpenVoiceModal}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Gravar RDO com IA</span>
            </button>
          )}

          {/* Save Draft */}
          {isEditor && (
            <button
              onClick={() => handleSave('Rascunho')}
              disabled={saving}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-slate-400" />
              <span>Salvar Rascunho</span>
            </button>
          )}

          {/* Finalize */}
          {isEditor && (
            <button
              onClick={() => handleSave('Finalizado')}
              disabled={saving}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Finalizar RDO</span>
            </button>
          )}

          {/* Generate PDF */}
          <button
            onClick={handleGeneratePDF}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>Gerar PDF Oficial</span>
          </button>
        </div>
      </div>

      {/* Role Alert for Viewer */}
      {!isEditor && (
        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 text-xs flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Modo Visualizador:</strong> Você possui permissão somente de consulta. Para editar ou finalizar relatórios, altere para o perfil Editor no menu de usuário.
          </span>
        </div>
      )}

      {/* Success Notification */}
      {saveSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Mobile-Friendly Tabs Navigation (Avoid long infinite scroll) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'info', label: '1. Geral e Clima', icon: Calendar },
          { id: 'activities', label: '2. Atividades e Avanço', icon: CloudSun },
          { id: 'resources', label: '3. Mão de Obra e Recursos', icon: Users },
          { id: 'occurrences', label: '4. Ocorrências e Segurança', icon: AlertOctagon },
          { id: 'photos', label: '5. Relatório Fotográfico', icon: Camera },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[130px] sm:min-w-0 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Content Cards */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl">
        {/* TAB 1: Informações Gerais e Clima */}
        {activeTab === 'info' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Calendar className="w-4 h-4" />
              <span>Identificação do RDO e Condições Climáticas</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Obra Vinculada</label>
                <select
                  disabled={!isEditor}
                  value={formData.workId}
                  onChange={(e) => {
                    const sel = works.find((w) => w.id === e.target.value);
                    setFormData({ ...formData, workId: e.target.value, workName: sel?.name || '' });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400"
                >
                  {works.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Data (DD/MM/AAAA)</label>
                <input
                  type="text"
                  disabled={!isEditor}
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  placeholder="DD/MM/AAAA"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Número Sequencial</label>
                <input
                  type="number"
                  disabled={!isEditor}
                  value={formData.sequentialNumber || ''}
                  onChange={(e) => setFormData({ ...formData, sequentialNumber: Number(e.target.value) })}
                  placeholder="Ex: 1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Responsável pelo Preenchimento</label>
                <input
                  type="text"
                  disabled={!isEditor}
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cargo / Função</label>
                <input
                  type="text"
                  disabled={!isEditor}
                  value={formData.authorRole}
                  onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400"
                />
              </div>
            </div>

            {/* Weather Section */}
            <div className="pt-3 border-t border-slate-800">
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Condições Climáticas por Período
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-[11px] font-semibold text-slate-400 mb-1">Manhã</div>
                  <input
                    type="text"
                    disabled={!isEditor}
                    value={formData.weatherMorning}
                    onChange={(e) => setFormData({ ...formData, weatherMorning: e.target.value })}
                    placeholder="Ex: Bom / Chuvoso / Nublado / Impraticável"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-[11px] font-semibold text-slate-400 mb-1">Tarde</div>
                  <input
                    type="text"
                    disabled={!isEditor}
                    value={formData.weatherAfternoon}
                    onChange={(e) => setFormData({ ...formData, weatherAfternoon: e.target.value })}
                    placeholder="Ex: Bom / Ensolarado"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-[11px] font-semibold text-slate-400 mb-1">Noite</div>
                  <input
                    type="text"
                    disabled={!isEditor}
                    value={formData.weatherNight}
                    onChange={(e) => setFormData({ ...formData, weatherNight: e.target.value })}
                    placeholder="Ex: Estável / Sem atividades"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Atividades Executadas e Avanço Físico */}
        {activeTab === 'activities' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <CloudSun className="w-4 h-4" />
              <span>Etapas, Frentes de Serviço e Atividades</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Etapas e Frentes de Serviço
              </label>
              <input
                type="text"
                disabled={!isEditor}
                value={formData.workFronts}
                onChange={(e) => setFormData({ ...formData, workFronts: e.target.value })}
                placeholder="Ex: Estrutura 2º Pavimento; Alvenaria no 1º Subsolo"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Atividades Executadas no Dia (Detalhamento Técnico)
              </label>
              <textarea
                rows={5}
                disabled={!isEditor}
                value={formData.activities}
                onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
                placeholder="Descreva as tarefas concretizadas pela equipe durante os turnos..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white focus:border-amber-400 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Percentual de Avanço Físico Informado (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="100"
                  disabled={!isEditor}
                  value={formData.progressPercent ?? 0}
                  onChange={(e) => setFormData({ ...formData, progressPercent: Number(e.target.value) })}
                  className="w-32 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400"
                />
                <div className="flex-1 bg-slate-950 rounded-full h-3 border border-slate-800 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-600 h-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, formData.progressPercent || 0))}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-amber-400">{formData.progressPercent || 0}%</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Recursos (Mão de Obra, Equipamentos, Materiais) */}
        {activeTab === 'resources' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Users className="w-4 h-4" />
              <span>Recursos: Efetivo, Equipamentos e Materiais</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mão de Obra por Função e Empresa
              </label>
              <textarea
                rows={3}
                disabled={!isEditor}
                value={formData.labor}
                onChange={(e) => setFormData({ ...formData, labor: e.target.value })}
                placeholder="Ex: 4 pedreiros, 6 serventes, 2 carpinteiros (Empreiteira Alpha)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Equipamentos e Maquinários em Operação
              </label>
              <textarea
                rows={3}
                disabled={!isEditor}
                value={formData.equipment}
                onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                placeholder="Ex: 1 Betoneira 400L, 1 Guincho de Coluna, 1 Vibrador de Imersão"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Materiais Recebidos ou Utilizados
              </label>
              <textarea
                rows={3}
                disabled={!isEditor}
                value={formData.materials}
                onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                placeholder="Ex: 50 sacos de cimento CP-II, 14m³ de concreto usinado 30 MPa"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-amber-400"
              />
            </div>
          </div>
        )}

        {/* TAB 4: Ocorrências, Segurança e Observações */}
        {activeTab === 'occurrences' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <AlertOctagon className="w-4 h-4" />
              <span>Ocorrências, Segurança do Trabalho e Observações</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ocorrências e Imprevistos
              </label>
              <textarea
                rows={3}
                disabled={!isEditor}
                value={formData.occurrences}
                onChange={(e) => setFormData({ ...formData, occurrences: e.target.value })}
                placeholder="Ex: Paralisação aproximada de 1 hora devido à chuva pela manhã"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Segurança do Trabalho (DDS, EPIs, Acidentes)
              </label>
              <textarea
                rows={3}
                disabled={!isEditor}
                value={formData.safety}
                onChange={(e) => setFormData({ ...formData, safety: e.target.value })}
                placeholder="Ex: DDS matinal realizado; uso obrigatório de cinto; nenhum acidente registrado."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Observações Gerais
              </label>
              <textarea
                rows={2}
                disabled={!isEditor}
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                placeholder="Orientações adicionais, visitas técnicas ou comunicados da fiscalização..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-amber-400"
              />
            </div>
          </div>
        )}

        {/* TAB 5: Relatório Fotográfico */}
        {activeTab === 'photos' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Camera className="w-4 h-4" />
              <span>Relatório Fotográfico com Legendas</span>
            </h3>

            {/* Add photo bar */}
            {isEditor && (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="text-xs font-semibold text-slate-200">Adicionar Foto de Campo:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="URL da imagem (ex: Unsplash ou link de foto)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={newPhotoCaption}
                    onChange={(e) => setNewPhotoCaption(e.target.value)}
                    placeholder="Legenda técnica descritiva"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="flex items-center justify-between">
                  {/* Preset quick civil photos for demo */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNewPhotoUrl('https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=800&auto=format&fit=crop&q=80');
                        setNewPhotoCaption('Concretagem das vigas principais do pavimento tipo');
                      }}
                      className="text-[11px] text-amber-400 hover:underline"
                    >
                      + Exemplo Concretagem
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewPhotoUrl('https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80');
                        setNewPhotoCaption('Inspeção estrutural das armaduras de aço CA-50');
                      }}
                      className="text-[11px] text-amber-400 hover:underline"
                    >
                      + Exemplo Armaduras
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddPhoto}
                    disabled={!newPhotoUrl.trim()}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Inserir Foto</span>
                  </button>
                </div>
              </div>
            )}

            {/* Photos List */}
            {formData.photos && formData.photos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {formData.photos.map((photo, idx) => (
                  <div
                    key={photo.id || idx}
                    className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden group relative"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full h-44 object-cover"
                      onError={(e: any) => {
                        e.target.src = 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=800&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-start justify-between gap-2">
                      <p className="text-xs text-slate-300 font-medium leading-snug">
                        <span className="font-bold text-amber-400 mr-1">Foto #{idx + 1}:</span>
                        {photo.caption}
                      </p>
                      {isEditor && (
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(photo.id)}
                          className="p-1 rounded text-red-400 hover:bg-red-500/20 transition shrink-0"
                          title="Remover foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                Nenhuma foto anexada a este RDO. Adicione fotos do canteiro para enriquecer o relatório técnico.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stepper Footer Controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
        >
          Voltar para Lista
        </button>

        <div className="flex items-center gap-2">
          {activeTab !== 'info' && (
            <button
              onClick={() => {
                const tabs: any = ['info', 'activities', 'resources', 'occurrences', 'photos'];
                const curIdx = tabs.indexOf(activeTab);
                if (curIdx > 0) setActiveTab(tabs[curIdx - 1]);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Etapa Anterior
            </button>
          )}

          {activeTab !== 'photos' ? (
            <button
              onClick={() => {
                const tabs: any = ['info', 'activities', 'resources', 'occurrences', 'photos'];
                const curIdx = tabs.indexOf(activeTab);
                if (curIdx < tabs.length - 1) setActiveTab(tabs[curIdx + 1]);
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md cursor-pointer"
            >
              Próxima Etapa
            </button>
          ) : (
            isEditor && (
              <button
                onClick={() => handleSave('Finalizado')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Finalizar e Emitir PDF
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
