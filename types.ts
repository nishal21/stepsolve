
export interface CalculationStep {
  expression: string;
  explanation: string;
  rule: string;
}

export interface SymbolDefinition {
  symbol: string;
  name: string;
  meaning: string;
}

export interface CalculationResponse {
  finalAnswer: string;
  steps: CalculationStep[];
  symbols: SymbolDefinition[];
  detectedEquation?: string; // Equation detected from image
  error?: string; // Error message if processing failed
}

export interface ImageData {
  mimeType: string;
  data: string;
}

export interface HistoryItem {
  id: number;
  equation: string;
  result: CalculationResponse;
  image?: ImageData;
}