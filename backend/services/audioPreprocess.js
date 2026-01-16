import { exec } from "child_process";
import fs from "fs";
import path from "path";

export function preprocessAudio(inputPath) {
  return new Promise((resolve, reject) => {
    const outputPath = inputPath.replace(/\.(webm|m4a)$/, "_clean.wav");

    const cmd = `
      ffmpeg -y -i "${inputPath}" \
      -af "highpass=f=80, lowpass=f=8000, afftdn=nf=-25, loudnorm" \
      "${outputPath}"
    `;

    exec(cmd, (err) => {
      if (err) return reject(err);
      if (!fs.existsSync(outputPath)) return reject("Cleaned audio not found");
      resolve(outputPath);
    });
  });
}
