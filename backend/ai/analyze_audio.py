import sys
import json
import whisper
import warnings
import ssl
import os

warnings.filterwarnings("ignore")

# ✅ FIX SSL certificate error
ssl._create_default_https_context = ssl._create_unverified_context

def analyze(audio_path, expected_text=""):
    try:
        print(f"Loading Whisper model...", file=sys.stderr)
        
        # Load model từ cache (đã download rồi)
        model = whisper.load_model("base")
        
        print(f"Transcribing audio: {audio_path}", file=sys.stderr)
        
        # ✅ Transcribe với các options tối ưu
        result = model.transcribe(
            audio_path,
            language='en',
            fp16=False,
            verbose=False
        )
        
        text = result["text"].strip()
        
        if not text:
            text = "No speech detected in the audio."
        
        print(f"Transcript: {text}", file=sys.stderr)
        
        # Phần chấm điểm mô phỏng
        feedback = f"Your pronunciation and fluency are acceptable. Improve your grammar in complex sentences."
        
        analysis = {
            "transcript": text,
            "pronunciation_score": 7.5,
            "fluency_score": 7.0,
            "grammar_score": 6.5,
            "vocab_score": 7.0,
            "ai_score": 7.0,
            "feedback": feedback
        }
        
        # Output JSON
        print(json.dumps(analysis))
        
    except Exception as e:
        error_output = {
            "error": str(e),
            "transcript": "Error transcribing audio",
            "pronunciation_score": 0,
            "fluency_score": 0,
            "grammar_score": 0,
            "vocab_score": 0,
            "ai_score": 0,
            "feedback": f"Transcription failed: {str(e)}"
        }
        print(json.dumps(error_output))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No audio path provided"}))
        sys.exit(1)
    
    audio_path = sys.argv[1]
    expected_text = sys.argv[2] if len(sys.argv) > 2 else ""
    analyze(audio_path, expected_text)