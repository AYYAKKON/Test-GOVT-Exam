import {
  fbGetAvailableTests,
  fbGetTestForAttempt,
  fbGetAllTestsAdmin,
  fbGetTestByIdAdmin,
  fbCreateTest,
  fbUpdateTest,
  fbTogglePublishTest,
  fbDeleteTest,
  fbDeleteQuestion,
  fbDuplicateTest,
  fbUploadPdfFile,
  parseQuestionPaperText,
  fbSaveParsedTest
} from '../firebase/dbService';

export const getAvailableTests = async (params) => {
  return await fbGetAvailableTests(params);
};

export const getTestForAttempt = async (testId) => {
  return await fbGetTestForAttempt(testId);
};

// Admin Services
export const getAllTestsAdmin = async (params) => {
  return await fbGetAllTestsAdmin(params);
};

export const getTestByIdAdmin = async (testId) => {
  return await fbGetTestByIdAdmin(testId);
};

export const createTest = async (testData) => {
  return await fbCreateTest(testData);
};

export const updateTest = async (testId, testData) => {
  return await fbUpdateTest(testId, testData);
};

export const togglePublishTest = async (testId) => {
  return await fbTogglePublishTest(testId);
};

export const deleteTest = async (testId) => {
  return await fbDeleteTest(testId);
};

export const deleteQuestion = async (qId) => {
  return await fbDeleteQuestion(qId);
};

export const duplicateTest = async (testId) => {
  return await fbDuplicateTest(testId);
};

export const uploadPdf = async (formData) => {
  const file = formData.get('pdfFile');
  if (!file) throw new Error('No PDF file provided');
  return await fbUploadPdfFile(file);
};

export const processText = async (rawText) => {
  const parsed = parseQuestionPaperText(rawText);
  return {
    message: 'Parsed raw text successfully',
    parsedData: parsed
  };
};

export const saveParsedTest = async (payload) => {
  return await fbSaveParsedTest(payload);
};
