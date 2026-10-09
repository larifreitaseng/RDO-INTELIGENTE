import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Gemini client with runtime GEMINI_API_KEY
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// API Endpoint to parse voice or text report into structured RDO draft
app.post('/api/parse-report', async (req, res) => {
  try {
    const { reportText, audioBase64, mimeType } = req.body;

    if (!reportText && !audioBase64) {
      return res.status(400).json({ error: 'Nenhum texto ou áudio fornecido para análise.' });
    }

    const systemPrompt = `Você é um assistente especialista em Engenharia Civil e estruturação de Relatórios Diários de Obra (RDO) do sistema "RDO Inteligente".
Sua tarefa é transformar o relato de campo recebido (por voz ou texto) em um rascunho estruturado do RDO.

REGRAS OBRIGATÓRIAS:
1. Identifique SOMENTE as informações efetivamente presentes no relato.
2. NUNCA invente informações ausentes. Se não foi mencionado no relato, deixe o campo em branco ou null.
3. Quando alguma informação estiver incerta ou ambígua, sinalize o campo com o prefixo ou sufixo "[Requer confirmação]".
4. Para mão de obra: identifique a função, quantidade de profissionais e empresa (se mencionada).
5. Para clima: mapeie para os períodos correspondentes (Manhã, Tarde, Noite).
6. Para avanço físico: extraia a porcentagem numérica se informada.
7. Para materiais: extraia quantidade e tipo especificado.
8. Para ocorrências: extraia paralisações, motivos e impactos no serviço.
9. Para segurança: relate inspeções, DDS ou se foi explicitado que "não houve acidentes".

Retorne SEMPRE e EXCLUSIVAMENTE um objeto JSON válido no seguinte formato:
{
  "weatherMorning": "string (ex: 'Chuvoso pela manhã' ou '' se não informado)",
  "weatherAfternoon": "string (ex: 'Bom / Ensolarado' ou '' se não informado)",
  "weatherNight": "string (ou '' se não informado)",
  "workFronts": "string (etapas e frentes de serviço identificadas)",
  "activities": "string (atividades executadas detalhadas)",
  "progressPercent": number ou null,
  "labor": "string (mão de obra por função e quantidade, ex: '4 pedreiros, 6 serventes e 2 carpinteiros')",
  "equipment": "string (equipamentos e maquinários citados)",
  "materials": "string (materiais recebidos ou utilizados, ex: '50 sacos de cimento')",
  "occurrences": "string (ocorrências e imprevistos, ex: 'Paralisação de aprox. 1h devido à chuva')",
  "safety": "string (segurança e acidentes, ex: 'Nenhum acidente informado')",
  "observations": "string (observações gerais ou '')",
  "uncertainties": ["array de strings listando pontos que requerem confirmação do usuário"],
  "summary": "resumo claro e direto do relato em 1 ou 2 parágrafos"
}`;

    const contents: any[] = [];

    if (audioBase64) {
      contents.push({
        inlineData: {
          mimeType: mimeType || 'audio/webm',
          data: audioBase64
        }
      });
      contents.push(
        reportText
          ? `Transcreva o áudio de relato de obra e estruture-o conforme as regras. Texto adicional fornecido: "${reportText}".`
          : 'Transcreva este áudio de relato de obra do canteiro e estruture-o rigorosamente de acordo com as regras de RDO.'
      );
    } else {
      contents.push(`Analise e estruture o seguinte relato de campo do canteiro de obras:\n\n"${reportText}"`);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.1,
      }
    });

    const outputText = response.text || '{}';
    let parsedData = {};
    try {
      parsedData = JSON.parse(outputText);
    } catch {
      // Fallback clean if markdown ticks wrapped
      const clean = outputText.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(clean);
    }

    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error processing RDO with Gemini:', error);
    return res.status(500).json({
      error: 'Falha ao processar o relato com Inteligência Artificial.',
      details: error?.message || String(error)
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'RDO Inteligente API', timestamp: new Date().toISOString() });
});

// Mount Vite or serve static files
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        port: PORT,
        host: '0.0.0.0',
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RDO Inteligente server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
