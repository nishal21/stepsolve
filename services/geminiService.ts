import { GoogleGenAI, Type } from "@google/genai";
import type { CalculationResponse, ImageData } from '../types';

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        finalAnswer: {
            type: Type.STRING,
            description: "The final, simplified result of the equation. This MUST be a single, valid LaTeX expression that can be rendered correctly inside one pair of '$' delimiters. For multiple solutions (e.g., roots of a polynomial), YOU MUST use LaTeX set notation, for example: 'x \\in \\{1, 2, 3\\}' or 'x \\in \\{\\frac{2}{3}, 1\\}'. For a single solution, use a format like 'x = 2'. For a simplified expression that is not an equation, return just the expression, such as '2x \\cdot \\cos(x^2)'. Do NOT return multiple equations separated by commas (e.g., 'x = 1, x = 2'). If there is an error processing the input, this MUST be an empty string."
        },
        steps: {
            type: Type.ARRAY,
            description: "An array of objects, where each object represents a step in solving the equation. If there is an error, this MUST be an empty array.",
            items: {
                type: Type.OBJECT,
                properties: {
                    expression: {
                        type: Type.STRING,
                        description: "The mathematical expression at this step, formatted using valid LaTeX."
                    },
                    explanation: {
                        type: Type.STRING,
                        description: "A clear, plain-language explanation of what was done in this step and why. Any mathematical expressions, variables, or symbols within this explanation MUST be enclosed in single dollar signs ($) for proper LaTeX rendering. For example: 'This is a p-series of the form $\\sum_{n=1}^{\\infty} \\frac{1}{n^p}$ where $p=2$.'"
                    },
                    rule: {
                        type: Type.STRING,
                        description: "The name of the mathematical rule or property applied in this step (e.g., 'Chain Rule', 'Integration by Parts')."
                    }
                },
                required: ["expression", "explanation", "rule"]
            }
        },
        symbols: {
            type: Type.ARRAY,
            description: "An array of objects defining any non-alphanumeric symbols used in the original equation. If there is an error, this MUST be an empty array.",
            items: {
                type: Type.OBJECT,
                properties: {
                    symbol: {
                        type: Type.STRING,
                        description: "The symbol itself, as a single character (e.g., '∫') or a complete, renderable LaTeX command. For commands or operators requiring arguments, you MUST provide generic placeholders. For example, use 'a^b' for exponentiation, not just '^'. Use '\\frac{a}{b}' for fractions, not '\\frac'. Use '\\sqrt{x}' for square roots, not '\\sqrt'. Valid examples: '∫', '\\sum', '\\pi', '\\frac{a}{b}', '\\lim_{x \\to a}', 'a^b'. It must be a valid LaTeX expression without delimiters."
                    },
                    name: {
                        type: Type.STRING,
                        description: "The common name of the symbol (e.g., 'Integral', 'Equals', 'Partial Derivative')."
                    },
                    meaning: {
                        type: Type.STRING,
                        description: "A brief, one-sentence explanation of the symbol's meaning or function."
                    }
                },
                required: ["symbol", "name", "meaning"]
            }
        },
        detectedEquation: {
            type: Type.STRING,
            description: "If the input was an image, this field contains the mathematical equation that was detected and transcribed from it, in valid LaTeX. This should be populated even if there is an error. If input is text, this can be omitted."
        },
        error: {
            type: Type.STRING,
            description: "If the problem could not be solved (e.g., unreadable image, invalid math), this field MUST contain a user-friendly error message. If the calculation is successful, this field should be omitted or be an empty string."
        }
    },
    required: ["finalAnswer", "steps", "symbols"]
};

export const explainCalculation = async (equation: string, apiKey: string, image?: ImageData): Promise<CalculationResponse> => {
    if (!apiKey) {
        throw new Error("API Key is missing.");
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
        You are an expert-level mathematical solver AI, equivalent to a seasoned university professor with specializations across calculus, linear algebra, differential equations, and more. Your purpose is to provide flawless, comprehensive, and pedagogically sound solutions to mathematical problems.

        **Input Source:**
        - If an image is provided, it is the primary source of the problem.
        - The text input ("${equation}") should be used as the primary source if no image is present, or as supplementary context if an image is provided.

        **CRITICAL Directives:**

        1.  **Image OCR and Error Handling (For Image Inputs):**
            -   Your first priority is to perform Optical Character Recognition (OCR) on the image. Transcribe the mathematical problem into a valid LaTeX string and place it in the \`detectedEquation\` field.
            -   **If the image is unreadable** (e.g., too blurry, poor handwriting, bad lighting) or contains no discernible mathematical equation, you MUST populate the \`error\` field with a specific, user-friendly message. Examples: "The image is too blurry to read clearly.", "No mathematical equation was found in the image. Please ensure the problem is in focus.", "The handwriting is difficult to read. Please write more clearly."
            -   If an OCR error occurs, you MUST set \`finalAnswer\` to an empty string, and \`steps\` and \`symbols\` to empty arrays (\`[]\`). Do not attempt to solve the problem.

        2.  **Problem Solving (If Input is Valid):**
            -   **Unwavering Accuracy:** Your calculations must be perfect. Verify each transformation and simplification.
            -   **Show Your Work:** Even if the problem seems simple or can be solved in one step, you MUST provide at least one step detailing the process or rule applied. A final answer with no steps is an invalid response.
            -   **Structured Explanation:** For each step, provide the resulting mathematical 'expression' in LaTeX, a clear 'explanation' in plain language, and explicitly name the 'rule' applied (e.g., "Product Rule," "Fundamental Theorem of Calculus").
            -   **Implicit Assumptions:** If needed, state any assumptions (e.g., "assuming x is a real number") in the first relevant step's explanation.
            -   **Final Answer:** The 'finalAnswer' must be the most simplified and complete form of the solution, in valid LaTeX.

        3.  **Strict JSON Adherence:**
            -   Your entire output MUST conform strictly to the provided JSON schema. Do not include any commentary, greetings, or text outside of the JSON structure.
            -   If the calculation is successful, the 'error' field should be omitted or be an empty string.
    `;
    
    const textPart = { text: prompt };
    const contents = image ? { parts: [{ inlineData: { mimeType: image.mimeType, data: image.data }}, textPart] } : prompt;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.2, // Lower temperature for more deterministic, accurate results
            },
        });
        
        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);
        
        return parsedResponse as CalculationResponse;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error && error.message.includes('API key not valid')) {
             throw new Error("The provided API Key is invalid. Please check it in the settings.");
        }
        throw new Error("Failed to get explanation from the AI. This could be due to a network issue or an invalid API Key.");
    }
};