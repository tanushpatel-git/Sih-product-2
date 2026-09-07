const { AiConfig, Doctor } = require("../models/schemas");
const { AppError } = require("../utils/async");

async function getMyAiConfig(req, res) {
  const doctor = await requireDoctor(req.user.id);
  const config = await AiConfig.findOne({ doctor_id: doctor._id });
  res.json({ config: config ? toJson(config) : null });
}

async function upsertMyAiConfig(req, res) {
  const doctor = await requireDoctor(req.user.id);
  const { system_prompt, response_style, language, temperature, max_tokens, emergency_policy } = req.body;

  const config = await AiConfig.findOneAndUpdate(
    { doctor_id: doctor._id },
    {
      $set: {
        system_prompt: system_prompt ?? null,
        response_style: response_style ?? null,
        language: language ?? null,
        temperature: temperature ?? 0.2,
        max_tokens: max_tokens ?? 512,
        emergency_policy: emergency_policy ?? null,
      },
    },
    { new: true, upsert: true }
  );
  res.json({ config: toJson(config) });
}

function toJson(c) {
  return {
    id: c._id,
    doctor_id: c.doctor_id,
    system_prompt: c.system_prompt,
    response_style: c.response_style,
    language: c.language,
    temperature: c.temperature,
    max_tokens: c.max_tokens,
    emergency_policy: c.emergency_policy,
  };
}

async function requireDoctor(userId) {
  const doctor = await Doctor.findOne({ user_id: userId });
  if (!doctor) throw new AppError("Doctor profile not found", 404);
  return doctor;
}

module.exports = { getMyAiConfig, upsertMyAiConfig };