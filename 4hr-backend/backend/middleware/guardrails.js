// middleware/guardrails.js
const logger = require("../utils/logger");

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous\s+)?instructions/i,
  /forget\s+everything/i,
  /you\s+are\s+now/i,
  /act\s+as\s+(a\s+)?different/i,
  /bypass\s+(security|auth|rules|guardrails)/i,
  /show\s+(all|every)\s+(student|user|data|record)/i,
  /list\s+all\s+students/i,
  /dump\s+(all|database|data)/i,
  /reveal\s+(all|hidden|secret|config|system)/i,
  /system\s+prompt/i,
  /jailbreak/i,
  /DAN\s+mode/i,
  /override\s+(all\s+)?restrictions/i,
];

const PERSONAL_KEYWORDS = [
  "my attendance", "my marks", "my cgpa", "my backlogs",
  "my score", "my grade", "my result", "my performance",
  "my percentage", "what is my", "show my", "tell me my",
  "am i eligible", "my academic",
];

function detectInjection(query) {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(query)) {
      logger.warn(`[GUARDRAIL] Injection attempt blocked: "${query.substring(0, 80)}"`);
      return { detected: true, type: "PROMPT_INJECTION", message: "Query blocked: potentially malicious content detected." };
    }
  }
  return { detected: false };
}

function classifyQuery(query) {
  const lower = query.toLowerCase();
  for (const kw of PERSONAL_KEYWORDS) {
    if (lower.includes(kw)) return "PERSONAL_DATA";
  }
  return "POLICY_RAG";
}

module.exports = { detectInjection, classifyQuery };
