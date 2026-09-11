import asyncio
import os
import shutil
import subprocess
import tempfile
from functools import lru_cache
from typing import Optional

from fastapi import APIRouter, File, Form, UploadFile

from ...config import settings

router = APIRouter()

# Locate ffmpeg
FFMPEG_PATH = (
    shutil.which("ffmpeg")
    or "/opt/homebrew/bin/ffmpeg"
    or "/usr/local/bin/ffmpeg"
    or "/usr/bin/ffmpeg"
)


@lru_cache(maxsize=1)
def _get_whisper_model():
    """
    Lazily load the faster-whisper model (multilingual / Hinglish capable).

    Returns None when faster-whisper is not installed so the request path can
    degrade gracefully to the legacy speech_recognition backend.
    """
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        return None

    try:
        return WhisperModel(
            settings.whisper_model,
            device=settings.whisper_device,
            compute_type=settings.whisper_compute_type,
        )
    except Exception:
        return None


def _whisper_hint(language: Optional[str]) -> Optional[str]:
    """
    Map a locale like `en-IN` / `hi-IN` to a Whisper language hint.

    Hinglish is heavily code-switched, so English hints are dropped entirely and
    Whisper auto-detects the dominant language per segment (best multilingual
    compatibility). An explicit Hindi hint is preserved.
    """
    if not language:
        return None
    lang = language.strip().split("-")[0].lower()
    if lang == "hi":
        return "hi"
    return None


def _run_whisper(wav_path: str, language: Optional[str]) -> Optional[dict]:
    """Transcribe audio with faster-whisper. Returns None if unavailable."""
    model = _get_whisper_model()
    if model is None:
        return None

    segments_iter, info = model.transcribe(
        wav_path, language=_whisper_hint(language), vad_filter=True
    )
    parts = [seg.text.strip() for seg in segments_iter]
    text = " ".join(p for p in parts if p).strip()
    return {
        "transcript": text or "",
        "language": info.language,
        "duration": info.duration,
        "source": "faster-whisper",
        "status": "transcribed" if text else "no_speech",
    }


def _speech_recognition_fallback(wav_path: str, language: Optional[str]) -> dict:
    """Legacy Google STT fallback when faster-whisper is not installed."""
    import speech_recognition as sr

    recognizer = sr.Recognizer()
    recognizer.energy_threshold = 300
    recognizer.dynamic_energy_threshold = True

    candidates: list[str]
    if language and language.strip().split("-")[0].lower() in ("hi", "en"):
        candidates = [language.strip().split("-")[0].lower()]
    else:
        candidates = ["en-IN", "en-US"]

    try:
        with sr.AudioFile(wav_path) as source:
            audio_data = recognizer.record(source)
        for candidate in candidates:
            try:
                raw_text = recognizer.recognize_google(audio_data, language=candidate)
                if raw_text and len(raw_text.strip()) > 3:
                    return {
                        "transcript": raw_text.strip(),
                        "language": candidate,
                        "source": "speech_recognition",
                        "status": "transcribed",
                    }
            except Exception:
                continue
    except Exception:
        pass

    return {
        "transcript": "",
        "language": language,
        "source": "speech_recognition",
        "status": "no_speech",
    }


async def _transcribe_audio_file(input_path: str, language: Optional[str]) -> dict:
    """Convert input to 16kHz mono WAV (ffmpeg) and transcribe via Whisper first."""
    temp_dir = os.path.dirname(input_path)
    output_wav = os.path.join(temp_dir, "audio_16k.wav")

    target = input_path
    if os.path.exists(FFMPEG_PATH):
        cmd = [
            FFMPEG_PATH,
            "-y",
            "-i", input_path,
            "-ar", "16000",
            "-ac", "1",
            output_wav,
        ]
        subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=30)
        if os.path.exists(output_wav) and os.path.getsize(output_wav) > 100:
            target = output_wav

    if _get_whisper_model() is not None:
        result = await asyncio.to_thread(_run_whisper, target, language)
        if result is not None:
            return result

    return await asyncio.to_thread(_speech_recognition_fallback, target, language)


@router.post("/transcribe-audio")
async def transcribe_audio(
    file: UploadFile = File(...),
    language: Optional[str] = Form("auto"),
    patient_name: Optional[str] = Form(None),
):
    """
    Accepts consultation audio (webm, wav, m4a, mp3, ogg), converts to 16kHz mono
    wav via ffmpeg, and transcribes with faster-whisper.

    Whisper is multilingual / Hinglish compatible: the language auto-detects
    (or follows a `hi-IN` hint) so doctor-patient Hinglish conversations are
    captured in the same transcript. Falls back to legacy speech_recognition
    when faster-whisper is not installed.
    """
    content = await file.read()
    if not content:
        return {
            "transcript": "",
            "status": "no_audio",
            "source": "faster-whisper",
        }

    temp_dir = tempfile.mkdtemp(prefix="audio_transcribe_")
    input_path = os.path.join(temp_dir, file.filename or "input.webm")
    try:
        with open(input_path, "wb") as f:
            f.write(content)

        return await _transcribe_audio_file(input_path, language)
    finally:
        try:
            shutil.rmtree(temp_dir, ignore_errors=True)
        except Exception:
            pass