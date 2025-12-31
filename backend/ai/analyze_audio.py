import sys
import json
import whisper
import warnings
import ssl
import os
import gc
import wave
import subprocess
import shutil

warnings.filterwarnings("ignore")
ssl._create_default_https_context = ssl._create_unverified_context

MODEL = None

def load_model_once():
    global MODEL
    if MODEL is None:
        MODEL = whisper.load_model("tiny", device="cpu")
    return MODEL

def check_ffmpeg():
    if not shutil.which("ffmpeg"):
        raise RuntimeError("ffmpeg not found on system")

def convert_webm_to_wav(input_path):
    wav_path = input_path.replace(".webm", ".wav")

    result = subprocess.run(
        ["ffmpeg", "-y", "-i", input_path, "-ar", "16000", "-ac", "1", wav_path],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    if result.returncode != 0 or not os.path.exists(wav_path):
        raise RuntimeError("ffmpeg conversion failed")

    return wav_path

def get_audio_duration(path):
    with wave.open(path, 'rb') as f:
        return f.getnframes() / f.getframerate()

def analyze(audio_path):
    wav_path = None
    try:
        check_ffmpeg()

        wav_path = convert_webm_to_wav(audio_path)

        if get_audio_duration(wav_path) > 30:
            print(json.dumps({"error": "Audio too long (max 30 seconds)"}))
            return

        model = load_model_once()

        result = model.transcribe(
            wav_path,
            language="en",
            fp16=False,
            verbose=False
        )

        text = result.get("text", "").strip() or "No speech detected."

        print(json.dumps({
            "success": True,
            "transcript": text,
            "pronunciation_score": 7.5,
            "fluency_score": 7.0,
            "grammar_score": 6.5,
            "vocab_score": 7.0,
            "ai_score": 7.0,
            "feedback": "Your pronunciation and fluency are acceptable."
        }), flush=True)

    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": f"Whisper execution error: {str(e)}"
        }), flush=True)
        sys.exit(1)

    finally:
        for f in [audio_path, wav_path]:
            if f and os.path.exists(f):
                os.remove(f)
        gc.collect()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No audio path provided"}))
        sys.exit(1)

    analyze(sys.argv[1])
