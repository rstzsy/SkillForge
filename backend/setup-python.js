import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.resolve(__dirname);

const isWindows = os.platform() === "win32";
const venvPath = path.join(projectRoot, "venv");
const pythonExe = isWindows 
  ? path.join(venvPath, "Scripts", "python.exe")
  : path.join(venvPath, "bin", "python3");
const pipExe = isWindows
  ? path.join(venvPath, "Scripts", "pip")
  : path.join(venvPath, "bin", "pip");

console.log("🐍 Checking Python virtual environment...");
console.log("📂 Project root:", projectRoot);

// Kiểm tra xem packages đã được cài đủ chưa
function checkPackagesInstalled() {
  if (!fs.existsSync(pythonExe)) {
    return false;
  }
  
  try {
    console.log("🔍 Verifying installed packages...");
    execSync(`"${pythonExe}" -c "import whisper; import torch; import numpy"`, { 
      stdio: "pipe" 
    });
    console.log("✅ All packages are installed correctly");
    return true;
  } catch {
    console.log("⚠️  Packages are missing or incomplete");
    return false;
  }
}

// Nếu packages đã đủ, không cần setup
if (checkPackagesInstalled()) {
  console.log("✅ Python environment is ready!");
  process.exit(0);
}

// Nếu venv tồn tại nhưng packages không đủ, xóa đi tạo lại
if (fs.existsSync(venvPath)) {
  console.log("🗑️  Removing incomplete venv...");
  try {
    fs.rmSync(venvPath, { recursive: true, force: true });
    console.log("✅ Old venv removed");
  } catch (error) {
    console.error("❌ Failed to remove old venv:", error.message);
    console.error("Please manually delete the 'venv' folder and try again");
    process.exit(1);
  }
}

console.log("🔧 Setting up fresh Python environment...");

try {
  // Kiểm tra python3 có sẵn không
  try {
    const pythonVersion = execSync("python3 --version", { stdio: "pipe" }).toString();
    console.log("✅ Found:", pythonVersion.trim());
  } catch {
    console.error("❌ Python 3 is not installed or not in PATH");
    console.error("Please install Python 3 from https://www.python.org/downloads/");
    process.exit(1);
  }

  // Bước 1: Tạo venv
  console.log("\n📦 Step 1/4: Creating Python virtual environment...");
  execSync("python3 -m venv venv", { 
    cwd: projectRoot,
    stdio: "inherit" 
  });
  console.log("✅ Virtual environment created");
  
  // Bước 2: Upgrade pip
  console.log("\n🔄 Step 2/4: Upgrading pip...");
  execSync(`"${pipExe}" install --upgrade pip`, { 
    cwd: projectRoot,
    stdio: "inherit",
    timeout: 120000 // 2 minutes
  });
  console.log("✅ Pip upgraded");
  
  // Bước 3: Cài numpy trước (dependency của các package khác)
  console.log("\n📥 Step 3/4: Installing numpy...");
  execSync(`"${pipExe}" install numpy --no-cache-dir`, { 
    cwd: projectRoot,
    stdio: "inherit",
    timeout: 180000 // 3 minutes
  });
  console.log("✅ Numpy installed");
  
  // Bước 4: Cài torch và whisper
  console.log("\n📥 Step 4/4: Installing PyTorch and Whisper...");
  console.log("⏳ This may take 5-10 minutes on Render...");
  
  // Cài torch với CPU-only version (nhẹ hơn)
  execSync(`"${pipExe}" install torch --index-url https://download.pytorch.org/whl/cpu --no-cache-dir`, { 
    cwd: projectRoot,
    stdio: "inherit",
    timeout: 600000 // 10 minutes
  });
  console.log("✅ PyTorch installed");
  
  // Cài whisper
  execSync(`"${pipExe}" install openai-whisper --no-cache-dir`, { 
    cwd: projectRoot,
    stdio: "inherit",
    timeout: 300000 // 5 minutes
  });
  console.log("✅ Whisper installed");
  
  // Verify lại sau khi cài
  console.log("\n🔍 Verifying installation...");
  execSync(`"${pythonExe}" -c "import whisper; import torch; import numpy; print('All modules imported successfully')"`, { 
    cwd: projectRoot,
    stdio: "inherit" 
  });
  
  console.log("\n✅ Python packages installed successfully!");
  console.log("🎉 Setup complete! You can now start the server with: npm run dev");
  
} catch (error) {
  console.error("\n❌ Failed to setup Python environment!");
  console.error("Error:", error.message);
  console.error("\n📝 Manual setup instructions:");
  console.error("  cd backend");
  console.error("  python3 -m venv venv");
  console.error(isWindows 
    ? "  venv\\Scripts\\activate" 
    : "  source venv/bin/activate");
  console.error("  pip install --upgrade pip");
  console.error("  pip install numpy");
  console.error("  pip install torch --index-url https://download.pytorch.org/whl/cpu");
  console.error("  pip install openai-whisper");
  process.exit(1);
}