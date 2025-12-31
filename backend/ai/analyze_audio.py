import sys
import json
import whisper
import warnings
import ssl
import os
import gc
import wave

warnings.filterwarnings("ignore")
ssl._create_default_https_context = ssl._create_unverified_context

# ✅ MODEL LOAD 1 LẦN DUY NHẤT
MODEL = None

def load_model_once():
    global MODEL
    if MODEL is None:
        MODEL = whisper.load_model("tiny", device="cpu")
    return MODEL

def get_audio_duration(path):
    with wave.open(path, 'rb') as f:
        return f.getnframes() / f.getframerate()

def analyze(audio_path, expected_text=""):
    try:
        # ✅ Giới hạn audio (BẮT BUỘC)
        if get_audio_duration(audio_path) > 30:
            print(json.dumps({"error": "Audio too long (max 30 seconds)"}), flush=True)
            return

        model = load_model_once()

        result = model.transcribe(
            audio_path,
            language="en",
            fp16=False,
            verbose=False
        )

        text = result.get("text", "").strip()
        if not text:
            text = "No speech detected in the audio."

        analysis = {
            "transcript": text,
            "pronunciation_score": 7.5,
            "fluency_score": 7.0,
            "grammar_score": 6.5,
            "vocab_score": 7.0,
            "ai_score": 7.0,
            "feedback": "Your pronunciation and fluency are acceptable. Improve your grammar in complex sentences."
        }

        print(json.dumps(analysis), flush=True)

    except Exception as e:
        print(json.dumps({
            "error": str(e),
            "transcript": "Error transcribing audio",
            "pronunciation_score": 0,
            "fluency_score": 0,
            "grammar_score": 0,
            "vocab_score": 0,
            "ai_score": 0,
            "feedback": f"Transcription failed: {str(e)}"
        }), flush=True)

    finally:
        # ✅ DỌN RAM
        if os.path.exists(audio_path):
            os.remove(audio_path)
        gc.collect()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No audio path provided"}), flush=True)
        sys.exit(1)

    audio_path = sys.argv[1]
    expected_text = sys.argv[2] if len(sys.argv) > 2 else ""

    sys.stderr = open(os.devnull, "w")
    analyze(audio_path, expected_text)
