import { GoogleGenAI, Type } from "@google/genai";
import { StockHolding, StockPriceUpdate } from "../types";

const getEnv = (key: string) => {
  try {
    return typeof process !== 'undefined' && process.env ? process.env[key] : undefined;
  } catch {
    return undefined;
  }
};

const getAiClient = () => {
  const apiKey = getEnv('API_KEY');
  if (!apiKey) {
    console.warn("Gemini API Key is missing.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const fetchStockPrices = async (stocks: StockHolding[]): Promise<StockPriceUpdate[]> => {
  const ai = getAiClient();
  if (!ai) return [];

  const symbols = stocks.map(s => s.symbol).join(', ');
  
  // Using Gemini to "fetch" (simulate/retrieve based on training data) current prices
  // In a real production app, this would call a stock market API.
  // Here we use Gemini 2.5 Flash for speed.
  const prompt = `Provide the approximate current market price for the following stock symbols: ${symbols}. 
  Return the data as a JSON array of objects with 'symbol' and 'price' (number) properties. 
  If you don't have exact real-time data, provide a realistic estimate based on the most recent trading data you have knowledge of.
  Output ONLY the JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              symbol: { type: Type.STRING },
              price: { type: Type.NUMBER }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as StockPriceUpdate[];
  } catch (error) {
    console.error("Failed to fetch stock prices via Gemini:", error);
    return [];
  }
};

export const getFinancialAdvice = async (summary: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "無法連接到 AI 服務。";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Based on this financial summary, give a short, encouraging paragraph of financial advice (in Traditional Chinese): ${summary}`,
    });
    return response.text || "目前無法提供建議。";
  } catch (error) {
    console.error("Error getting advice:", error);
    return "分析服務暫時不可用。";
  }
};