import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface AIModel {
  id: string;
  name: string;
  description: string;
}

export const AI_MODELS: AIModel[] = [
  {
    id: "google/gemma-3-27b-it:free",
    name: "Gemma 3 27b",
    description: "Free model",
  },
  {
    id: "google/gemini-2.0-flash-exp:free",
    name: "Gemini 2.0 Flash",
    description: "Free experimental model",
  },
  {
    id: "qwen/qwq-32b:free",
    name: "Qwen qwq-32b",
    description: "Free testing model",
  },
];

interface AIModelSelectorProps {
  selectedModel: AIModel;
  onModelSelect: (model: AIModel) => void;
}

export function AIModelSelector({
  selectedModel,
  onModelSelect,
}: AIModelSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" size="sm" variant="outline" className="text-xs">
          <Sparkles className="h-3.5 w-3.5 mr-1" />
          {selectedModel.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        {AI_MODELS.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onModelSelect(model)}
            className="flex items-center justify-between"
          >
            <span>{model.name}</span>
            {selectedModel.id === model.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
