import { GoogleGenAI } from "@google/genai";
import { Service } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getStyleAdvice = async (
  userQuery: string,
  availableServices: Service[]
): Promise<string> => {
  if (!apiKey) {
    return "API Key não configurada. O Consultor IA está indisponível no momento.";
  }

  try {
    const serviceList = availableServices.map(s => `${s.name} (${s.durationMinutes} min)`).join(', ');
    
    const prompt = `
      Você é um consultor de estilo de uma barbearia premium. 
      O cliente perguntou: "${userQuery}".
      
      Nossos serviços disponíveis são: ${serviceList}.
      
      Responda de forma curta, elegante e sugira qual dos nossos serviços melhor se adapta ao pedido.
      Não use markdown complexo, apenas texto corrido e quebras de linha.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Desculpe, não consegui processar seu pedido.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ocorreu um erro ao consultar a IA.";
  }
};
