// routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const { getStudentById } = require("../utils/dataLoader");
const logger = require("../utils/logger");

const router = express.Router();

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { student_id, password } = req.body;

  if (!student_id) {
    return res.status(400).json({ success: false, error: "student_id is required" });
  }

  const student = getStudentById(student_id);
  if (!student) {
    return res.status(401).json({ success: false, error: "Student not found. Check your Student ID." });
  }

  if (password !== "password123") {
    logger.warn(`Failed login attempt for student_id: ${student_id}`);
    return res.status(401).json({ success: false, error: "Invalid password. Use: password123" });
  }

  const token = jwt.sign(
    { student_id: student.Student_ID, name: student.Name, department: student.Department },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  logger.info(`Student logged in: ${student.Name} (${student.Department})`);
  return res.json({
    success: true,
    token,
    student: { name: student.Name, department: student.Department, year: student.Year, student_id: student.Student_ID },
  });
});

module.exports = router;
