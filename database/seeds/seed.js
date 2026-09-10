#!/usr/bin/env node
/**
 * Seeds MongoDB with synthetic development data:
 *  - 1 admin user
 *  - 2 doctors (with users)
 *  - 2 patients (with users)
 *  - AI configs for doctors
 *  - conversations + messages
 *  - a doctor knowledge document (chunks are created via the /ingest endpoint)
 *  - a hospital capacity network with daily operational snapshots for forecast testing
 *
 * Idempotent: users are upserted by email; collections used match the
 * Mongoose pluralized names in apps/api (users, doctors, patients,
 * aiconfigs, conversations, messages, doctordocuments).
 */
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { MongoClient, ObjectId } = require("mongodb");

function loadEnv() {
  const envPath = path.join(__dirname, "..", "..", ".env");
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      const k = t.slice(0, i);
      const v = t.slice(i + 1);
      if (!(k in process.env)) process.env[k] = v;
    }
  }
}

async function upsertUser(db, { email, full_name, role, password }) {
  const hash = await bcrypt.hash(password, 10);
  const now = new Date();
  const filter = { email };
  const doc = {
    email,
    password_hash: hash,
    role,
    full_name,
    is_active: true,
    createdAt: now,
    updatedAt: now,
  };
  await db.collection("users").replaceOne(filter, doc, { upsert: true });
  return db.collection("users").findOne(filter);
}

async function upsertOne(db, collection, filter, doc) {
  await db.collection(collection).replaceOne(filter, doc, { upsert: true });
  return db.collection(collection).findOne(filter);
}

async function main() {
  loadEnv();
  const uri =
    process.env.MONGODB_URI || "mongodb://localhost:27017/medchat";
  const dbname = process.env.MONGODB_DB || "medchat";

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbname);
  const now = new Date();

  // users
  const admin = await upsertUser(db, {
    email: "admin@medchat.dev",
    full_name: "System Admin",
    role: "ADMIN",
    password: "admin12345",
  });

  const drSharma = await upsertUser(db, {
    email: "sharma@medchat.dev",
    full_name: "Dr. Anil Sharma",
    role: "DOCTOR",
    password: "doctor12345",
  });
  const drIyer = await upsertUser(db, {
    email: "iyer@medchat.dev",
    full_name: "Dr. Meera Iyer",
    role: "DOCTOR",
    password: "doctor12345",
  });

  const patRohan = await upsertUser(db, {
    email: "rohan@medchat.dev",
    full_name: "Rohan Desai",
    role: "PATIENT",
    password: "patient12345",
  });
  const patPriya = await upsertUser(db, {
    email: "priya@medchat.dev",
    full_name: "Priya Patel",
    role: "PATIENT",
    password: "patient12345",
  });

  const hospitalAdmin = await upsertUser(db, {
    email: "hospital@medchat.dev",
    full_name: "City General Administrator",
    role: "HOSPITAL",
    password: "hospital12345",
  });

  // doctors
  const doc1 = await upsertOne(
    db,
    "doctors",
    { user_id: drSharma._id },
    { user_id: drSharma._id, specialty: "General Medicine", license_no: "MH-12345", createdAt: now, updatedAt: now }
  );
  const doc2 = await upsertOne(
    db,
    "doctors",
    { user_id: drIyer._id },
    { user_id: drIyer._id, specialty: "Cardiology", license_no: "MH-67890", createdAt: now, updatedAt: now }
  );

  // patients
  const pat1 = await upsertOne(
    db,
    "patients",
    { user_id: patRohan._id },
    { user_id: patRohan._id, dob: "1990-05-12", sex: "M", blood_type: "O+", createdAt: now, updatedAt: now }
  );
  const pat2 = await upsertOne(
    db,
    "patients",
    { user_id: patPriya._id },
    { user_id: patPriya._id, dob: "1995-11-02", sex: "F", blood_type: "A+", createdAt: now, updatedAt: now }
  );

  // ai_configs
  await upsertOne(
    db,
    "aiconfigs",
    { doctor_id: doc1._id },
    {
      doctor_id: doc1._id,
      system_prompt: "You are Dr. Sharma's assistant for his patients.",
      response_style: "simple",
      language: "English",
      temperature: 0.2,
      max_tokens: 512,
      emergency_policy: "Escalate immediately to Dr. Sharma for any emergency keywords.",
      createdAt: now,
      updatedAt: now,
    }
  );

  // Hospital capacity network. These are synthetic operational records only;
  // they are designed to exercise the capacity forecasting dashboard and must
  // never be interpreted as real patient or facility data.
  const cityGeneral = await upsertOne(
    db,
    "hospitals",
    { code: "VITA-CGH-001" },
    {
      user_id: hospitalAdmin._id,
      code: "VITA-CGH-001",
      name: "City General Hospital",
      administrator_name: "City General Administrator",
      official_email: hospitalAdmin.email,
      location: { city: "Mumbai", latitude: 19.076, longitude: 72.8777 },
      icu_total_beds: 300,
      general_total_beds: 1500,
      active_doctors: 85,
      createdAt: now,
      updatedAt: now,
    }
  );

  const nearbyHospitals = [
    { code: "VITA-GVM-002", name: "Green Valley Medical Centre", distance_km: 4.8, icu_total_beds: 120, icu_occupied: 62, general_total_beds: 500, general_occupied: 275 },
    { code: "VITA-RSH-003", name: "Riverside Hospital", distance_km: 7.2, icu_total_beds: 90, icu_occupied: 76, general_total_beds: 380, general_occupied: 320 },
    { code: "VITA-MCH-004", name: "Metro Care Hospital", distance_km: 9.6, icu_total_beds: 160, icu_occupied: 101, general_total_beds: 700, general_occupied: 410 },
  ];
  for (const hospital of nearbyHospitals) {
    await upsertOne(db, "hospitals", { code: hospital.code }, {
      code: hospital.code,
      name: hospital.name,
      location: { city: "Mumbai", distance_from_city_general_km: hospital.distance_km },
      icu_total_beds: hospital.icu_total_beds,
      general_total_beds: hospital.general_total_beds,
      active_doctors: Math.round((hospital.icu_total_beds + hospital.general_total_beds) / 8),
      createdAt: now,
      updatedAt: now,
    });
  }

  // Fourteen daily observations make the ML model's trend features meaningful.
  // The final row exactly matches the dashboard's default test scenario.
  const cityHistory = [
    [238, 1085, 332, 112], [242, 1098, 340, 116], [247, 1110, 348, 119],
    [249, 1120, 360, 126], [255, 1140, 372, 130], [260, 1158, 381, 136],
    [268, 1176, 390, 142], [270, 1188, 393, 145], [272, 1192, 395, 147],
    [274, 1195, 396, 148], [276, 1197, 398, 149], [278, 1199, 399, 149],
    [279, 1200, 400, 150], [280, 1200, 400, 150],
  ];
  const snapshotStart = new Date(now);
  snapshotStart.setUTCDate(snapshotStart.getUTCDate() - (cityHistory.length - 1));
  snapshotStart.setUTCHours(0, 0, 0, 0);
  for (let index = 0; index < cityHistory.length; index += 1) {
    const [icu_occupied, general_occupied, opd_patients, emergency_patients] = cityHistory[index];
    const observed_at = new Date(snapshotStart);
    observed_at.setUTCDate(snapshotStart.getUTCDate() + index);
    await upsertOne(db, "hospitalcapacitysnapshots", { hospital_id: cityGeneral._id, observed_at }, {
      hospital_id: cityGeneral._id,
      observed_at,
      icu_occupied,
      general_occupied,
      opd_patients,
      emergency_patients,
      doctors_available: 85,
      source: "synthetic-seed",
      createdAt: now,
      updatedAt: now,
    });
  }

  // conversations + messages
  const conv1 = {
    patient_id: pat1._id,
    doctor_id: doc1._id,
    title: "Managing recurring headaches",
    summary: "Patient reported tension headaches over two weeks; not severe, no aura.",
    status: "open",
    createdAt: now,
    updatedAt: now,
  };
  const convResult = await db.collection("conversations").insertOne(conv1);

  await db.collection("messages").insertMany([
    {
      conversation_id: convResult.insertedId,
      sender: "patient",
      content: "Hello, I have had a headache for a few days. What should I do?",
      safety_flags: {},
      createdAt: now,
      updatedAt: now,
    },
    {
      conversation_id: convResult.insertedId,
      sender: "ai",
      content:
        "Based on the available guidance, frequent headaches warrant keeping a symptom diary and consulting your doctor if they worsen. I cannot make a diagnosis here.",
      safety_flags: {},
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // A knowledge document row (chunks get created when ingesting via the AI service)
  await upsertOne(
    db,
    "doctordocuments",
    { file_name: "headache-guidelines.txt" },
    {
      doctor_id: doc1._id,
      title: "Headache Management Guidelines",
      file_name: "headache-guidelines.txt",
      document_type: "medical",
      version: "1",
      uploaded_by: admin._id,
      status: "active",
      createdAt: now,
      updatedAt: now,
    }
  );

  console.log("Seed complete.");
  console.log("  Admin  : admin@medchat.dev / admin12345");
  console.log("  Doctor : sharma@medchat.dev / doctor12345");
  console.log("  Doctor : iyer@medchat.dev   / doctor12345");
  console.log("  Patient: rohan@medchat.dev  / patient12345");
  console.log("  Patient: priya@medchat.dev  / patient12345");
  console.log("  Hospital: hospital@medchat.dev / hospital12345");
  console.log("  Hospital capacity network: 4 synthetic hospitals / 14 daily snapshots");
  await client.close();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
