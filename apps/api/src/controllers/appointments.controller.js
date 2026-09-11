const { Appointment, Patient, Hospital, Report, AuditLog } = require("../models/schemas");
const { AppError } = require("../utils/async");

function patientDetails(patient) {
  return {
    id: String(patient._id), custom_id: patient.custom_id || `PAT-${String(patient._id).slice(-4).toUpperCase()}`,
    full_name: patient.user_id?.full_name || "Unknown Patient", email: patient.user_id?.email || "",
    dob: patient.dob, sex: patient.sex, blood_type: patient.blood_type, contact_phone: patient.contact_phone,
    emergency_contact: patient.emergency_contact || null, known_allergies: patient.known_allergies || [], chronic_conditions: patient.chronic_conditions || [],
  };
}

async function createAppointment(req, res) {
  const patient = await Patient.findOne({ user_id: req.user.id });
  if (!patient) throw new AppError("Patient profile not found", 404);
  const { scheduled_for, department, reason, hospital_id } = req.body;
  if (!scheduled_for || Number.isNaN(new Date(scheduled_for).getTime())) throw new AppError("A valid appointment date and time is required", 400);
  const hospital = hospital_id ? await Hospital.findById(hospital_id) : await Hospital.findOne({ code: "VITA-CGH-001" });
  if (!hospital) throw new AppError("Hospital not found", 404);
  const appointment = await Appointment.create({ patient_id: patient._id, hospital_id: hospital._id, scheduled_for: new Date(scheduled_for), department: department || "General Medicine", reason: reason || null, status: "requested" });
  await AuditLog.create({ user_id: req.user.id, action: "APPOINTMENT_REQUESTED", entity: "APPOINTMENT", entity_id: String(appointment._id) });
  res.status(201).json({ appointment });
}

async function getHospitalPatientAppointment(req, res) {
  const hospital = await Hospital.findOne({ user_id: req.user.id });
  if (!hospital) throw new AppError("Hospital profile not found", 404);
  const suppliedId = req.params.patientId.trim();
  const identifier = /^\d+$/.test(suppliedId) ? `PAT-${suppliedId}` : suppliedId;
  const patient = await Patient.findOne({ custom_id: new RegExp(`^${identifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") }).populate("user_id", "full_name email");
  if (!patient) throw new AppError("No patient found for that patient ID", 404);
  const appointments = await Appointment.find({ patient_id: patient._id, hospital_id: hospital._id }).sort({ scheduled_for: -1 }).lean();
  if (!appointments.length) throw new AppError("This patient has no appointments at your hospital", 404);
  await AuditLog.create({ user_id: req.user.id, action: "PATIENT_APPOINTMENT_VIEW", entity: "PATIENT", entity_id: String(patient._id) });
  res.json({ patient: patientDetails(patient), appointments });
}

async function uploadHospitalPatientReport(req, res) {
  const hospital = await Hospital.findOne({ user_id: req.user.id });
  if (!hospital) throw new AppError("Hospital profile not found", 404);
  const suppliedId = req.params.patientId.trim();
  const identifier = /^\d+$/.test(suppliedId) ? `PAT-${suppliedId}` : suppliedId;
  const patient = await Patient.findOne({ custom_id: new RegExp(`^${identifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") });
  if (!patient) throw new AppError("No patient found for that patient ID", 404);
  const appointment = await Appointment.exists({ patient_id: patient._id, hospital_id: hospital._id, status: { $in: ["requested", "confirmed", "completed"] } });
  if (!appointment) throw new AppError("A booked appointment is required before uploading a report", 403);
  if (!req.file) throw new AppError("Report file is required", 400);
  if (!req.body.title?.trim()) throw new AppError("Report title is required", 400);

  const report = await Report.create({
    patient_id: patient._id,
    type: req.body.type || "Other",
    title: req.body.title.trim(),
    summary: req.body.summary?.trim() || null,
    date: new Date(),
    file_url: `/uploads/reports/${req.file.filename}`,
    uploaded_by: req.user.id,
  });
  await AuditLog.create({ user_id: req.user.id, action: "HOSPITAL_REPORT_UPLOADED", entity: "REPORT", entity_id: String(report._id) });
  res.status(201).json({ report });
}

async function uploadMyPrescription(req, res) {
  const patient = await Patient.findOne({ user_id: req.user.id });
  if (!patient) throw new AppError("Patient profile not found", 404);
  if (!req.file) throw new AppError("Prescription file is required", 400);
  if (!req.body.title?.trim()) throw new AppError("Prescription title is required", 400);
  const report = await Report.create({
    patient_id: patient._id,
    type: "Prescription",
    title: req.body.title.trim(),
    summary: req.body.summary?.trim() || null,
    date: new Date(),
    file_url: `/uploads/reports/${req.file.filename}`,
    uploaded_by: req.user.id,
  });
  await AuditLog.create({ user_id: req.user.id, action: "PATIENT_PRESCRIPTION_UPLOADED", entity: "REPORT", entity_id: String(report._id) });
  res.status(201).json({ report });
}

module.exports = { createAppointment, getHospitalPatientAppointment, uploadHospitalPatientReport, uploadMyPrescription };
