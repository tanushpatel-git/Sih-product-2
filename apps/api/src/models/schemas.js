const { Schema, model, models } = require("mongoose");

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    role: { type: String, required: true, enum: ["ADMIN", "DOCTOR", "PATIENT", "HOSPITAL"] },
    full_name: { type: String, required: true },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const doctorSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    specialty: { type: String, default: null },
    license_no: { type: String, default: null },
  },
  { timestamps: true }
);

const patientSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    dob: { type: String, default: null },
    sex: { type: String, default: null },
    blood_type: { type: String, default: null },
  },
  { timestamps: true }
);

const doctorDocumentSchema = new Schema(
  {
    doctor_id: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    title: { type: String, required: true },
    file_name: { type: String, required: true },
    document_type: { type: String, default: null },
    version: { type: String, default: "1" },
    uploaded_by: { type: Schema.Types.ObjectId, ref: "User", default: null },
    status: {
      type: String,
      required: true,
      enum: ["pending", "processing", "active", "error"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const documentChunkSchema = new Schema(
  {
    document_id: { type: Schema.Types.ObjectId, ref: "DoctorDocument", required: true },
    doctor_id: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    content: { type: String, required: true },
    embedding: { type: [Number], default: [] },
    page_number: { type: Number, default: null },
    chunk_index: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);
documentChunkSchema.index({ doctor_id: 1, document_id: 1 });

const conversationSchema = new Schema(
  {
    patient_id: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor_id: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    title: { type: String, default: "New consultation" },
    summary: { type: String, default: null },
    status: {
      type: String,
      required: true,
      enum: ["open", "closed", "escalated"],
      default: "open",
    },
  },
  { timestamps: true }
);
conversationSchema.index({ patient_id: 1, updatedAt: -1 });
conversationSchema.index({ doctor_id: 1, updatedAt: -1 });

const messageSchema = new Schema(
  {
    conversation_id: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender: { type: String, required: true, enum: ["patient", "ai", "doctor", "system"] },
    content: { type: String, required: true },
    safety_flags: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);
messageSchema.index({ conversation_id: 1, createdAt: 1 });

const aiConfigSchema = new Schema(
  {
    doctor_id: { type: Schema.Types.ObjectId, ref: "Doctor", required: true, unique: true },
    system_prompt: { type: String, default: null },
    response_style: { type: String, default: null },
    language: { type: String, default: null },
    temperature: { type: Number, default: 0.2 },
    max_tokens: { type: Number, default: 512 },
    emergency_policy: { type: String, default: null },
  },
  { timestamps: true }
);

const auditLogSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", default: null },
    action: { type: String, required: true },
    entity: { type: String, default: null },
    entity_id: { type: String, default: null },
    ip: { type: String, default: null },
  },
  { timestamps: true }
);
auditLogSchema.index({ user_id: 1, createdAt: -1 });

const hospitalSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", default: null, unique: true, sparse: true },
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    hospital_type: { type: String, default: null },
    registration_number: { type: String, default: null, unique: true, sparse: true },
    administrator_name: { type: String, default: null },
    official_email: { type: String, default: null },
    phone: { type: String, default: null },
    location: { type: Schema.Types.Mixed, default: {} },
    icu_total_beds: { type: Number, required: true, min: 0 },
    general_total_beds: { type: Number, required: true, min: 0 },
    active_doctors: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

const hospitalCapacitySnapshotSchema = new Schema(
  {
    hospital_id: { type: Schema.Types.ObjectId, ref: "Hospital", required: true },
    observed_at: { type: Date, required: true },
    icu_occupied: { type: Number, required: true, min: 0 },
    general_occupied: { type: Number, required: true, min: 0 },
    opd_patients: { type: Number, required: true, min: 0 },
    emergency_patients: { type: Number, required: true, min: 0 },
    doctors_available: { type: Number, required: true, min: 0 },
    source: { type: String, default: "manual" },
  },
  { timestamps: true }
);
hospitalCapacitySnapshotSchema.index({ hospital_id: 1, observed_at: -1 }, { unique: true });

const getModel = (name, schema) => models[name] || model(name, schema);

module.exports = {
  User: getModel("User", userSchema),
  Doctor: getModel("Doctor", doctorSchema),
  Patient: getModel("Patient", patientSchema),
  DoctorDocument: getModel("DoctorDocument", doctorDocumentSchema),
  DocumentChunk: getModel("DocumentChunk", documentChunkSchema),
  Conversation: getModel("Conversation", conversationSchema),
  Message: getModel("Message", messageSchema),
  AiConfig: getModel("AiConfig", aiConfigSchema),
  AuditLog: getModel("AuditLog", auditLogSchema),
  Hospital: getModel("Hospital", hospitalSchema),
  HospitalCapacitySnapshot: getModel("HospitalCapacitySnapshot", hospitalCapacitySnapshotSchema),
};
