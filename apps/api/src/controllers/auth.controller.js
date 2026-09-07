const { User, Doctor, Patient, AuditLog } = require("../models/schemas");
const { hashPassword, comparePassword } = require("../utils/password");
const { signToken } = require("../utils/jwt");
const { AppError } = require("../utils/async");

function toAuthUser({ id, email, role, full_name, doctor_id, patient_id }) {
  return {
    id: String(id),
    email,
    role,
    full_name,
    doctor_id: doctor_id ? String(doctor_id) : undefined,
    patient_id: patient_id ? String(patient_id) : undefined,
  };
}

async function register(req, res) {
  const { email, password, fullName, role } = req.body;

  if (!email || !password || !fullName) {
    throw new AppError("email, password and fullName are required", 400);
  }
  if (role !== "DOCTOR" && role !== "PATIENT") {
    throw new AppError("role must be DOCTOR or PATIENT", 400);
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) throw new AppError("Email already registered", 409);

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    email: email.toLowerCase().trim(),
    password_hash: passwordHash,
    role,
    full_name: fullName,
  });

  if (role === "DOCTOR") {
    const { specialty, licenseNo } = req.body;
    const doctor = await Doctor.create({
      user_id: user._id,
      specialty: specialty || null,
      license_no: licenseNo || null,
    });
    await AuditLog.create({ user_id: user._id, action: "REGISTER", entity: "DOCTOR", entity_id: String(doctor._id) });
    const authUser = toAuthUser({ id: user._id, email: user.email, role: user.role, full_name: user.full_name, doctor_id: doctor._id });
    res.status(201).json({ token: signToken(authUser), user: authUser });
  } else {
    const { dob, sex, bloodType } = req.body;
    const patient = await Patient.create({
      user_id: user._id,
      dob: dob || null,
      sex: sex || null,
      blood_type: bloodType || null,
    });
    await AuditLog.create({ user_id: user._id, action: "REGISTER", entity: "PATIENT", entity_id: String(patient._id) });
    const authUser = toAuthUser({ id: user._id, email: user.email, role: user.role, full_name: user.full_name, patient_id: patient._id });
    res.status(201).json({ token: signToken(authUser), user: authUser });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError("email and password are required", 400);
  }
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user || !user.is_active) {
    throw new AppError("Invalid credentials", 401);
  }
  const ok = await comparePassword(password, user.password_hash);
  if (!ok) throw new AppError("Invalid credentials", 401);

  const doctor = await Doctor.findOne({ user_id: user._id });
  const patient = await Patient.findOne({ user_id: user._id });

  const authUser = toAuthUser({
    id: user._id,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
    doctor_id: doctor?._id,
    patient_id: patient?._id,
  });
  const token = signToken(authUser);
  await AuditLog.create({ user_id: user._id, action: "LOGIN", entity: "user", entity_id: String(user._id) });
  res.json({ token, user: authUser });
}

async function me(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) throw new AppError("Not found", 404);
  const doctor = await Doctor.findOne({ user_id: user._id });
  const patient = await Patient.findOne({ user_id: user._id });
  res.json({
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      doctor_id: doctor?._id,
      doctor,
      patient_id: patient?._id,
      patient,
    },
  });
}

module.exports = { register, login, me };