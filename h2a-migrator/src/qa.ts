import fs from "fs";

type PhraseDetectionResult = Record<string, number>;

type WordCountDiff = {
  word: string;
  expected: number;
  actual: number;
  diff: number;
};

type WordCountComparisonReport = {
  passed: boolean;
  missingWords: WordCountDiff[];
  extraWords: WordCountDiff[];
};

type PhraseCountDiffResult = {
  match: boolean;
  missing: Record<string, number>;
  unexpected: Record<string, number>;
  countMismatches: {
    phrase: string;
    expected: number;
    actual: number;
  }[];
};

function comparePhrases(
  expected: PhraseDetectionResult,
  actual: PhraseDetectionResult
): PhraseCountDiffResult {
  const result: PhraseCountDiffResult = {
    match: true,
    missing: {},
    unexpected: {},
    countMismatches: [],
  };
  const allPhrases = new Set([
    ...Object.keys(expected),
    ...Object.keys(actual),
  ]);

  for (const phrase of allPhrases) {
    const expectedCount = expected[phrase] || 0;
    const actualCount = actual[phrase] || 0;

    if (expectedCount > 0 && actualCount === 0) {
      result.match = false;
      result.missing[phrase] = expectedCount;
    } else if (expectedCount === 0 && actualCount > 0) {
      result.match = false;
      result.unexpected[phrase] = actualCount;
    } else if (expectedCount !== actualCount) {
      result.match = false;
      result.countMismatches.push({
        phrase,
        expected: expectedCount,
        actual: actualCount,
      });
    }
  }

  return result;
}

export function qaMigratedFile(p: {
  mdFilePath: string;
  mdocFilePath: string;
}) {
  const mdText = fs.readFileSync(p.mdFilePath, "utf-8");
  const mdocText = fs.readFileSync(p.mdocFilePath, "utf-8");

  const mdPhrases = detectPhrases(mdText);
  const mdocPhrases = detectPhrases(mdocText);
  const phraseDiff = comparePhrases(mdPhrases, mdocPhrases);

  return phraseDiff;
}

export function countWords(text: string): Record<string, number> {
  const wordRegex = /\b[a-zA-Z]+\b/g;
  const matches = text.match(wordRegex);
  const wordCounts: Record<string, number> = {};

  if (!matches) {
    return wordCounts;
  }

  for (const word of matches) {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  }

  return wordCounts;
}

export function compareWordCountsWithExtras(
  expected: Record<string, number>,
  actual: Record<string, number>
): WordCountComparisonReport {
  const missingWords: WordCountDiff[] = [];
  const extraWords: WordCountDiff[] = [];

  const allWords = new Set([...Object.keys(expected), ...Object.keys(actual)]);

  for (const word of allWords) {
    const expectedCount = expected[word] || 0;
    const actualCount = actual[word] || 0;

    if (actualCount < expectedCount) {
      missingWords.push({
        word,
        expected: expectedCount,
        actual: actualCount,
        diff: expectedCount - actualCount,
      });
    } else if (actualCount > expectedCount) {
      extraWords.push({
        word,
        expected: expectedCount,
        actual: actualCount,
        diff: actualCount - expectedCount,
      });
    }
  }

  return {
    passed: missingWords.length === 0 && extraWords.length === 0,
    missingWords,
    extraWords,
  };
}

export function detectPhrases(text: string): PhraseDetectionResult {
  const wordCountData = countWords(text);
  const validWords = Object.keys(wordCountData);

  const dictionary = new Set(validWords);
  const phraseDetectionResult: PhraseDetectionResult = {};

  // Tokenize the input into words (strip punctuation)
  const tokens = text.match(/\b[a-zA-Z]+\b/g); // only letters

  if (!tokens) return phraseDetectionResult;

  // Slide through all possible phrases
  let lastPhraseMatchCount: number | null = null;
  for (let i = 0; i < tokens.length; i++) {
    let phrase = "";
    for (let j = i; j < tokens.length; j++) {
      const word = tokens[j];
      if (!dictionary.has(word)) break; // stop if word is not in validWords

      const lastPhrase = phrase;
      phrase = phrase ? `${phrase} ${word}` : word;
      const phraseMatchCount = text.split(phrase).length - 1;

      if (phraseMatchCount === 0) {
        lastPhraseMatchCount = 0;
        continue;
      }

      if (lastPhraseMatchCount === phraseMatchCount) {
        delete phraseDetectionResult[lastPhrase];
      }

      phraseDetectionResult[phrase] = phraseMatchCount;
      lastPhraseMatchCount = phraseMatchCount;
    }
  }

  // Sort the phrases by length in ascending order
  const sortedPhrases = Object.keys(phraseDetectionResult).sort(
    (a, b) => a.length - b.length
  );

  sortedPhrases.forEach((phrase) => {
    // Remove phrases that are substrings of longer phrases,
    // if the match count for both is the same
    const isSubstring = sortedPhrases.some(
      (otherPhrase) =>
        otherPhrase !== phrase &&
        otherPhrase.includes(phrase) &&
        phraseDetectionResult[otherPhrase] === phraseDetectionResult[phrase]
    );
    if (isSubstring) {
      delete phraseDetectionResult[phrase];
    }
  });

  return phraseDetectionResult;
}
