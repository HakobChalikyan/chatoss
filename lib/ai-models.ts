export interface AIModel {
  id: string;
  name: string;
  description: string;
  capabilities: {
    reasoning: boolean;
    imageGeneration: boolean;
    imageUpload: boolean;
    webSearch: boolean;
    fileUpload: boolean;
  };
}

export const AI_MODELS: AIModel[] = [
  {
    id: "google/gemma-3-27b-it:free",
    name: "Gemma 3 27b",
    description: "Free model",
    capabilities: {
      reasoning: true,
      imageGeneration: false,
      imageUpload: false,
      webSearch: true,
      fileUpload: true,
    },
  },
  {
    id: "google/gemini-2.0-flash-exp:free",
    name: "Gemini 2.0 Flash",
    description: "Free experimental model",
    capabilities: {
      reasoning: true,
      imageGeneration: false,
      imageUpload: true,
      webSearch: true,
      fileUpload: true,
    },
  },
  {
    id: "qwen/qwq-32b:free",
    name: "Qwen qwq-32b",
    description: "Free testing model",
    capabilities: {
      reasoning: true,
      imageGeneration: false,
      imageUpload: true,
      webSearch: true,
      fileUpload: true,
    },
  },
  {
    id: "nvidia/llama-3.1-nemotron-ultra-253b-v1:free",
    name: "Nvidia Llama 3.1",
    description: "Free test",
    capabilities: {
      reasoning: true,
      imageGeneration: false,
      imageUpload: false,
      webSearch: true,
      fileUpload: true,
    },
  },
  {
    id: "microsoft/phi-4-reasoning-plus:free",
    name: "Microsoft Phi 4 - Reasoning",
    description: "Reasoning",
    capabilities: {
      reasoning: true,
      imageGeneration: false,
      imageUpload: false,
      webSearch: true,
      fileUpload: true,
    },
  },
  {
    id: "deepseek/deepseek-r1:free",
    name: "Deepseek R1",
    description: "",
    capabilities: {
      reasoning: true,
      imageGeneration: false,
      imageUpload: false,
      webSearch: true,
      fileUpload: true,
    },
  },
];
