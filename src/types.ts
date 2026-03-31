export interface CompletionMessage {
  role: "system" | "user" | "assistant";
  text: string;
}

export interface CompletionOptions {
  stream: boolean;
  temperature?: number;
  maxTokens?: number;
}

export interface CompletionRequest {
  modelUri: string;
  completionOptions: CompletionOptions;
  messages: CompletionMessage[];
}

export interface CompletionAlternative {
  message: CompletionMessage;
  status: string;
}

export interface CompletionResult {
  alternatives: CompletionAlternative[];
  usage: { inputTextTokens: string; completionTokens: string; totalTokens: string };
  modelVersion: string;
}

export interface CompletionResponse {
  result: CompletionResult;
}

export interface AsyncCompletionResponse {
  id: string;
  description: string;
  createdAt: string;
  createdBy: string;
  modifiedAt: string;
  done: boolean;
}

export interface TokenizeRequest {
  modelUri: string;
  text: string;
}

export interface TokenizeResponse {
  tokens: Array<{ id: string; text: string }>;
  modelVersion: string;
}
