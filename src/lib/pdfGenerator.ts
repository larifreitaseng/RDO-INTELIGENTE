import jsPDF from 'jspdf';
import { RDOReport, Work, Company } from '../types';

export function generateRDOPDF(rdo: RDOReport, work?: Work, company?: Company): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Helper for page break
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 20) {
      doc.addPage();
      y = margin;
      drawPageHeader(true);
    }
  };

  const drawPageHeader = (isContinuation = false) => {
    // Header banner
    doc.setFillColor(30, 58, 138); // Deep Navy #1E3A8A
    doc.rect(margin, y, contentWidth, 18, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('RDO INTELIGENTE - RELATÓRIO DIÁRIO DE OBRA', margin + 6, y + 8);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const headerSub = isContinuation
      ? `Continuação | ${work?.name || rdo.workName} | RDO Nº ${String(rdo.sequentialNumber).padStart(3, '0')}`
      : `${company?.tradeName || 'Construção Civil e Engenharia'} | CREA/CAU: ${company?.creaCau || work?.creaCau || 'N/A'}`;
    doc.text(headerSub, margin + 6, y + 14);

    // Number & Date Badge on right
    doc.setFillColor(217, 119, 6); // Amber #D97706
    doc.roundedRect(pageWidth - margin - 45, y + 3, 40, 12, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(`RDO Nº ${String(rdo.sequentialNumber).padStart(3, '0')}`, pageWidth - margin - 25, y + 8, { align: 'center' });
    doc.setFontSize(7.5);
    doc.text(`Data: ${rdo.date}`, pageWidth - margin - 25, y + 12, { align: 'center' });

    y += 22;
  };

  const drawSectionTitle = (title: string) => {
    checkPageBreak(12);
    doc.setFillColor(241, 245, 249); // Slate-100
    doc.rect(margin, y, contentWidth, 6.5, 'F');
    doc.setFillColor(30, 58, 138);
    doc.rect(margin, y, 3, 6.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 58, 138);
    doc.text(title.toUpperCase(), margin + 6, y + 4.8);
    y += 9;
  };

  const drawFieldBox = (label: string, content: string, minHeight = 12) => {
    checkPageBreak(minHeight + 6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(label, margin + 2, y + 3.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);

    const splitText = doc.splitTextToSize(content || 'Não informado / Sem alterações.', contentWidth - 6);
    const boxHeight = Math.max(minHeight, splitText.length * 4.2 + 6);

    doc.setDrawColor(203, 213, 225); // Slate-300
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, y, contentWidth, boxHeight, 1, 1, 'S');

    doc.text(splitText, margin + 3, y + 8);
    y += boxHeight + 3;
  };

  // 1. Initial Page Header
  drawPageHeader(false);

  // 2. Dados da Obra & Contratante
  drawSectionTitle('1. Identificação da Obra e Contratante');
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 24, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  doc.text('Obra:', margin + 3, y + 5);
  doc.text('Código:', margin + 115, y + 5);
  doc.text('Cliente / Contratante:', margin + 3, y + 11);
  doc.text('Endereço:', margin + 115, y + 11);
  doc.text('Responsável Técnico da Obra:', margin + 3, y + 17);
  doc.text('CREA / CAU:', margin + 115, y + 17);
  doc.text('Responsável pelo Preenchimento:', margin + 3, y + 22);
  doc.text('Status do RDO:', margin + 115, y + 22);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(work?.name || rdo.workName, margin + 15, y + 5);
  doc.text(work?.code || 'N/A', margin + 130, y + 5);
  doc.text(work?.clientName || 'Não especificado', margin + 36, y + 11);
  doc.text(work?.address ? doc.splitTextToSize(work.address, 55)[0] : 'N/A', margin + 133, y + 11);
  doc.text(work?.technicalLead || rdo.authorName, margin + 49, y + 17);
  doc.text(work?.creaCau || 'N/A', margin + 136, y + 17);
  doc.text(`${rdo.authorName} (${rdo.authorRole || 'Responsável'})`, margin + 51, y + 22);
  doc.text(rdo.status, margin + 138, y + 22);

  y += 28;

  // 3. Condições Climáticas & Avanço
  drawSectionTitle('2. Condições Climáticas e Avanço Físico');
  const colWidth = (contentWidth - 6) / 4;
  const weatherY = y;
  const periods = [
    { label: 'Manhã', value: rdo.weatherMorning || 'Não informado' },
    { label: 'Tarde', value: rdo.weatherAfternoon || 'Não informado' },
    { label: 'Noite', value: rdo.weatherNight || 'Não aplicável' },
    { label: 'Avanço Informado', value: `${rdo.progressPercent || 0}%` },
  ];

  periods.forEach((p, idx) => {
    const boxX = margin + idx * (colWidth + 2);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(boxX, weatherY, colWidth, 13, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(p.label, boxX + 2, weatherY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 58, 138);
    doc.text(doc.splitTextToSize(p.value, colWidth - 4), boxX + 2, weatherY + 9.5);
  });
  y += 17;

  // 4. Etapas e Atividades Executadas
  drawSectionTitle('3. Frentes de Serviço e Atividades Executadas');
  if (rdo.workFronts) {
    drawFieldBox('Etapas e Frentes de Serviço:', rdo.workFronts, 10);
  }
  drawFieldBox('Atividades Executadas no Dia:', rdo.activities, 16);

  // 5. Recursos: Mão de Obra, Equipamentos e Materiais
  drawSectionTitle('4. Recursos Empregados (Efetivo, Equipamentos e Materiais)');
  drawFieldBox('Mão de Obra por Função e Empresa:', rdo.labor, 12);
  drawFieldBox('Equipamentos e Maquinários em Operação:', rdo.equipment, 10);
  drawFieldBox('Materiais Recebidos ou Utilizados:', rdo.materials, 10);

  // 6. Ocorrências e Segurança
  drawSectionTitle('5. Ocorrências, Imprevistos e Segurança do Trabalho');
  drawFieldBox('Ocorrências, Paralisações e Imprevistos:', rdo.occurrences, 10);
  drawFieldBox('Segurança do Trabalho, DDS e EPIs:', rdo.safety, 10);
  if (rdo.observations) {
    drawFieldBox('Observações Gerais:', rdo.observations, 10);
  }

  // 7. Relatório Fotográfico (se houver fotos)
  if (rdo.photos && rdo.photos.length > 0) {
    checkPageBreak(50);
    drawSectionTitle('6. Relatório Fotográfico de Campo');
    rdo.photos.forEach((photo, idx) => {
      checkPageBreak(30);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, y, contentWidth, 14, 1, 1, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 58, 138);
      doc.text(`Foto #${idx + 1}:`, margin + 3, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      const capLines = doc.splitTextToSize(photo.caption || 'Registro fotográfico da atividade de campo.', contentWidth - 25);
      doc.text(capLines, margin + 20, y + 5);

      y += 17;
    });
  }

  // 8. Assinaturas Formais
  checkPageBreak(38);
  drawSectionTitle('7. Termo de Encerramento e Assinaturas');

  const sigWidth = (contentWidth - 8) / 3;
  const sigY = y + 16;

  // Signatures lines
  for (let i = 0; i < 3; i++) {
    const sx = margin + i * (sigWidth + 4);
    doc.setDrawColor(71, 85, 105);
    doc.line(sx, sigY, sx + sigWidth, sigY);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 58, 138);

  // Sig 1
  const s1x = margin + sigWidth / 2;
  doc.text(rdo.authorName, s1x, sigY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Responsável pelo Preenchimento', s1x, sigY + 7.5, { align: 'center' });
  doc.text(`CREA/CAU: ${work?.creaCau || 'N/A'}`, s1x, sigY + 11, { align: 'center' });

  // Sig 2
  const s2x = margin + (sigWidth + 4) + sigWidth / 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 58, 138);
  doc.text(work?.technicalLead || 'Responsável Técnico', s2x, sigY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Responsável Técnico da Obra', s2x, sigY + 7.5, { align: 'center' });
  doc.text(`CREA/CAU: ${work?.creaCau || 'N/A'}`, s2x, sigY + 11, { align: 'center' });

  // Sig 3
  const s3x = margin + (sigWidth + 4) * 2 + sigWidth / 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 58, 138);
  doc.text(work?.clientName || 'Fiscalização / Contratante', s3x, sigY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Fiscalização / Contratante', s3x, sigY + 7.5, { align: 'center' });
  doc.text('Visto de Ciência', s3x, sigY + 11, { align: 'center' });

  // Add footer to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text(
      `RDO Inteligente • Sistema de Gestão de Obras com Inteligência Artificial • Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
      margin,
      pageHeight - 8
    );
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  // Save the PDF file
  const fileName = `RDO_${String(rdo.sequentialNumber).padStart(3, '0')}_${rdo.date.replace(/\//g, '-')}_${(work?.code || 'OBRA').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(fileName);
}
