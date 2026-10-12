const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function createSamplePdf(outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.fontSize(20).text('TEST NAME: SSC CGL MOCK TEST 01', { align: 'center' });
    doc.fontSize(12).text('CATEGORY: SSC', { align: 'center' });
    doc.moveDown(1.5);

    // Section 1: ENGLISH
    doc.fontSize(16).text('SECTION 1: ENGLISH');
    doc.fontSize(12).text('TIME: 15 MINUTES');
    doc.moveDown(0.5);

    const englishQuestions = [
      {
        q: 'Q1. Choose the correct synonym of "Rapid".',
        opts: ['A. Slow', 'B. Fast', 'C. Weak', 'D. Small'],
        ans: 'ANSWER: B',
        exp: 'EXPLANATION: Rapid means happening or done in a short time, which is synonymous with fast.'
      },
      {
        q: 'Q2. Select the correctly spelt word.',
        opts: ['A. Accomodate', 'B. Accommodate', 'C. Acomodate', 'D. Accommoodate'],
        ans: 'ANSWER: B',
        exp: 'EXPLANATION: Accommodate is spelled with double "c" and double "m".'
      },
      {
        q: 'Q3. Choose the antonym of "Transient".',
        opts: ['A. Temporary', 'B. Permanent', 'C. Fleeting', 'D. Brief'],
        ans: 'ANSWER: B',
        exp: 'EXPLANATION: Transient means lasting only for a short time, so permanent is its opposite.'
      }
    ];

    englishQuestions.forEach((item) => {
      doc.fontSize(12).text(item.q);
      item.opts.forEach(opt => doc.fontSize(11).text(`  ${opt}`));
      doc.fontSize(11).text(item.ans);
      doc.fontSize(10).text(item.exp);
      doc.moveDown(0.8);
    });

    // Section 2: REASONING
    doc.fontSize(16).text('SECTION 2: REASONING');
    doc.fontSize(12).text('TIME: 15 MINUTES');
    doc.moveDown(0.5);

    const reasoningQuestions = [
      {
        q: 'Q1. Find the missing number in series: 2, 4, 8, 16, ?',
        opts: ['A. 24', 'B. 30', 'C. 32', 'D. 64'],
        ans: 'ANSWER: C',
        exp: 'EXPLANATION: Each number is multiplied by 2. 16 * 2 = 32.'
      },
      {
        q: 'Q2. If CAT is coded as 3120, how is DOG coded?',
        opts: ['A. 4157', 'B. 4147', 'C. 4158', 'D. 3157'],
        ans: 'ANSWER: A',
        exp: 'EXPLANATION: D=4, O=15, G=7. Combined position numbers give 4157.'
      },
      {
        q: 'Q3. Select the related word: Doctor : Hospital :: Teacher : ?',
        opts: ['A. Office', 'B. School', 'C. Court', 'D. Library'],
        ans: 'ANSWER: B',
        exp: 'EXPLANATION: A doctor works in a hospital, similarly a teacher works in a school.'
      }
    ];

    reasoningQuestions.forEach((item) => {
      doc.fontSize(12).text(item.q);
      item.opts.forEach(opt => doc.fontSize(11).text(`  ${opt}`));
      doc.fontSize(11).text(item.ans);
      doc.fontSize(10).text(item.exp);
      doc.moveDown(0.8);
    });

    // Section 3: MATHEMATICS
    doc.fontSize(16).text('SECTION 3: MATHEMATICS');
    doc.fontSize(12).text('TIME: 20 MINUTES');
    doc.moveDown(0.5);

    const mathsQuestions = [
      {
        q: 'Q1. What is 25% of 200?',
        opts: ['A. 25', 'B. 40', 'C. 50', 'D. 75'],
        ans: 'ANSWER: C',
        exp: 'EXPLANATION: (25/100) * 200 = 50.'
      },
      {
        q: 'Q2. If the ratio of two numbers is 3:4 and their sum is 70, find the larger number.',
        opts: ['A. 30', 'B. 40', 'C. 50', 'D. 60'],
        ans: 'ANSWER: B',
        exp: 'EXPLANATION: Total parts = 3 + 4 = 7. Each part = 70/7 = 10. Larger number = 4 * 10 = 40.'
      },
      {
        q: 'Q3. What is the average of first 5 natural numbers (1, 2, 3, 4, 5)?',
        opts: ['A. 2.5', 'B. 3', 'C. 3.5', 'D. 4'],
        ans: 'ANSWER: B',
        exp: 'EXPLANATION: Sum = 1+2+3+4+5 = 15. Average = 15 / 5 = 3.'
      }
    ];

    mathsQuestions.forEach((item) => {
      doc.fontSize(12).text(item.q);
      item.opts.forEach(opt => doc.fontSize(11).text(`  ${opt}`));
      doc.fontSize(11).text(item.ans);
      doc.fontSize(10).text(item.exp);
      doc.moveDown(0.8);
    });

    // Section 4: GENERAL AWARENESS
    doc.fontSize(16).text('SECTION 4: GENERAL AWARENESS');
    doc.fontSize(12).text('TIME: 10 MINUTES');
    doc.moveDown(0.5);

    const gkQuestions = [
      {
        q: 'Q1. Who is known as the Father of the Indian Constitution?',
        opts: ['A. Mahatma Gandhi', 'B. Dr. B.R. Ambedkar', 'C. Jawaharlal Nehru', 'D. Sardar Patel'],
        ans: 'ANSWER: B',
        exp: 'EXPLANATION: Dr. B.R. Ambedkar served as the Chairman of the Drafting Committee.'
      },
      {
        q: 'Q2. Which river is known as the "Sorrow of Bengal"?',
        opts: ['A. Ganga', 'B. Yamuna', 'C. Damodar River', 'D. Kosi River'],
        ans: 'ANSWER: C',
        exp: 'EXPLANATION: Damodar River was known as the Sorrow of Bengal due to its ravaging floods.'
      },
      {
        q: 'Q3. What is the capital of India?',
        opts: ['A. Mumbai', 'B. Kolkata', 'C. New Delhi', 'D. Chennai'],
        ans: 'ANSWER: C',
        exp: 'EXPLANATION: New Delhi is the official capital of India.'
      }
    ];

    gkQuestions.forEach((item) => {
      doc.fontSize(12).text(item.q);
      item.opts.forEach(opt => doc.fontSize(11).text(`  ${opt}`));
      doc.fontSize(11).text(item.ans);
      doc.fontSize(10).text(item.exp);
      doc.moveDown(0.8);
    });

    doc.end();

    stream.on('finish', () => {
      console.log(`Sample test PDF created successfully at ${outputPath}`);
      resolve(outputPath);
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
}

if (require.main === module) {
  const targetDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const samplePdfPath = path.join(targetDir, 'sample_ssc_cgl_test.pdf');
  createSamplePdf(samplePdfPath).catch(console.error);
}

module.exports = { createSamplePdf };
