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
  // Free Models
  {
    id: "google/gemma-3-4b-it:free",
    name: "Google: Gemma 3 4B (free)",
    description: "",
    capabilities: {
      reasoning: false,
      imageUpload: true,
    },
    isFree: true,
    family: "Gemma",
    model: "Gemma 3 4B",
  },
  {
    id: "nvidia/nemotron-nano-12b-v2-vl:free",
    name: "Nvidia: Nemotron Nano 12B VL (free)",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: true,
    },
    isFree: true,
    family: "Nvidia",
    model: "Nemotron Nano 12B VL",
  },
  {
    id: "nvidia/nemotron-3-nano-30b-a3b:free",
    name: "Nvidia: Nemotron 3 Nano 30B (free)",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: false,
    },
    isFree: true,
    family: "Nvidia",
    model: "Nemotron 3 Nano 30B",
  },
  {
    id: "upstage/solar-pro-3:free",
    name: "Upstage: Solar Pro 3 (free)",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: false,
    },
    isFree: true,
    family: "Upstage",
    model: "Solar Pro 3",
  },
  {
    id: "arcee-ai/trinity-mini:free",
    name: "Arcee: Trinity Mini (free)",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: false,
    },
    isFree: true,
    family: "Arcee",
    model: "Trinity Mini",
  },
  {
    id: "arcee-ai/trinity-large-preview:free",
    name: "Arcee: Trinity Large Preview (free)",
    description: "",
    capabilities: {
      reasoning: false,
      imageUpload: false,
    },
    isFree: true,
    family: "Arcee",
    model: "Trinity Large Preview",
  },
  {
    id: "tngtech/tng-r1t-chimera:free",
    name: "TNG: R1T Chimera (free)",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: false,
    },
    isFree: true,
    family: "TNG",
    model: "R1T Chimera",
  },
  {
    id: "allenai/molmo-2-8b:free",
    name: "Allen AI: Molmo2 8B (free)",
    description: "",
    capabilities: {
      reasoning: false,
      imageUpload: true,
    },
    isFree: true,
    family: "Allen AI",
    model: "Molmo2 8B",
  },
  // Paid Models
  {
    id: "anthropic/claude-opus-4.5",
    name: "Anthropic: Claude Opus 4.5",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: true,
    },
    isFree: false,
    family: "Anthropic",
    model: "Claude Opus 4.5",
  },
  {
    id: "anthropic/claude-sonnet-4.5",
    name: "Anthropic: Claude Sonnet 4.5",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: true,
    },
    isFree: false,
    family: "Anthropic",
    model: "Claude Sonnet 4.5",
  },
  {
    id: "anthropic/claude-haiku-4.5",
    name: "Anthropic: Claude Haiku 4.5",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: true,
    },
    isFree: false,
    family: "Anthropic",
    model: "Claude Haiku 4.5",
  },
  {
    id: "openai/gpt-5.2-pro",
    name: "OpenAI: GPT-5.2 Pro",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: true,
    },
    isFree: false,
    family: "OpenAI",
    model: "GPT-5.2 Pro",
  },
  {
    id: "openai/gpt-5.2",
    name: "OpenAI: GPT-5.2",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: true,
    },
    isFree: false,
    family: "OpenAI",
    model: "GPT-5.2",
  },
  {
    id: "openai/gpt-5.2-chat",
    name: "OpenAI: GPT-5.2 Chat",
    description: "",
    capabilities: {
      reasoning: false,
      imageUpload: true,
    },
    isFree: false,
    family: "OpenAI",
    model: "GPT-5.2 Chat",
  },
  {
    id: "openai/gpt-5.1",
    name: "OpenAI: GPT-5.1",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: true,
    },
    isFree: false,
    family: "OpenAI",
    model: "GPT-5.1",
  },
  {
    id: "openai/gpt-5.1-codex",
    name: "OpenAI: GPT-5.1 Codex",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: true,
    },
    isFree: false,
    family: "OpenAI",
    model: "GPT-5.1 Codex",
  },
  {
    id: "google/gemini-3-pro-preview",
    name: "Google: Gemini 3 Pro Preview",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: true,
    },
    isFree: false,
    family: "Gemini",
    model: "Gemini 3 Pro Preview",
  },
  {
    id: "google/gemini-3-flash-preview",
    name: "Google: Gemini 3 Flash Preview",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: true,
    },
    isFree: false,
    family: "Gemini",
    model: "Gemini 3 Flash Preview",
  },
  {
    id: "deepseek/deepseek-v3.2",
    name: "DeepSeek: V3.2",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: false,
    },
    isFree: false,
    family: "DeepSeek",
    model: "V3.2",
  },
  {
    id: "qwen/qwen3-vl-32b-instruct",
    name: "Qwen: Qwen3 VL 32B Instruct",
    description: "",
    capabilities: {
      reasoning: false,
      imageUpload: true,
    },
    isFree: false,
    family: "Qwen",
    model: "Qwen3 VL 32B Instruct",
  },
  {
    id: "x-ai/grok-4.1-fast",
    name: "xAI: Grok 4.1 Fast",
    description: "",
    capabilities: {
      reasoning: true,
      imageUpload: true,
    },
    isFree: false,
    family: "Grok",
    model: "Grok 4.1 Fast",
  },
];
