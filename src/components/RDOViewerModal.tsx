import React from 'react';
import { RDOReport, Work, Company } from '../types';
import { generateRDOPDF } from '../lib/pdfGenerator';
import {
  FileText,
  X,
  FileDown,
  Edit2,
  Calendar,
  Building,
  UserCheck,
  CloudSun,
  Users,
  Wrench,
  AlertOctagon,
  Camera,
  Shield,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface RDOViewerModalProps {
  rdo: RDOReport | null;
  work?: Work;
  company?: Company;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (rdo: RDOReport) => void;
  isEditor?: boolean;
}

export const RDOViewerModal: React.FC<RDOViewerModalProps> = ({
  rdo,
  work,
  company,
  isOpen,
  onClose,
  onEdit,
  isEditor = false,
}) => {
  if (!isOpen || !rdo) return null;

  const handleDownload = () => {
    generateRDOPDF(rdo, work, company);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  RDO Nº {String(rdo.sequentialNumber || 1).padStart(3, '0')}
                </h3>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    rdo.status === 'Finalizado'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {rdo.status}
                </span>
                {rdo.isDemo && (
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    [DADOS DE DEMONSTRAÇÃO]
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Data: {rdo.date}</span>
                <span>•</span>
                <span className="text-slate-300 truncate max-w-sm">{work?.name || rdo.workName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
              title="Gerar e Baixar PDF Oficial"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">Gerar PDF</span>
            </button>

            {isEditor && onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(rdo);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Editar RDO</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
              title="Fechar visualização"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body - Read-Only Technical View */}
        <div className="p-5 sm:p-7 flex-1 overflow-y-auto space-y-6 text-xs text-slate-200">
          {/* Section 1: Identificação da Obra e Contratante */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
              <Building className="w-3.5 h-3.5" />
              <span>1. Identificação da Obra e Contratante</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-500 block text-[11px]">Nome da Obra:</span>
                <span className="font-semibold text-white">{work?.name || rdo.workName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Código:</span>
                <span className="font-mono text-amber-400">{work?.code || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Cliente / Contratante:</span>
                <span className="text-slate-300">{work?.clientName || 'Não especificado'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 block text-[11px]">Endereço da Obra:</span>
                <span className="text-slate-300">{work?.address || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Responsável Técnico:</span>
                <span className="text-slate-300 font-medium">
                  {work?.technicalLead || rdo.authorName} ({work?.creaCau || 'CREA/CAU N/A'})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Elaborado por:</span>
                <span className="text-slate-300 font-medium">
                  {rdo.authorName} ({rdo.authorRole || 'Engenheiro Civil'})
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Condições Climáticas e Avanço Físico */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
              <CloudSun className="w-3.5 h-3.5" />
              <span>2. Condições Climáticas e Avanço Físico</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-xl">
                <span className="text-slate-500 text-[10px] block font-semibold uppercase">Manhã</span>
                <span className="font-semibold text-white mt-1 block">
                  {rdo.weatherMorning || 'Não informado'}
                </span>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-xl">
                <span className="text-slate-500 text-[10px] block font-semibold uppercase">Tarde</span>
                <span className="font-semibold text-white mt-1 block">
                  {rdo.weatherAfternoon || 'Não informado'}
                </span>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-xl">
                <span className="text-slate-500 text-[10px] block font-semibold uppercase">Noite</span>
                <span className="font-semibold text-white mt-1 block">
                  {rdo.weatherNight || 'Estável'}
                </span>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-xl">
                <span className="text-slate-500 text-[10px] block font-semibold uppercase">Avanço Físico</span>
                <span className="font-bold text-amber-400 text-sm mt-1 block">
                  {rdo.progressPercent || 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Frentes de Serviço e Atividades Executadas */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
              <FileText className="w-3.5 h-3.5" />
              <span>3. Frentes de Serviço e Atividades Executadas</span>
            </div>

            {rdo.workFronts && (
              <div>
                <span className="text-slate-500 block text-[11px] font-semibold mb-1">
                  Etapas e Frentes de Serviço:
                </span>
                <p className="bg-slate-900 p-2.5 rounded-lg border border-slate-800/80 text-slate-300">
                  {rdo.workFronts}
                </p>
              </div>
            )}

            <div>
              <span className="text-slate-500 block text-[11px] font-semibold mb-1">
                Atividades Executadas no Dia:
              </span>
              <p className="bg-slate-900 p-3 rounded-lg border border-slate-800/80 text-slate-200 leading-relaxed whitespace-pre-line">
                {rdo.activities || 'Nenhuma atividade registrada.'}
              </p>
            </div>
          </div>

          {/* Section 4: Recursos Empregados */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
              <Users className="w-3.5 h-3.5" />
              <span>4. Recursos Empregados (Efetivo, Equipamentos e Materiais)</span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-slate-500 block text-[11px] font-semibold mb-1">
                  Mão de Obra por Função e Empresa:
                </span>
                <p className="bg-slate-900 p-2.5 rounded-lg border border-slate-800/80 text-slate-200">
                  {rdo.labor || 'Não informado / Sem alterações.'}
                </p>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px] font-semibold mb-1">
                  Equipamentos e Maquinários em Operação:
                </span>
                <p className="bg-slate-900 p-2.5 rounded-lg border border-slate-800/80 text-slate-200">
                  {rdo.equipment || 'Não informado / Sem maquinários pesados no dia.'}
                </p>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px] font-semibold mb-1">
                  Materiais Recebidos ou Utilizados:
                </span>
                <p className="bg-slate-900 p-2.5 rounded-lg border border-slate-800/80 text-slate-200">
                  {rdo.materials || 'Não informado / Sem recebimento no dia.'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: Ocorrências e Segurança */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>5. Ocorrências, Paralisações e Segurança do Trabalho</span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-slate-500 block text-[11px] font-semibold mb-1">
                  Ocorrências e Imprevistos:
                </span>
                <p className="bg-slate-900 p-2.5 rounded-lg border border-slate-800/80 text-slate-200">
                  {rdo.occurrences || 'Sem ocorrências adversas registradas.'}
                </p>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px] font-semibold mb-1">
                  Segurança do Trabalho (DDS, EPIs e Acidentes):
                </span>
                <p className="bg-slate-900 p-2.5 rounded-lg border border-slate-800/80 text-slate-200">
                  {rdo.safety || 'DDS realizado. Nenhum acidente registrado.'}
                </p>
              </div>

              {rdo.observations && (
                <div>
                  <span className="text-slate-500 block text-[11px] font-semibold mb-1">
                    Observações Gerais:
                  </span>
                  <p className="bg-slate-900 p-2.5 rounded-lg border border-slate-800/80 text-slate-300">
                    {rdo.observations}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 6: Relatório Fotográfico */}
          {rdo.photos && rdo.photos.length > 0 && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
                <Camera className="w-3.5 h-3.5" />
                <span>6. Relatório Fotográfico de Campo ({rdo.photos.length} fotos)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {rdo.photos.map((photo, idx) => (
                  <div key={photo.id || idx} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full h-44 object-cover"
                      onError={(e: any) => {
                        e.target.src = 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=800&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="p-3 text-xs text-slate-300">
                      <span className="font-bold text-amber-400 mr-1.5">Foto #{idx + 1}:</span>
                      <span>{photo.caption}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 7: Assinaturas Previstas */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>7. Assinaturas e Termo de Encerramento (incluídas no PDF)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center pt-2">
              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                <div className="font-semibold text-white">{rdo.authorName}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Responsável pelo Preenchimento</div>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                <div className="font-semibold text-white">{work?.technicalLead || 'Responsável Técnico'}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Responsável Técnico da Obra</div>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                <div className="font-semibold text-white">{work?.clientName || 'Fiscalização'}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Fiscalização / Contratante</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
          >
            Fechar
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Baixar PDF Oficial</span>
            </button>

            {isEditor && onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(rdo);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Editar este RDO</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
