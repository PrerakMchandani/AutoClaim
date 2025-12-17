
import { GoogleGenAI, Type } from "@google/genai";
import { ReimbursementType, ClaimResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const validateClaim = async (
  files: { base64: string; mimeType: string }[],
  type: ReimbursementType,
  months: string[],
  expectedUserName: string
): Promise<Omit<ClaimResult, 'id' | 'submittedAt' | 'userId'>> => {
  const model = "gemini-3-flash-preview";
  const monthCount = months.length;
  const maxEligible = monthCount * 1200;

  const prompt = `
    Analyze ${files.length} document(s) for a ${type} reimbursement.
    EXPECTED EMPLOYEE: "${expectedUserName}"
    SELECTED PERIOD: ${months.join(", ")}
    
    CRITICAL IDENTITY CHECK:
    - You MUST find the customer name on the bill.
    - If the name on the bill does NOT match "${expectedUserName}" (allow minor variations like initials or middle names, but it must be clearly the same person), set status to 'Needs Review'.
    - If the name is completely different (e.g., Prerak vs Prasad), status MUST be 'Needs Review' and specifically mention the identity discrepancy in reasoning.
    
    FINANCIAL PROTOCOL:
    - Monthly Cap: $1,200.00
    - Total Ceiling for ${monthCount} month(s): $${maxEligible.toFixed(2)}
    - Eligible = Minimum(Total Bill Sum, Ceiling)
    
    Output JSON:
    - details: { provider, billingDate, totalAmount, customerName }
    - eligibleAmount: (calculated number)
    - status: 'Auto-Approved' (if clear match & data) or 'Needs Review'
    - reasoning: (concise, professional explanation of findings and math)
  `;

  const imageParts = files.map(f => ({
    inlineData: {
      data: f.base64,
      mimeType: f.mimeType,
    },
  }));

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        ...imageParts,
        { text: prompt },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          details: {
            type: Type.OBJECT,
            properties: {
              provider: { type: Type.STRING },
              billingDate: { type: Type.STRING },
              totalAmount: { type: Type.NUMBER },
              customerName: { type: Type.STRING },
            },
            required: ["provider", "billingDate", "totalAmount", "customerName"],
          },
          eligibleAmount: { type: Type.NUMBER },
          status: { type: Type.STRING, enum: ["Auto-Approved", "Needs Review"] },
          reasoning: { type: Type.STRING },
        },
        required: ["details", "eligibleAmount", "status", "reasoning"],
      },
    },
  });

  const text = response.text || "";
  try {
    const parsed = JSON.parse(text);
    return {
      ...parsed,
      months,
      type
    };
  } catch (error) {
    console.error("Failed to parse AI response", text);
    throw new Error("Neural extraction failed. Document clarity insufficient.");
  }
};
