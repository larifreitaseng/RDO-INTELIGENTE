import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { DocumentItem } from '../types';
import {
  FolderArchive,
  FolderOpen,
  FileText,
  Camera,
  File,
  Plus,
  ExternalLink,
  Trash2,
  X,
  UploadCloud,
  CheckCircle2,
} from 'lucide-react';

export const DocumentsView: React.FC = () => {
  const { isEditor } = useAuth();
  const { documents, works, activeWork, selectedWorkId, setSelectedWorkId, addDocument, deleteDocument } =
    useData();

  const [activeFolderTab, setActiveFolderTab] = useState<'all' | '01_RDOs' | '02_Fotos' | '03_Documentos'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Documento' as 'RDO' | 'Foto' | 'Documento',
    fileUrl: '',
    driveFolder: '03_Documentos',
    workId: selectedWorkId || '',
  });

  const filteredDocs = documents.filter((d) => {
    const matchesWork = d.workId === selectedWorkId;
    const matchesFolder =
      activeFolderTab === 'all' ||
      (activeFolderTab === '01_RDOs' && d.category === 'RDO') ||
      (activeFolderTab === '02_Fotos' && d.category === 'Foto') ||
      (activeFolderTab === '03_Documentos' && d.category === 'Documento');
    return matchesWork && matchesFolder;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    await addDocument({
      ...formData,
      workId: formData.workId || selectedWorkId || '',
    });
    setModalOpen(false);
    setFormData({
      title: '',
      category: 'Documento',
      fileUrl: '',
      driveFolder: '03_Documentos',
      workId: selectedWorkId || '',
    });
  };

  const handleCopyDriveStructure = () => {
    const text = `${activeWork?.name || 'Obra'}/\n  ├── 01_RDOs/\n  ├── 02_Fotos/\n  └── 03_Documentos/`;
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FolderArchive className="w-5 h-5 text-amber-400" />
              <span>Documentos e Integração Google Drive</span>
            </h2>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Drive Sincronizado
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Organização automática de PDFs de RDOs, fotos de canteiro e documentos técnicos vinculados por obra.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeWork?.driveFolderUrl && (
            <a
              href={activeWork.driveFolderUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Abrir no Google Drive</span>
            </a>
          )}

          {isEditor && (
            <button
              onClick={() => setModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Vincular Arquivo</span>
            </button>
          )}
        </div>
      </div>

      {/* Select Active Work & Drive Folders Structure Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Obra Atual:</span>
            <select
              value={selectedWorkId}
              onChange={(e) => setSelectedWorkId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-medium"
            >
              {works.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.code} - {w.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCopyDriveStructure}
            className="text-xs text-slate-400 hover:text-amber-400 font-medium flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
          >
            {copySuccess ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <FolderArchive className="w-3.5 h-3.5" />
            )}
            <span>{copySuccess ? 'Estrutura Copiada!' : 'Copiar Árvore de Pastas do Drive'}</span>
          </button>
        </div>

        {/* Drive Subfolder Navigation Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {[
            { id: 'all', label: 'Todos os Arquivos', count: documents.filter((d) => d.workId === selectedWorkId).length },
            {
              id: '01_RDOs',
              label: '📁 01_RDOs (PDFs emitidos)',
              count: documents.filter((d) => d.workId === selectedWorkId && d.category === 'RDO').length,
            },
            {
              id: '02_Fotos',
              label: '📁 02_Fotos (Relatórios de campo)',
              count: documents.filter((d) => d.workId === selectedWorkId && d.category === 'Foto').length,
            },
            {
              id: '03_Documentos',
              label: '📁 03_Documentos (ARTs e Projetos)',
              count: documents.filter((d) => d.workId === selectedWorkId && d.category === 'Documento').length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFolderTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-2 ${
                activeFolderTab === tab.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeFolderTab === tab.id ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.length > 0 ? (
          filteredDocs.map((docItem) => (
            <div
              key={docItem.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-xl flex flex-col justify-between space-y-3 transition"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                      docItem.category === 'RDO'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        : docItem.category === 'Foto'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {docItem.category}
                  </span>
                  {docItem.isDemo && (
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      [DEMO]
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-white line-clamp-2">{docItem.title}</h3>

                <div className="text-xs font-mono text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800">
                  📁 Subpasta: {docItem.driveFolder || (docItem.category === 'RDO' ? '01_RDOs' : docItem.category === 'Foto' ? '02_Fotos' : '03_Documentos')}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {new Date(docItem.createdAt).toLocaleDateString('pt-BR')}
                </span>

                <div className="flex items-center gap-1.5">
                  {docItem.fileUrl && docItem.fileUrl !== '#' && (
                    <a
                      href={docItem.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition"
                      title="Visualizar arquivo"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {isEditor && (
                    <button
                      onClick={() => {
                        if (confirm(`Remover "${docItem.title}"?`)) {
                          deleteDocument(docItem.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition"
                      title="Excluir documento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs space-y-2">
            <FolderArchive className="w-8 h-8 mx-auto text-slate-600" />
            <p className="font-semibold text-slate-300">Nenhum documento encontrado nesta pasta.</p>
            <p>Os PDFs gerados e fotos vinculadas ao RDO aparecem organizados aqui automaticamente.</p>
          </div>
        )}
      </div>

      {/* Modal Vincular Documento */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-base text-white">Vincular Documento da Obra</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Título do Documento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: ART de Execução Elétrica e Hidráulica.pdf"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Categoria *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const cat = e.target.value as any;
                      const folder = cat === 'RDO' ? '01_RDOs' : cat === 'Foto' ? '02_Fotos' : '03_Documentos';
                      setFormData({ ...formData, category: cat, driveFolder: folder });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="RDO">Relatório Diário (PDF)</option>
                    <option value="Foto">Foto de Canteiro</option>
                    <option value="Documento">Documento Técnico / ART</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Pasta no Drive</label>
                  <input
                    type="text"
                    disabled
                    value={formData.driveFolder}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2 text-slate-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Link ou URL do Arquivo</label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/file/d/..."
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
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
                  Salvar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
