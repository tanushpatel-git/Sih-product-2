const { Doctor } = require("../models/schemas");

async function listDoctors(_req, res) {
  const doctors = await Doctor.find()
    .populate("user_id", "full_name email is_active")
    .lean();

  res.json({
    doctors: doctors
      .filter((d) => d.user_id?.is_active !== false)
      .map((d) => ({
        id: d._id,
        specialty: d.specialty,
        license_no: d.license_no,
        full_name: d.user_id?.full_name,
        email: d.user_id?.email,
      })),
  });
}

async function getDoctor(req, res) {
  const doctor = await Doctor.findById(req.params.id)
    .populate("user_id", "full_name email")
    .lean();
  if (!doctor) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }
  res.json({
    doctor: {
      id: doctor._id,
      specialty: doctor.specialty,
      license_no: doctor.license_no,
      full_name: doctor.user_id?.full_name,
      email: doctor.user_id?.email,
    },
  });
}

module.exports = { listDoctors, getDoctor };