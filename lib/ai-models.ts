export interface AIModel {
  id: string;
  name: string;
  description: string;
  capabilities: {
    reasoning?: boolean;
    imageGeneration?: boolean;
    imageUpload?: boolean;
    webSearch?: boolean;
    fileUpload?: boolean;
  };
  isFree: boolean;
  family: string;
  model: string;
}

export const AI_MODELS: AIModel[] = [
  {
    id: "google/gemini-2.0-flash-exp:free",
    name: "Google: Gemini 2.0 Flash Experimental (free)",
    description: "",
    capabilities: {
      reasoning: false,
      imageUpload: true,
    },
    isFree: true,
    family: "Gemini",
    model: "2.0 Flash",
  },
  {
    id: "google/gemini-2.0-flash-lite-001",
    name: "Google: Gemini 2.0 Flash Lite",
    description: "",
    capabilities: {
      reasoning: false,
      imageUpload: true,
    },
    isFree: false,
    family: "Gemini",
    model: "2.0 Flash Lite",
  },
  {
    id: "google/gemini-2.5-flash",
    name: "Google: Gemini 2.5 Flash",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: true,
    },
    isFree: false,
    family: "Gemini",
    model: "2.5 Flash",
  },
  {
    id: "google/gemini-2.5-flash-preview-05-20:thinking",
    name: "Google: Gemini 2.5 Flash Preview 05-20 (thinking)",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: true,
    },
    isFree: false,
    family: "Gemini",
    model: "2.5 Flash (Thinking)",
  },
  {
    id: "google/gemini-2.5-flash-lite-preview-06-17",
    name: "Google: Gemini 2.5 Flash Lite Preview 06-17",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: true,
    },
    isFree: false,
    family: "Gemini",
    model: "2.5 Flash Lite",
  },
  {
    id: "google/gemini-2.5-pro",
    name: "Google: Gemini 2.5 Pro",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: true,
    },
    isFree: false,
    family: "Gemini",
    model: "2.5 Pro",
  },
  {
    id: "openai/gpt-4o-mini",
    name: "OpenAI: GPT 4o-mini",
    description: "",
    capabilities: {
      reasoning: false,
      imageUpload: true,
    },
    isFree: false,
    family: "OpenAI",
    model: "GPT 4o-mini",
  },
  {
    id: "openai/gpt-4o",
    name: "OpenAI: GPT-4o",
    description: "",
    capabilities: {
      reasoning: false,
      imageUpload: true,
    },
    isFree: false,
    family: "OpenAI",
    model: "GPT 4o",
  },
  {
    id: "openai/gpt-4.1",
    name: "OpenAI: GPT-4.1",
    description: "",
    capabilities: {
      reasoning: false,
      imageUpload: true,
    },
    isFree: false,
    family: "OpenAI",
    model: "GPT 4.1",
  },
  {
    id: "openai/gpt-4.1-mini",
    name: "OpenAI: GPT 4.1 Mini",
    description: "",
    capabilities: {
      reasoning: false,
      imageUpload: true,
    },
    isFree: false,
    family: "OpenAI",
    model: "GPT 4.1 Mini",
  },
  {
    id: "openai/gpt-4.1-nano",
    name: "OpenAI: GPT-4.1 Nano",
    description: "",
    capabilities: {
      reasoning: false,
      imageUpload: true,
    },
    isFree: false,
    family: "OpenAI",
    model: "GPT 4.1 Nano",
  },
  {
    id: "openai/o3-mini",
    name: "OpenAI: o3 Mini",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: false,
    },
    isFree: false,
    family: "OpenAI",
    model: "o3 Mini",
  },
  {
    id: "openai/o4-mini",
    name: "OpenAI: o4 Mini",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: true,
    },
    isFree: false,
    family: "OpenAI",
    model: "o4 Mini",
  },
  {
    id: "openai/o3",
    name: "OpenAI: o3",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: true,
    },
    isFree: false,
    family: "OpenAI",
    model: "o3",
  },
  {
    id: "anthropic/claude-3.5-haiku",
    name: "Anthropic: Claude 3.5 Haiku",
    description: "",
    capabilities: {
      reasoning: false,
      imageUpload: true,
    },
    isFree: false,
    family: "Anthropic",
    model: "Claude 3.5 Haiku",
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Anthropic: Claude 3.5 Sonnet",
    description: "",
    capabilities: {
      reasoning: false,
      imageUpload: true,
    },
    isFree: false,
    family: "Anthropic",
    model: "Claude 3.5 Sonnet",
  },
  {
    id: "anthropic/claude-3.7-sonnet",
    name: "Anthropic: Claude 3.7 Sonnet",
    description: "",
    capabilities: {
      reasoning: false,
      imageUpload: true,
    },
    isFree: false,
    family: "Anthropic",
    model: "Claude 3.7 Sonnet",
  },
  {
    id: "anthropic/claude-3.7-sonnet:thinking",
    name: "Anthropic: Claude 3.7 Sonnet (thinking)",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: true,
    },
    isFree: false,
    family: "Anthropic",
    model: "Claude 3.7 Sonnet (Thinking)",
  },
  {
    id: "anthropic/claude-sonnet-4",
    name: "Anthropic: Claude Sonnet 4",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: true,
    },
    isFree: false,
    family: "Anthropic",
    model: "Claude Claude Sonnet 4",
  },
  {
    id: "anthropic/claude-opus-4",
    name: "Anthropic: Claude Opus 4",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: true,
    },
    isFree: false,
    family: "Anthropic",
    model: "Claude Opus 4",
  },
  {
    id: "meta-llama/llama-4-scout:free",
    name: "Meta: Llama 4 Scout (free)",
    description: "",
    capabilities: {
      reasoning: false,
      imageUpload: true,
    },
    isFree: true,
    family: "Meta",
    model: "Llama 4 Scout",
  },
  {
    id: "meta-llama/llama-4-maverick:free",
    name: "Meta: Llama 4 Maverick (free)",
    description: "",
    capabilities: {
      reasoning: false,
      imageUpload: true,
    },
    isFree: true,
    family: "Meta",
    model: "Llama 4 Maverick",
  },
  {
    id: "deepseek/deepseek-r1-0528:free",
    name: "DeepSeek: R1 0528 (free)",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: false,
    },
    isFree: true,
    family: "DeepSeek",
    model: "R1 0528",
  },
  {
    id: "deepseek/deepseek-chat-v3-0324:free",
    name: "DeepSeek: V3 0324 (free)",
    description: "",
    capabilities: {
      reasoning: false,
      imageUpload: false,
    },
    isFree: true,
    family: "DeepSeek",
    model: "V3 0324",
  },
  {
    id: "deepseek/deepseek-r1-distill-llama-70b:free",
    name: "DeepSeek: R1 Distill Llama 70B (free)",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: false,
    },
    isFree: true,
    family: "DeepSeek",
    model: "R1 Distill Llama 70B",
  },
  {
    id: "deepseek/deepseek-r1-distill-qwen-32b:free",
    name: "DeepSeek: R1 Distill Qwen 32B (free)",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: false,
    },
    isFree: true,
    family: "DeepSeek",
    model: "R1 Distill Qwen 32B",
  },
  {
    id: "qwen/qwen3-32b:free",
    name: "Qwen: Qwen3 32B (free)",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: false,
    },
    isFree: true,
    family: "Qwen",
    model: "Qwen3 32B",
  },
  {
    id: "x-ai/grok-3-mini-beta",
    name: "Grok 3 Mini",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: false,
    },
    isFree: false,
    family: "Grok",
    model: "3 Mini",
  },
  {
    id: "x-ai/grok-3-beta",
    name: "Grok 3",
    description: "",
    capabilities: {
      reasoning: false,
      imageUpload: false,
    },
    isFree: false,
    family: "Grok",
    model: "3",
  },
  {
    id: "microsoft/phi-4-reasoning:free",
    name: "Microsoft: Phi 4 Reasoning (free)",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: false,
    },
    isFree: true,
    family: "Microsoft",
    model: "Phi 4 Reasoning",
  },
];