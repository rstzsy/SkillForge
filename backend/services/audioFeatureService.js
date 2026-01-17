import { exec } from "child_process";
import path from "path";
import fs from "fs";

export function analyzeAudioWithOpenSmile(audioPath) {
  return new Promise((resolve, reject) => {
    const outputJson = audioPath.replace(/\.\w+$/, ".json");

    const cmd = `
      SMILExtract 
      -C /usr/share/opensmile/config/gemaps/eGeMAPSv02.conf 
      -I "${audioPath}" 
      -O "${outputJson}"
    `;

    exec(cmd, (error) => {
      if (error) {
        console.error("❌ openSMILE failed:", error);
        return reject(error);
      }

      if (!fs.existsSync(outputJson)) {
        return reject(new Error("openSMILE output not found"));
      }

      const raw = fs.readFileSync(outputJson, "utf8");
      resolve(JSON.parse(raw));
    });
  });
}