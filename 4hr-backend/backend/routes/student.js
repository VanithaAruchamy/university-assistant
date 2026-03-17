// routes/student.js
const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const { getStudentById, maskStudentId } = require("../utils/dataLoader");

const router = express.Router();

// GET /api/student/attendance
router.get("/attendance", authenticateToken, (req, res) => {
  const student = getStudentById(req.user.student_id);
  if (!student) return res.status(404).json({ success: false, error: "Student not found." });

  const pct = student.Attendance_Percentage;
  let status, message;
  if (pct < 65)       { status = "Critical";     message = "Below 65% — may be barred from exams."; }
  else if (pct < 75)  { status = "Warning";       message = "65–74% — condonation required with medical proof and fine."; }
  else if (pct < 85)  { status = "Satisfactory";  message = "Meets minimum 75% attendance requirement."; }
  else                { status = "Excellent";      message = "Great attendance! Above 85%."; }

  return res.json({
    success: true,
    data: {
      student_id: maskStudentId(student.Student_ID),
      name: student.Name,
      department: student.Department,
      year: student.Year,
      attendance_percentage: pct,
      status,
      message,
      minimum_required: 75,
    },
  });
});

// GET /api/student/marks
router.get("/marks", authenticateToken, (req, res) => {
  const student = getStudentById(req.user.student_id);
  if (!student) return res.status(404).json({ success: false, error: "Student not found." });

  const cgpa = student.CGPA;
  let cgpaStatus;
  if (cgpa >= 9.0)      cgpaStatus = "Outstanding";
  else if (cgpa >= 8.0) cgpaStatus = "Excellent";
  else if (cgpa >= 7.0) cgpaStatus = "Good";
  else if (cgpa >= 6.0) cgpaStatus = "Average";
  else                  cgpaStatus = "Below Average";

  const internshipEligible = cgpa >= 7.0 && student.Attendance_Percentage >= 75 && student.Active_Backlogs === 0;

  return res.json({
    success: true,
    data: {
      student_id: maskStudentId(student.Student_ID),
      name: student.Name,
      department: student.Department,
      year: student.Year,
      cgpa,
      cgpa_status: cgpaStatus,
      active_backlogs: student.Active_Backlogs,
      internship_eligible: internshipEligible,
      internship_reason: internshipEligible
        ? "You meet all criteria (CGPA ≥ 7.0, Attendance ≥ 75%, No backlogs)"
        : `Not eligible: ${cgpa < 7.0 ? "CGPA below 7.0. " : ""}${student.Attendance_Percentage < 75 ? "Attendance below 75%. " : ""}${student.Active_Backlogs > 0 ? `${student.Active_Backlogs} active backlog(s).` : ""}`,
    },
  });
});

// GET /api/student/profile
router.get("/profile", authenticateToken, (req, res) => {
  const student = getStudentById(req.user.student_id);
  if (!student) return res.status(404).json({ success: false, error: "Student not found." });

  return res.json({
    success: true,
    data: {
      student_id: maskStudentId(student.Student_ID),
      name: student.Name,
      department: student.Department,
      year: student.Year,
      attendance_percentage: student.Attendance_Percentage,
      cgpa: student.CGPA,
      active_backlogs: student.Active_Backlogs,
    },
  });
});

module.exports = router;
