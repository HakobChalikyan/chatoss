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
    model: "2.0 Flash Exp",
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
    id: "openai/o3-pro",
    name: "OpenAI: o3 Pro",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: true,
    },
    isFree: false,
    family: "OpenAI",
    model: "o3 Pro",
  },
  {
    id: "google/gemini-2.5-pro-preview",
    name: "Google: Gemini 2.5 Pro Preview 06-05",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: true,
    },
    isFree: false,
    family: "Gemini",
    model: "2.5 Pro Preview",
  },
  {
    id: "deepseek/deepseek-r1-distill-qwen-7b",
    name: "DeepSeek: R1 Distill Qwen 7B",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: false,
    },
    isFree: false,
    family: "DeepSeek",
    model: "R1 Distill Qwen 7B",
  },
  {
    id: "deepseek/deepseek-r1-0528-qwen3-8b:free",
    name: "DeepSeek: Deepseek R1 0528 Qwen3 8B (free)",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: false,
    },
    isFree: true,
    family: "DeepSeek",
    model: "R1 0528 Qwen3 8B",
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
    id: "deepseek/deepseek-r1-0528",
    name: "DeepSeek: R1 0528",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: false,
    },
    isFree: false,
    family: "DeepSeek",
    model: "R1 0528",
  },
  {
    id: "openai/o3-mini",
    name: "OpenAI: o3 Mini",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: true,
    },
    isFree: false,
    family: "OpenAI",
    model: "o3 Mini",
  },
  {
    id: "google/gemini-2.5-flash-preview-05-20",
    name: "Google: Gemini 2.5 Flash Preview 05-20",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: true,
    },
    isFree: false,
    family: "Gemini",
    model: "2.5 Flash Preview",
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
    model: "2.5 Flash Preview",
  },
  {
    id: "openai/o4-mini-high",
    name: "OpenAI: o4 Mini High",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: true,
    },
    isFree: false,
    family: "OpenAI",
    model: "o4 Mini High",
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
    id: "microsoft/phi-4-reasoning-plus:free",
    name: "Microsoft: Phi 4 Reasoning Plus (free)",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: false,
    },
    isFree: true,
    family: "Microsoft",
    model: "Phi 4",
  },
    {
    id: "microsoft/phi-4-reasoning-plus",
    name: "Microsoft: Phi 4 Reasoning Plus",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: false,
    },
    isFree: false,
    family: "Microsoft",
    model: "Phi 4",
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
    model: "Phi 4",
  },
  {
    id: "qwen/qwen3-30b-a3b:free",
    name: "Qwen: Qwen3 30B A3B (free)",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: false,
    },
    isFree: true,
    family: "Qwen",
    model: "Qwen3 30B A3B",
  },
  {
    id: "qwen/qwen3-30b-a3b",
    name: "Qwen: Qwen3 30B A3B",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: false,
    },
    isFree: false,
    family: "Qwen",
    model: "Qwen3 30B A3B",
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
    id: "qwen/qwen3-32b",
    name: "Qwen: Qwen3 32B",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: false,
    },
    isFree: false,
    family: "Qwen",
    model: "Qwen3 32B",
  },
    {
    id: "anthropic/claude-3-sonnet",
    name: "Anthropic: Claude 3 Sonnet",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: true,
    },
    isFree: false,
    family: "Anthropic",
    model: "Claude 3 Sonnet",
  },
 {
    id: "openai/gpt-4o-mini",
    name: "OpenAI: GPT-4o-mini",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: true,
    },
    isFree: false,
    family: "OpenAI",
    model: "GPT-4o-mini",
  },
];