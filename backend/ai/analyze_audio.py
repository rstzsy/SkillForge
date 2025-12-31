import sys
import json
import whisper
import warnings
import ssl
import os

warnings.filterwarnings("ignore")
ssl._create_default_https_context = ssl._create_unverified_context

def analyze(audio_path, expected_text=""):
    try:
        # Load model (suppress output hoàn toàn)
        model = whisper.load_model("base", download_root=None)
        
        # ✅ Transcribe với verbose=False và suppress warnings
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            result = model.transcribe(
                audio_path,
                language='en',
                fp16=False,
                verbose=False,
                word_timestamps=False
            )
        
        text = result["text"].strip()
        
        if not text:
            text = "No speech detected in the audio."
        
        # Phần chấm điểm mô phỏng
        feedback = "Your pronunciation and fluency are acceptable. Improve your grammar in complex sentences."
        
        analysis = {
            "transcript": text,
            "pronunciation_score": 7.5,
            "fluency_score": 7.0,
            "grammar_score": 6.5,
            "vocab_score": 7.0,
            "ai_score": 7.0,
            "feedback": feedback
        }
        
        # ✅ CRITICAL: Chỉ print JSON ra stdout, không có gì khác
        print(json.dumps(analysis), flush=True)
        
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
        print(json.dumps(error_output), flush=True)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No audio path provided"}), flush=True)
        sys.exit(1)
    
    audio_path = sys.argv[1]
    expected_text = sys.argv[2] if len(sys.argv) > 2 else ""
    
    # ✅ Redirect stderr để tránh nhiễu output
    sys.stderr = open(os.devnull, 'w')
    
    analyze(audio_path, expected_text)