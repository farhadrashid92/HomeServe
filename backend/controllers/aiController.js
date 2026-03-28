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

    // Attempt to leverage user's provided key or default to a safe blank preventing internal server crashes
    const apiKey = process.env.GEMINI_API_KEY || 'MOCK_KEY';
    
    if (apiKey === 'MOCK_KEY') {
       // Graceful degraded state for demonstration if admin hasn't configured Keys yet
       return res.json({
         category: "Cleaning",
         date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
         time: "02:00 PM",
         notes: "Auto-extracted: " + prompt
       });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
      { text: systemInstruction },
      { text: prompt }
    ]);
    
    const responseText = result.response.text();
    const cleanedJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanedJson);

    return res.json(parsedData);
  } catch (error) {
    console.error('AI Extraction Error:', error.message);
    return res.status(500).json({ message: "Failed to process AI booking logic." });
  }
};
