const pdfParse = require('pdf-parse');
const fs = require('fs');

/**
 * Parses raw text extracted from a test question PDF.
 * Converts structured question text into sections, questions, options, correct answers, and durations.
 */
function parseRawTextToTest(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  let testTitle = 'Imported Mock Test';
  let category = 'SSC';
  let sections = [];
  let currentSection = {
    name: 'General Section',
    duration: 30, // default 30 mins
    questions: []
  };

  // Temporary parser variables
  let currentQuestion = null;
  let currentOptionKey = null;

  // Header detection
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i];
    if (/^TEST\s*NAME\s*:\s*/i.test(line)) {
      testTitle = line.replace(/^TEST\s*NAME\s*:\s*/i, '').trim();
    } else if (/^EXAM\s*:\s*|^TEST\s*:\s*/i.test(line)) {
      testTitle = line.replace(/^EXAM\s*:\s*|^TEST\s*:\s*/i, '').trim();
    } else if (/^CATEGORY\s*:\s*/i.test(line)) {
      category = line.replace(/^CATEGORY\s*:\s*/i, '').trim();
    }
  }

  const flushQuestion = () => {
    if (currentQuestion && currentQuestion.questionText) {
      // Ensure we have options A, B, C, D if present
      if (!currentQuestion.correctAnswer) {
        currentQuestion.correctAnswer = 'A';
      }
      currentSection.questions.push({ ...currentQuestion });
      currentQuestion = null;
    }
  };

  const flushSection = () => {
    flushQuestion();
    if (currentSection.questions.length > 0) {
      sections.push({ ...currentSection });
    }
    currentSection = {
      name: 'General Section',
      duration: 30,
      questions: []
    };
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check Section Header: e.g. "SECTION 1: ENGLISH" or "SECTION: REASONING"
    const sectionMatch = line.match(/^SECTION(?:\s+\d+)?\s*:\s*(.+)$/i);
    if (sectionMatch) {
      flushQuestion();
      if (currentSection.questions.length > 0) {
        sections.push({ ...currentSection });
      }
      currentSection = {
        name: sectionMatch[1].trim(),
        duration: 15, // default section duration
        questions: []
      };
      continue;
    }

    // Check Time Header: e.g. "TIME: 15 MINUTES" or "DURATION: 20 MINS"
    const timeMatch = line.match(/^(?:TIME|DURATION)\s*:\s*(\d+)\s*(?:MINUTES|MINS|MIN)?/i);
    if (timeMatch) {
      const minutes = parseInt(timeMatch[1], 10);
      if (!isNaN(minutes) && minutes > 0) {
        currentSection.duration = minutes;
      }
      continue;
    }

    // Check Question Start: e.g., "Q1.", "Q1:", "1.", "Question 1:"
    const qMatch = line.match(/^(?:Q|QUESTION)?\s*(\d+)[\.\:]\s*(.+)$/i);
    if (qMatch && !line.match(/^(?:ANSWER|ANS)\s*:/i)) {
      flushQuestion();
      const qNum = parseInt(qMatch[1], 10);
      const qText = qMatch[2].trim();
      currentQuestion = {
        questionNumber: qNum,
        questionText: qText,
        options: [],
        correctAnswer: 'A',
        explanation: ''
      };
      continue;
    }

    // Check Option Line: e.g. "A. Slow", "B) Fast", "(C) Weak"
    const optMatch = line.match(/^(?:\(?([A-D])\)?[\.\)]\s*)(.+)$/i);
    if (optMatch && currentQuestion) {
      const key = optMatch[1].toUpperCase();
      const optText = optMatch[2].trim();

      // Check if option already exists
      const existingIdx = currentQuestion.options.findIndex(o => o.key === key);
      if (existingIdx >= 0) {
        currentQuestion.options[existingIdx].text = optText;
      } else {
        currentQuestion.options.push({ key, text: optText });
      }
      continue;
    }

    // Check Answer Line: e.g. "ANSWER: B" or "ANS: C" or "Correct Answer: B"
    const ansMatch = line.match(/^(?:ANSWER|ANS|CORRECT\s*ANSWER)\s*:\s*([A-D])/i);
    if (ansMatch && currentQuestion) {
      currentQuestion.correctAnswer = ansMatch[1].toUpperCase();
      continue;
    }

    // Check Explanation Line: e.g. "EXPLANATION: Fast is the correct answer"
    const expMatch = line.match(/^(?:EXPLANATION|EXPLAIN)\s*:\s*(.+)$/i);
    if (expMatch && currentQuestion) {
      currentQuestion.explanation = expMatch[1].trim();
      continue;
    }

    // If currentQuestion exists and line isn't metadata, append to questionText if no options yet, or to last option if options exist
    if (currentQuestion) {
      if (currentQuestion.options.length === 0) {
        currentQuestion.questionText += ' ' + line;
      } else {
        // Append to last option text
        const lastOpt = currentQuestion.options[currentQuestion.options.length - 1];
        if (lastOpt) {
          lastOpt.text += ' ' + line;
        }
      }
    }
  }

  // Flush remaining question and section
  flushQuestion();
  if (currentSection.questions.length > 0) {
    sections.push({ ...currentSection });
  }

  // Fallback if no sections were parsed cleanly
  if (sections.length === 0) {
    sections.push({
      name: 'General Section',
      duration: 30,
      questions: []
    });
  }

  // Calculate total questions & total duration
  let totalQuestions = 0;
  let totalDuration = 0;
  sections.forEach(sec => {
    totalQuestions += sec.questions.length;
    totalDuration += sec.duration;
  });

  return {
    testTitle,
    category,
    totalQuestions,
    totalDuration,
    sections,
    rawText: text
  };
}

/**
 * Reads a PDF file path and parses questions
 */
async function parsePdfFile(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdfParse(dataBuffer);
  return parseRawTextToTest(pdfData.text);
}

module.exports = {
  parseRawTextToTest,
  parsePdfFile
};
