import { exec } from "child_process";
import fs from "fs";
import ffmpegPath from "ffmpeg-static";

export function preprocessAudio(inputPath) {
  return new Promise((resolve, reject) => {
    const outputPath = inputPath.replace(/\.(webm|m4a|wav)$/, "_clean.wav");

    const cmd = `
      "${ffmpegPath}" -y -i "${inputPath}" \
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
