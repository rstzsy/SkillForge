export function compareTranscriptWithExpected(transcript, expectedText) {
  if (!expectedText) return [];

  const normalize = (text) =>
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/);

  const spoken = normalize(transcript);
  const expected = normalize(expectedText);

  const issues = [];

  expected.forEach((word, index) => {
    const spokenWord = spoken[index];

    if (!spokenWord) {
      issues.push({
        type: "pronunciation",
        text: word,
        correction: word,
        explanation: "Từ này có thể đã bị bỏ sót hoặc nuốt âm khi phát âm.",
      });
      return;
    }

    // ❗ Các lỗi accent phổ biến
    const commonMistakes = [
      ["think", "sink"],
      ["three", "tree"],
      ["learning", "leaning"],
      ["this", "dis"],
      ["that", "dat"],
    ];

    commonMistakes.forEach(([correct, wrong]) => {
      if (word === correct && spokenWord === wrong) {
        issues.push({
          type: "pronunciation",
          text: spokenWord,
          correction: correct,
          explanation: `Có thể bạn chưa phát âm rõ âm đặc trưng trong từ "${correct}". Hãy chú ý khẩu hình và luồng hơi.`,
        });
      }
    });

    // Missing sound (r, l, th)
    if (word.length > spokenWord.length + 1) {
      issues.push({
        type: "pronunciation",
        text: spokenWord,
        correction: word,
        explanation: "Từ này có dấu hiệu bị nuốt âm hoặc thiếu phụ âm khi phát âm.",
      });
    }
  });

  return issues;
}
