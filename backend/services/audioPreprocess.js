import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

ffmpeg.setFfmpegPath(ffmpegPath);

export async function preprocessAudio(inputPath) {
  return new Promise((resolve, reject) => {
    const outputPath = inputPath.replace(/\.\w+$/, ".wav");

    ffmpeg(inputPath)
      .audioChannels(1)        // mono
      .audioFrequency(16000)   // 16kHz
      .format("wav")
      .on("end", () => resolve(outputPath))
      .on("error", reject)
      .save(outputPath);
  });
}
