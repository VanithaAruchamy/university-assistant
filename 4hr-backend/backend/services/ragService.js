// services/ragService.js
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const { loadPolicies } = require("../utils/dataLoader");
const logger = require("../utils/logger");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── In-memory vector store (simulates FAISS for hackathon) ───
let vectorStore = []; // [{text, embedding, metadata}]
let pdfChunks = null;

// ─── Text chunking ───
function chunkText(text, chunkSize = 400, overlap = 50) {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    if (chunk.trim().length > 20) chunks.push(chunk);
  }
  return chunks;
}

// ─── Cosine similarity ───
function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return magA && magB ? dot / (magA * magB) : 0;
}

// ─── Generate embedding via OpenAI ───
async function getEmbedding(text) {
  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: text.substring(0, 8000),
  });
  return response.data[0].embedding;
}

// ─── Build vector index from PDF + policies ───
async function buildVectorIndex() {
  if (vectorStore.length > 0) return; // already built

  logger.info("🔨 Building vector index...");

  // 1. Load PDF chunks
  try {
    const pdfParse = require("pdf-parse");
    const buffer = fs.readFileSync(path.join(__dirname, "../data/University_Handbook_Complete_Detailed.pdf"));
    const pdfData = await pdfParse(buffer);
    pdfChunks = chunkText(pdfData.text, 400, 50);
    logger.info(`📄 PDF: ${pdfChunks.length} chunks`);

    for (let i = 0; i < pdfChunks.length; i++) {
      const embedding = await getEmbedding(pdfChunks[i]);
      vectorStore.push({ text: pdfChunks[i], embedding, metadata: { source: "University Handbook", chunk: i } });
    }
  } catch (e) {
    logger.warn("PDF index build failed: " + e.message);
  }

  // 2. Load policies
  const policies = loadPolicies();
  for (const p of policies) {
    const text = `[${p.Policy_Category}] ${p.Policy_Title}: ${p.Details}`;
    const embedding = await getEmbedding(text);
    vectorStore.push({ text, embedding, metadata: { source: "University Policies", category: p.Policy_Category } });
  }

  logger.info(`✅ Vector index built: ${vectorStore.length} vectors`);
}

// ─── Top-K semantic retrieval ───
async function retrieveTopK(query, k = 5) {
  if (vectorStore.length === 0) await buildVectorIndex();
  const queryEmbedding = await getEmbedding(query);
  const scored = vectorStore.map((doc) => ({
    ...doc,
    score: cosineSimilarity(queryEmbedding, doc.embedding),
  }));
  return scored.sort((a, b) => b.score - a.score).slice(0, k);
}

// ─── RAG answer generation ───
async function answerWithRAG(query) {
  const topDocs = await retrieveTopK(query, 5);
  const minScore = 0.25;
  const relevant = topDocs.filter((d) => d.score >= minScore);

  if (relevant.length === 0) {
    return {
      answer: "I could not find specific information about that in the university handbook. Please contact the university administration.",
      sources: [],
      type: "NOT_FOUND",
      confidence: 0,
    };
  }

  const context = relevant.map((d, i) => `[Source ${i + 1}: ${d.metadata.source}]\n${d.text}`).join("\n\n");
  const sources = [...new Set(relevant.map((d) => d.metadata.source))];
  const avgScore = relevant.reduce((s, d) => s + d.score, 0) / relevant.length;

  const systemPrompt = `You are a helpful University Assistant AI. Answer ONLY based on the provided context.
Rules:
- Only use information from the context below
- Always cite which source supports your answer (e.g., "According to [University Handbook]...")
- If the answer isn't in the context, say so clearly
- Be concise and student-friendly
- Never fabricate information

Context:
${context}`;

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    max_tokens: 700,
    temperature: 0.1,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: query },
    ],
  });

  return {
    answer: response.choices[0].message.content,
    sources,
    type: "RAG",
    confidence: Math.round(avgScore * 100),
  };
}

module.exports = { buildVectorIndex, answerWithRAG, retrieveTopK };
