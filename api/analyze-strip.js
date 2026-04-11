// ==================== API/ANALYZE-STRIP.JS ====================
// Vercel Serverless Function for VERITAS‑SHELLFISH
// Endpoint: /api/analyze-strip
// Method: POST
//
// Accepts base64 image of LFA strip and returns test result analysis.
// Uses OpenRouter API with GPT-4o-mini (primary) and Claude 3.5 Sonnet (fallback).

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, toxinType, timestamp } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'Missing image data' });
    }

    // Your OpenRouter API key — stored in Vercel environment variables
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    
    if (!OPENROUTER_API_KEY) {
      console.error('OpenRouter API key not configured');
      return res.status(500).json({ error: 'API configuration error' });
    }

    // Try primary model first, fall back to secondary if needed
    const result = await analyzeWithModel(image, toxinType, OPENROUTER_API_KEY, 'openai/gpt-4o-mini')
      .catch(() => analyzeWithModel(image, toxinType, OPENROUTER_API_KEY, 'anthropic/claude-3-5-sonnet-20241022'));
    
    return res.status(200).json(result);
    
  } catch (error) {
    console.error('Strip analysis error:', error);
    return res.status(500).json({ 
      error: 'Analysis failed', 
      message: error.message 
    });
  }
}

/**
 * Call OpenRouter API with a specific model.
 */
async function analyzeWithModel(base64Image, toxinType, apiKey, model) {
  const prompt = buildAnalysisPrompt(toxinType);
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://aionsystem.github.io',
      'X-Title': 'VERITAS-SHELLFISH'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.1,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter error (${model}): ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // Parse the JSON response from the AI
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    // If AI didn't return valid JSON, extract manually
    parsed = extractFromText(content);
  }
  
  return {
    ...parsed,
    model_used: model,
    timestamp: new Date().toISOString()
  };
}

/**
 * Build the prompt for LFA strip analysis.
 */
function buildAnalysisPrompt(toxinType) {
  const toxinContext = toxinType ? `The user is testing for ${toxinType}. ` : '';
  
  return `You are an AI assistant specialized in analyzing lateral flow assay (LFA) test strips for harmful algal bloom (HAB) toxin detection in shellfish.

${toxinContext}Analyze the provided image of an LFA test strip. A typical strip has:
- A control line (C line) that must be visible for the test to be valid.
- A test line (T line) that indicates the presence and approximate concentration of toxin.

Return a JSON object with the following fields:
{
  "test_result": "negative" | "trace" | "positive" | "strong_positive",
  "test_line_intensity": 0.0 to 1.0,
  "control_line_intensity": 0.0 to 1.0,
  "confidence": 0.0 to 1.0,
  "description": "Brief description of what you observe"
}

Guidelines for test_result:
- "negative": Only control line visible. No test line.
- "trace": Control line visible. Test line is very faint/barely visible.
- "positive": Both lines visible. Test line is clearly visible but may be lighter than control.
- "strong_positive": Both lines visible. Test line is as dark or darker than control line.

Guidelines for intensity (0.0-1.0):
- 0.0 = line not visible at all
- 0.3 = faint but detectable
- 0.6 = clearly visible
- 1.0 = very dark/saturated

Guidelines for confidence:
- 0.9-1.0: Image is perfectly clear, lines are unambiguous
- 0.7-0.89: Image is good, minor ambiguity
- 0.5-0.69: Image has some issues (lighting, focus) but still readable
- Below 0.5: Image quality is poor, result is uncertain

If the control line is not visible at all, the test is INVALID. In this case, set test_result to "invalid", all intensities to 0.0, and confidence to 0.0. Include "Control line not visible - invalid test" in the description.

Return ONLY valid JSON. No other text.`;
}

/**
 * Fallback extraction if AI doesn't return proper JSON.
 */
function extractFromText(text) {
  const lower = text.toLowerCase();
  
  let testResult = 'trace';
  if (lower.includes('strong positive') || lower.includes('strong_positive')) {
    testResult = 'strong_positive';
  } else if (lower.includes('positive') && !lower.includes('strong')) {
    testResult = 'positive';
  } else if (lower.includes('negative')) {
    testResult = 'negative';
  } else if (lower.includes('invalid') || lower.includes('no control')) {
    testResult = 'invalid';
  }
  
  // Extract intensity mentions
  let testIntensity = 0.5;
  let controlIntensity = 0.7;
  let confidence = 0.7;
  
  const testMatch = text.match(/test[_\s]?line[_\s]?intensity[:\s]*([0-9.]+)/i);
  if (testMatch) testIntensity = parseFloat(testMatch[1]);
  
  const controlMatch = text.match(/control[_\s]?line[_\s]?intensity[:\s]*([0-9.]+)/i);
  if (controlMatch) controlIntensity = parseFloat(controlMatch[1]);
  
  const confMatch = text.match(/confidence[:\s]*([0-9.]+)/i);
  if (confMatch) confidence = parseFloat(confMatch[1]);
  
  return {
    test_result: testResult,
    test_line_intensity: Math.min(1, Math.max(0, testIntensity)),
    control_line_intensity: Math.min(1, Math.max(0, controlIntensity)),
    confidence: Math.min(1, Math.max(0, confidence)),
    description: 'Extracted from AI response (fallback parser)',
    parsing_fallback: true
  };
}
