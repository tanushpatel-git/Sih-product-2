const { User, Doctor, Patient, Hospital, AuditLog } = require("../models/schemas");
const { hashPassword, comparePassword } = require("../utils/password");
const { signToken } = require("../utils/jwt");
const { AppError } = require("../utils/async");

function toAuthUser({ id, email, role, full_name, doctor_id, patient_id, hospital_id }) {
  return {
    id: String(id),
    email,
    role,
    full_name,
    doctor_id: doctor_id ? String(doctor_id) : undefined,
    patient_id: patient_id ? String(patient_id) : undefined,
    hospital_id: hospital_id ? String(hospital_id) : undefined,
  };
}

async function register(req, res) {
  const { email, password, fullName, role } = req.body;

  if (!email || !password || !fullName) {
    throw new AppError("email, password and fullName are required", 400);
  }
  if (role !== "DOCTOR" && role !== "PATIENT" && role !== "HOSPITAL") {
    throw new AppError("role must be DOCTOR, PATIENT, or HOSPITAL", 400);
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

  if (role === "HOSPITAL") {
    const { hospitalName, hospitalType, registrationNumber, phone, address, city, state, pincode, latitude, longitude, totalBeds, icuBeds, activeDoctors } = req.body;
    const total = Number(totalBeds);
    const icu = Number(icuBeds);
    const doctors = Number(activeDoctors);
    if (!hospitalName || !registrationNumber || !phone || !address || !city || !state || !pincode || !Number.isFinite(total) || !Number.isFinite(icu) || !Number.isFinite(doctors)) {
      throw new AppError("Complete all hospital profile and capacity fields", 400);
    }
    if (total <= 0 || icu < 0 || icu > total || doctors <= 0) {
      throw new AppError("Total beds must be positive, ICU beds cannot exceed total beds, and at least one doctor is required", 400);
    }
    const existingHospital = await Hospital.findOne({ registration_number: registrationNumber.trim() });
    if (existingHospital) throw new AppError("Hospital registration number already exists", 409);
    const latitudeNumber = Number(latitude);
    const longitudeNumber = Number(longitude);
    if (!Number.isFinite(latitudeNumber) || !Number.isFinite(longitudeNumber) || latitudeNumber < -90 || latitudeNumber > 90 || longitudeNumber < -180 || longitudeNumber > 180) {
      throw new AppError("Enter valid latitude and longitude for regional capacity matching", 400);
    }
    const hospital = await Hospital.create({
      user_id: user._id,
      code: `VITA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      name: hospitalName.trim(), hospital_type: hospitalType || null,
      registration_number: registrationNumber.trim(), administrator_name: fullName.trim(),
      official_email: user.email, phone: phone.trim(),
      location: { address: address.trim(), city: city.trim(), state: state.trim(), pincode: pincode.trim(), latitude: latitudeNumber, longitude: longitudeNumber },
      icu_total_beds: icu, general_total_beds: total - icu, active_doctors: doctors,
    });
    await AuditLog.create({ user_id: user._id, action: "REGISTER", entity: "HOSPITAL", entity_id: String(hospital._id) });
    const authUser = toAuthUser({ id: user._id, email: user.email, role: user.role, full_name: user.full_name, hospital_id: hospital._id });
    return res.status(201).json({ token: signToken(authUser), user: authUser, hospital });
  }

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
  const hospital = await Hospital.findOne({ user_id: user._id });

  const authUser = toAuthUser({
    id: user._id,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
    doctor_id: doctor?._id,
    patient_id: patient?._id,
    hospital_id: hospital?._id,
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
  const hospital = await Hospital.findOne({ user_id: user._id });
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
      hospital_id: hospital?._id,
      hospital,
    },
  });
}

module.exports = { register, login, me };
