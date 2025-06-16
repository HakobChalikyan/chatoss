import { Brain, ImageIcon, Globe, File } from "lucide-react";

export const CAPABILITY_CONFIG = {
  reasoning: {
    icon: Brain,
    label: "Advanced Reasoning",
    color: "bg-purple-100 text-purple-600 border-purple-200",
  },
  imageUpload: {
    icon: ImageIcon,
    label: "Image Upload and Analysis",
    color: "bg-green-100 text-green-600 border-green-200",
  },
  webSearch: {
    icon: Globe,
    label: "Web Search",
    color: "bg-blue-100 text-blue-600 border-blue-200",
  },
  fileUpload: {
    icon: File,
    label: "File Upload",
    color: "bg-yellow-100 text-yellow-600 border-yellow-200",
  },
  imageGeneration: {
    icon: ImageIcon,
    label: "Image Generation",
    color: "bg-pink-100 text-pink-600 border-pink-200",
  },
} as const;
