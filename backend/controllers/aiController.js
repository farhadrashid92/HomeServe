import { GoogleGenerativeAI } from '@google/generative-ai';
import Service from '../models/Service.js';

export const bookingExtract = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ message: "Contextual prompt is required" });

  try {
    const services = await Service.find().select('title category');
    const categoriesList = [...new Set(services.map(s => s.category))].join(', ');

    const systemInstruction = `You are a strict JSON extraction engine for a home service booking platform. 
The user will provide a natural language request to book a service.
Extract the following information from the user's prompt:
1. "category": Match the requested service to one of the following available categories: [${categoriesList}]. If it doesn't match perfectly, pick the closest one.
2. "date": The requested date in YYYY-MM-DD format based on today's date context (Today is ${new Date().toISOString().split('T')[0]}). Leave empty string if unfound.
3. "time": The requested time. You MUST round it strongly to exactly one of the following strings: "09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM", "06:00 PM". If the user says 2PM, output exactly "02:00 PM". Leave empty string if entirely unfound.
4. "city": The requested city. E.g "Lahore", "Multan", "Karachi". Capitalize appropriately. Leave empty string if unfound.
5. "street": The specific street or house address mentioned (e.g., "House number 22/27, MDA Chowk"). Leave empty string if unfound. Do NOT mix this with the notes field.
6. "notes": Any extra details or constraints (e.g., "3 rooms", "bring own supplies").

You MUST return ONLY a raw JSON object string with these EXACT 6 keys. No markdown backticks, no conversational text.`;

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'MOCK_KEY') {
       console.warn('⚠️  GEMINI_API_KEY is not set. Add it to your Render environment variables.');
       return res.status(503).json({ 
         message: "AI service is not configured. Please add GEMINI_API_KEY to your Render environment variables." 
       });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
       model: "gemini-2.0-flash",
       generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent([
      { text: systemInstruction },
      { text: prompt }
    ]);
    
    const responseText = result.response.text();
    // In case the SDK doesn't strip backticks, do it safely
    const cleanedJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanedJson);

    return res.json(parsedData);
  } catch (error) {
    console.error('AI Extraction Error:', error.message);
    
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key')) {
      return res.status(401).json({ message: "Invalid Gemini API key. Please check your GEMINI_API_KEY on Render." });
    }
    if (error.message?.includes('not found') || error.message?.includes('is not found')) {
      return res.status(500).json({ message: "Gemini model not available. The model name may need updating." });
    }
    if (error.message?.includes('quota') || error.message?.includes('429') || error.message?.includes('exhausted')) {
      return res.status(429).json({ message: "AI Quota Exceeded. Please check your Google AI Studio billing/quota settings." });
    }
    if (error.message?.includes('403') || error.message?.includes('Forbidden') || error.message?.includes('denied access')) {
      return res.status(403).json({ message: "Access Denied by Google: Your free tier key is not authorized for this specific model version." });
    }
    
    return res.status(500).json({ message: "Failed to process AI booking logic.", error: error.message });
  }
};
