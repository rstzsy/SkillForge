import { exec } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

export function transcribeAudio(filePath, expectedText = "") {
  return new Promise((resolve, reject) => {
    // ✅ Kiểm tra file tồn tại
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`Audio file not found: ${filePath}`));
    }

    // ✅ Lấy thư mục gốc của project (backend/)
    const projectRoot = path.resolve(process.cwd());
    const pythonScriptPath = path.join(projectRoot, "ai", "analyze_audio.py");
    const fullAudioPath = path.resolve(filePath);
    
    console.log("📂 Project root:", projectRoot);
    console.log("🐍 Python script path:", pythonScriptPath);

    // ✅ Kiểm tra script Python tồn tại
    if (!fs.existsSync(pythonScriptPath)) {
      return reject(new Error(`Python script not found: ${pythonScriptPath}`));
    }

    // Escape dấu " trong expectedText
    const safeExpected = expectedText.replace(/"/g, '\\"');

    // ✅ Tự động phát hiện hệ điều hành và tìm Python path
    const isWindows = os.platform() === "win32";
    
    // Các đường dẫn có thể có của Python venv (tuyệt đối)
    // Thử cả backend/venv/ VÀ backend/ai/venv/
    const possiblePythonPaths = [
      path.join(projectRoot, "venv", "bin", "python"),           // backend/venv/
      path.join(projectRoot, "venv", "bin", "python3"),          // backend/venv/ alt
      path.join(projectRoot, "ai", "venv", "bin", "python"),     // backend/ai/venv/
      path.join(projectRoot, "ai", "venv", "bin", "python3"),    // backend/ai/venv/ alt
      path.join(projectRoot, "venv", "Scripts", "python.exe"),   // Windows backend/venv/
      path.join(projectRoot, "ai", "venv", "Scripts", "python.exe"), // Windows backend/ai/venv/
    ];
    
    console.log("🔍 Searching for Python in these paths:");
    possiblePythonPaths.forEach(p => console.log("  -", p, fs.existsSync(p) ? "✅" : "❌"));
    
    // Tìm Python path đầu tiên tồn tại
    let pythonPath = possiblePythonPaths.find(p => fs.existsSync(p));
    
    if (!pythonPath) {
      const errorMsg = "❌ Python virtual environment not found!\n" +
        "Please run these commands:\n" +
        "  python3 -m venv venv\n" +
        "  source venv/bin/activate\n" +
        "  pip install openai-whisper torch numpy";
      console.error(errorMsg);
      throw new Error("Python venv not found. Check console for setup instructions.");
    }
    
    console.log("✅ Using Python:", pythonPath);

    const command = `"${pythonPath}" "${pythonScriptPath}" "${fullAudioPath}" "${safeExpected}"`;

    console.log("🐍 Running Python command:", command);

    exec(command, 
      { 
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: 60000 // 60s timeout
      }, 
      (err, stdout, stderr) => {
        if (err) {
          console.error("❌ Whisper Python error:", err);
          console.error("❌ stderr:", stderr);
          return reject(new Error(`Whisper execution failed: ${err.message}\nstderr: ${stderr}`));
        }

        if (stderr) {
          console.log("ℹ️ Python debug output:", stderr);
        }

        try {
          console.log("📄 Python stdout:", stdout);
          
          // ✅ Parse JSON từ stdout
          const output = JSON.parse(stdout.trim());
          
          // ✅ Kiểm tra nếu có lỗi trong output
          if (output.error) {
            console.error("❌ Whisper returned error:", output.error);
            return reject(new Error(`Whisper error: ${output.error}`));
          }
          
          resolve(output);
        } catch (parseErr) {
          console.error("❌ JSON parse error:", parseErr);
          console.error("❌ Raw output:", stdout);
          reject(new Error(`Failed to parse Whisper output: ${parseErr.message}\nOutput: ${stdout}`));
        }
      }
    );
  });
}