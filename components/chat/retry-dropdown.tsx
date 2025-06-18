"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AI_MODELS, AIModel } from "@/lib/ai-models";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";
import {
  CAPABILITY_CONFIG,
  type ActiveCapabilityKey,
} from "@/lib/ai-capabilities";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type FullCapabilityKey = keyof AIModel["capabilities"];

const CapabilityIcon = ({
  capability,
  active,
}: {
  capability: ActiveCapabilityKey;
  active: boolean;
}) => {
  if (!active) return null;

  const config = CAPABILITY_CONFIG[capability];
  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
            config.color,
            "hover:scale-110",
          )}
        >
          <Icon className="h-2.5 w-2.5" />
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">{config.label}</TooltipContent>
    </Tooltip>
  );
};

interface RetryDropdownProps {
  currentModel: AIModel;
  onRetrySame: () => void;
  onSelect: (model: AIModel) => void;
  children: React.ReactNode;
}

export function RetryDropdown({
  currentModel,
  onRetrySame,
  onSelect,
  children,
}: RetryDropdownProps) {
  // Group models by family
  const families = React.useMemo(() => {
    const grouped: Record<string, AIModel[]> = {};
    for (const model of AI_MODELS) {
      if (!grouped[model.family]) grouped[model.family] = [];
      grouped[model.family].push(model);
    }
    return grouped;
  }, []);

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Retry message</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="min-w-[220px]">
          <DropdownMenuItem onClick={onRetrySame} className="font-medium">
            <RotateCcw className="w-4 h-4 mr-2" /> Retry same
          </DropdownMenuItem>
          <div className="flex items-center my-2">
            <div className="flex-grow h-px bg-foreground" />
            <span className="mx-3 font-medium whitespace-nowrap text-sm">
              or switch model
            </span>
            <div className="flex-grow h-px bg-foreground" />
          </div>
          {Object.entries(families).map(([family, models]) => (
            <DropdownMenuSub key={family}>
              <DropdownMenuSubTrigger className="flex items-center gap-2">
                <span className="font-medium">{family}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {models.map((model) => (
                  <DropdownMenuItem
                    key={model.id}
                    onClick={() => onSelect(model)}
                    className={cn(
                      "flex items-center justify-between gap-2",
                      model.id === currentModel.id &&
                        "text-pink-600 font-semibold",
                    )}
                  >
                    <div className="flex items-center justify-between w-full gap-2">
                      <div className="space-x-2">
                        <span>
                          {model.family} {model.model}
                        </span>

                        {model.isFree && (
                          <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                            Free
                          </span>
                        )}
                      </div>

                      <div className="flex gap-1 mt-1">
                        {(
                          Object.keys(
                            CAPABILITY_CONFIG,
                          ) as ActiveCapabilityKey[]
                        ).map((capability) => (
                          <CapabilityIcon
                            key={capability}
                            capability={capability}
                            active={
                              !!model.capabilities[
                                capability as FullCapabilityKey
                              ]
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}
