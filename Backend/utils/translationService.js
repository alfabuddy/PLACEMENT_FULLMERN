// Create this file at: utils/translationService.js
// import fetch from 'node-fetch';

const HF_TOKEN = process.env.HF_TOKEN;

// Map of language codes to Hugging Face translation models
const TRANSLATION_MODELS = {
  'hi-en': 'Helsinki-NLP/opus-mt-hi-en',
  'bn-en': 'Helsinki-NLP/opus-mt-bn-en',
  'or-en': 'Helsinki-NLP/opus-mt-or-en',
  'es-en': 'Helsinki-NLP/opus-mt-es-en',
  
  'en-hi': 'Helsinki-NLP/opus-mt-en-hi',
  'en-bn': 'Helsinki-NLP/opus-mt-en-bn',
  'en-or': 'Helsinki-NLP/opus-mt-en-or',
  'en-es': 'Helsinki-NLP/opus-mt-en-es',
};

// Model for language identification
const LANG_DETECT_MODEL = 'papluca/xlm-roberta-base-language-detection';

/**
 * Helper function to query the Hugging Face API
 */
async function queryAPI(model, payload) {
  const response = await fetch(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      headers: { 
        Authorization: `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json' 
      },
      method: 'POST',
      body: JSON.stringify({ inputs: payload, wait_for_model: true }),
    }
  );

  const result = await response.json();
  if (response.status !== 200) {
    console.error("HF API Error:", result);
    throw new Error(`API Error: ${result.error || 'Failed to query model'}`);
  }
  return result;
}

/**
 * Detects the language of a given text.
 * Returns a language code (e.g., 'en', 'hi')
 */
export const detectLanguage = async (text) => {
  try {
    const result = await queryAPI(LANG_DETECT_MODEL, text);
    // The model returns a list of labels and scores
    if (result && result.length > 0) {
      const highestScoreLabel = result[0][0].label;
      // Filter for only our supported languages
      const supportedLangs = ['en', 'hi', 'bn', 'or', 'es'];
      if (supportedLangs.includes(highestScoreLabel)) {
        return highestScoreLabel;
      }
    }
    // Default to English if detection fails or is not supported
    return 'en';
  } catch (error) {
    console.error('Error in language detection:', error);
    return 'en'; // Default to English on error
  }
};

/**
 * Translates text from a source language to a target language.
 * Uses English as a bridge if a direct model isn't available.
 */
export const translate = async (text, sourceLang, targetLang) => {
  // 1. No translation needed
  if (sourceLang === targetLang) {
    return { englishContent: (sourceLang === 'en' ? text : null), translatedContent: text };
  }

  let englishContent = text;

  // 2. Translate source to English (if not already English)
  if (sourceLang !== 'en') {
    const model = TRANSLATION_MODELS[`${sourceLang}-en`];
    if (!model) {
      console.warn(`No model found for ${sourceLang}-en. Returning original text.`);
      return { englishContent: null, translatedContent: text };
    }
    const result = await queryAPI(model, text);
    englishContent = result[0].translation_text;
  }

  // 3. Translate from English to target (if target is not English)
  if (targetLang === 'en') {
    return { englishContent: englishContent, translatedContent: englishContent };
  }

  const model = TRANSLATION_MODELS[`en-${targetLang}`];
  if (!model) {
    console.warn(`No model found for en-${targetLang}. Returning English text.`);
    return { englishContent: englishContent, translatedContent: englishContent };
  }

  const result = await queryAPI(model, englishContent);
  const translatedContent = result[0].translation_text;

  return { englishContent, translatedContent };
};