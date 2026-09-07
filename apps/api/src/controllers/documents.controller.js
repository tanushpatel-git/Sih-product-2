const { DoctorDocument, Doctor } = require("../models/schemas");
const mongoose = require("mongoose");
const { AppError } = require("../utils/async");
const { ingestDocument } = require("../services/aiClient");

async function listMyDocuments(req, res) {
  const doctor = await requireDoctor(req.user.id);
  const docs = await DoctorDocument.find({ doctor_id: doctor._id }).sort({ createdAt: -1 }).lean();
  res.json({
    documents: docs.map((d) => ({
      id: d._id,
      doctor_id: d.doctor_id,
      title: d.title,
      file_name: d.file_name,
      document_type: d.document_type,
      version: d.version,
      status: d.status,
      created_at: d.createdAt,
      updated_at: d.updatedAt,
    })),
  });
}

async function uploadDocument(req, res) {
  const user = req.user;
  const doctor = await requireDoctor(user.id);
  if (!req.file) throw new AppError("file is required", 400);

  const { title, documentType, version } = req.body;

  const doc = await DoctorDocument.create({
    doctor_id: doctor._id,
    title: title || req.file.originalname,
    file_name: req.file.originalname,
    document_type: documentType || null,
    version: version || "1",
    uploaded_by: user.id,
    status: "pending",
  });

  doc.status = "processing";
  await doc.save();

  try {
    const result = await ingestDocument(
      String(doc._id),
      String(doctor._id),
      req.file.buffer,
      req.file.originalname
    );
    doc.status = result.ok === true ? "active" : "error";
    await doc.save();
    res.status(201).json({
      document: {
        id: doc._id,
        doctor_id: doc.doctor_id,
        title: doc.title,
        file_name: doc.file_name,
        document_type: doc.document_type,
        version: doc.version,
        status: doc.status,
      },
      chunks: result.chunkCount,
    });
  } catch (e) {
    doc.status = "error";
    await doc.save();
    throw e;
  }
}

async function deleteDocument(req, res) {
  const doctor = await requireDoctor(req.user.id);
  const result = await DoctorDocument.findOneAndDelete({
    _id: req.params.id,
    doctor_id: doctor._id,
  });
  if (!result) throw new AppError("Document not found", 404);
  await mongoose.connection
    .collection("documentchunks")
    .deleteMany({ document_id: String(result._id), doctor_id: String(doctor._id) });
  res.json({ deleted: true });
}

async function requireDoctor(userId) {
  const doctor = await Doctor.findOne({ user_id: userId });
  if (!doctor) throw new AppError("Doctor profile not found", 404);
  return doctor;
}

module.exports = { listMyDocuments, uploadDocument, deleteDocument };