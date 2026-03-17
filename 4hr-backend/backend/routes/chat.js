// routes/chat.js
const express = require("express");
const OpenAI = require("openai");
const { authenticateToken } = require("../middleware/auth");
const { detectInjection, classifyQuery } = require("../middleware/guardrails");
const { answerWithRAG } = require("../services/ragService");
const { getStudentById, maskStudentId } = require("../utils/dataLoader");
const logger = require("../utils/logger");

const router = express.Router();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/chat
router.post("/", authenticateToken, async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ success: false, error: "Message cannot be empty." });
  }

  // 1. Guardrail: injection check
  const injectionCheck = detectInjection(message);
  if (injectionCheck.detected) {
    return res.status(403).json({
      success: false,
      error: injectionCheck.message,
      code: injectionCheck.type,
      response_type: "BLOCKED",
    });
  }

  // 2. Classify query
  const queryType = classifyQuery(message);
  logger.info(`[CHAT] Type=${queryType} User=${req.user.name} Query="${message.substring(0, 60)}"`);

  // 3. Route: personal data
  if (queryType === "PERSONAL_DATA") {
    const student = getStudentById(req.user.student_id);
    if (!student) return res.status(404).json({ success: false, error: "Student profile not found." });

    const internshipEligible = student.CGPA >= 7.0 && student.Attendance_Percentage >= 75 && student.Active_Backlogs === 0;

    const systemPrompt = `You are a University Assistant. Answer the student's question using ONLY the data below.
Be helpful, specific, and friendly. Apply university rules where relevant.
University rules: attendance < 75% needs condonation; internship needs CGPA >= 7.0, attendance >= 75%, no backlogs.
Internship eligible: ${internshipEligible ? "YES" : "NO"}.

Student Data:
Name: ${student.Name} | Dept: ${student.Department} | Year: ${student.Year}
Attendance: ${student.Attendance_Percentage}% | CGPA: ${student.CGPA} | Backlogs: ${student.Active_Backlogs}`;

    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      max_tokens: 500,
      temperature: 0.1,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    return res.json({
      success: true,
      response_type: "PERSONAL_DATA",
      answer: response.choices[0].message.content,
      data: {
        student_id: maskStudentId(student.Student_ID),
        name: student.Name,
        attendance: student.Attendance_Percentage,
        cgpa: student.CGPA,
        backlogs: student.Active_Backlogs,
      },
    });
  }

  // 4. Route: RAG
  try {
    const ragResult = await answerWithRAG(message);
    return res.json({
      success: true,
      response_type: "POLICY_RAG",
      answer: ragResult.answer,
      sources: ragResult.sources,
      confidence: ragResult.confidence,
    });
  } catch (err) {
    logger.error("RAG error: " + err.message);
    return res.status(500).json({ success: false, error: "Failed to retrieve policy information." });
  }
});

module.exports = router;
