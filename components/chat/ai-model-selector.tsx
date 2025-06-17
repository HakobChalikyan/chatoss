"use client";

import { useState, useMemo } from "react";
import { Sparkles, Search, X, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AI_MODELS, type AIModel } from "@/lib/ai-models";
import { CAPABILITY_CONFIG, type ActiveCapabilityKey } from "@/lib/ai-capabilities";

interface AIModelSelectorProps {
  selectedModel: AIModel;
  onModelSelect: (model: AIModel) => void;
}

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
            "w-7 h-7 rounded-full border flex items-center justify-center transition-all",
            config.color,
            "hover:scale-110",
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">{config.label}</TooltipContent>
    </Tooltip>
  );
};

const CapabilityFilter = ({
  capability,
  active,
  onClick,
}: {
  capability: ActiveCapabilityKey;
  active: boolean;
  onClick: () => void;
}) => {
  const config = CAPABILITY_CONFIG[capability];
  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
            active
              ? config.color + " scale-110"
              : "bg-neutral-50 text-neutral-400 border-neutral-200 hover:bg-neutral-100 hover:text-neutral-600",
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{config.label}</TooltipContent>
    </Tooltip>
  );
};

export function AIModelSelector({
  selectedModel,
  onModelSelect,
}: AIModelSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<ActiveCapabilityKey>>(
    new Set(),
  );
  const [showFreeModelsOnly, setShowFreeModelsOnly] = useState(false);
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]); // Multiselect for families

  const filteredModels = useMemo(() => {
    let models = AI_MODELS;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      models = models.filter(
        (model) =>
          model.name.toLowerCase().includes(query) ||
          model.family.toLowerCase().includes(query) ||
          model.model.toLowerCase().includes(query) ||
          model.id.toLowerCase().includes(query),
      );
    }

    if (activeFilters.size > 0) {
      models = models.filter((model) =>
        Array.from(activeFilters).every(
          (filter) => !!model.capabilities[filter as FullCapabilityKey],
        ),
      );
    }

    if (showFreeModelsOnly) {
      models = models.filter((model) => model.isFree);
    }

    if (selectedFamilies.length > 0) {
        models = models.filter(model => selectedFamilies.includes(model.family));
    }



    return models;
  }, [searchQuery, activeFilters, showFreeModelsOnly, selectedFamilies]);

  const handleModelSelect = (model: AIModel) => {
    onModelSelect(model);
    setIsOpen(false);
    setSearchQuery("");
  };

  const toggleFilter = (capability: ActiveCapabilityKey) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(capability)) {
      newFilters.delete(capability);
    } else {
      newFilters.add(capability);
    }
    setActiveFilters(newFilters);
  };

  const clearFilters = () => {
    setActiveFilters(new Set());
    setSearchQuery("");
    setShowFreeModelsOnly(false);
    setSelectedFamilies([]); // Clear selected families
  };

  const hasActiveFilters =
    activeFilters.size > 0 || searchQuery.trim().length > 0 || showFreeModelsOnly || selectedFamilies.length > 0;

  const families = useMemo(() => {
    const uniqueFamilies = new Set<string>();
    AI_MODELS.forEach(model => uniqueFamilies.add(model.family));
    return Array.from(uniqueFamilies).sort();
  }, []);

  const toggleFamily = (family: string) => {
      setSelectedFamilies(prevSelectedFamilies => {
          if (prevSelectedFamilies.includes(family)) {
              return prevSelectedFamilies.filter(f => f !== family); // Deselect
          } else {
              return [...prevSelectedFamilies, family]; // Select
          }
      });
  };

  return (
    <TooltipProvider>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={cn(
              "text-xs transition-all duration-200 glass bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30",
              "dark:bg-neutral-800/30 dark:border-neutral-600/30 dark:hover:bg-neutral-700/40 dark:hover:border-neutral-500/40",
            )}
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-neutral-600 dark:text-neutral-300" />
            {selectedModel.family} {selectedModel.model}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-[300px] md:w-[500px] p-0 glass bg-white/95 border-neutral-200/50 backdrop-blur-xl dark:bg-neutral-800/95 dark:border-neutral-700/50 shadow-xl"
        >
          <div className="p-4 border-b border-neutral-100 dark:border-neutral-700">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-neutral-500" />
              <Input
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 h-9 text-sm glass bg-white/50 border-neutral-200/50 dark:bg-neutral-700/50 dark:border-neutral-600/50 dark:text-neutral-100 dark:placeholder:text-neutral-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-300">
                <Filter className="h-3.5 w-3.5" />
                <span>Filter:</span>
              </div>
              <div className="flex gap-2">
                {(Object.keys(CAPABILITY_CONFIG) as ActiveCapabilityKey[]).map(
                  (capability) => (
                    <CapabilityFilter
                      key={capability}
                      capability={capability}
                      active={activeFilters.has(capability)}
                      onClick={() => toggleFilter(capability)}
                    />
                  ),
                )}
                
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowFreeModelsOnly(!showFreeModelsOnly)}
                    className={cn(
                      "w-auto px-3 h-8 rounded-full border-2 flex items-center justify-center text-sm transition-all",
                      showFreeModelsOnly
                        ? "bg-blue-100 text-blue-600 border-blue-200 scale-105"
                        : "bg-neutral-50 text-neutral-400 border-neutral-200 hover:bg-neutral-100 hover:text-neutral-600",
                    )}
                  >
                    Free Only
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">Show only free models</TooltipContent>
              </Tooltip>

              </div>
            </div>

            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="text-xs">
                            {selectedFamilies.length ?  `${selectedFamilies.length} Selected` : "Family"} <ChevronDown className="ml-2 h-3 w-3"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>Families</DropdownMenuLabel>
                        {families.map((family) => (
                            <DropdownMenuCheckboxItem
                                key={family}
                                checked={selectedFamilies.includes(family)}
                                onCheckedChange={() => toggleFamily(family)}
                            >
                                {family}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-6 px-2 text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-700/50"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto flex flex-wrap gap-3 p-3">
            {filteredModels.length === 0 ? (
              <div className="p-6 text-center w-full">
                <div className="text-neutral-400 dark:text-neutral-500 mb-2">
                  <Search className="h-8 w-8 mx-auto" />
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                  No models found
                </p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                  {searchQuery || showFreeModelsOnly || selectedFamilies.length > 0
                    ? `Try a different search term or clear filters`
                    : `Try adjusting your filters`}
                </p>
              </div>
            ) : (
              filteredModels.map((model) => (
                <div
                  key={model.id}
                  onClick={() => handleModelSelect(model)}
                  className={cn(
                    "w-[calc(50%-6px)] md:w-[calc(25%-9px)] h-[9.5rem] p-3 rounded-xl transition-all duration-200 hover-lift border-2 flex flex-col justify-between gap-2",
                    selectedModel.id === model.id
                      ? "glass bg-neutral-100/50 border-neutral-300/50 shadow-sm dark:bg-neutral-700/50 dark:border-neutral-600/50"
                      : "bg-white border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50 dark:bg-neutral-800/50 dark:border-neutral-700 dark:hover:border-neutral-600 dark:hover:bg-neutral-700/70",
                  )}
                >
                  <div className="flex flex-col items-center">
                    <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 text-center">
                      {model.family}
                    </h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center">
                      {model.model}
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    {model.isFree && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 mb-2">
                        Free
                      </span>
                    )}
                    <div className="flex gap-2">
                      {(Object.keys(CAPABILITY_CONFIG) as ActiveCapabilityKey[]).map(
                        (capability) => (
                          <CapabilityIcon
                            key={capability}
                            capability={capability}
                            active={!!model.capabilities[capability as FullCapabilityKey]}
                          />
                        ),
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-neutral-100 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50">
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
              <span>
                {filteredModels.length} of {AI_MODELS.length} models
              </span>
              {hasActiveFilters && (
                <span className="text-neutral-600 dark:text-neutral-300">
                  {activeFilters.size} capability filter
                  {activeFilters.size !== 1 ? "s" : ""}
                  {showFreeModelsOnly ? " + Free Only" : ""}
                  {selectedFamilies.length > 0 ? ` + Families: ${selectedFamilies.join(', ')}` : ""}
                   active
                </span>
              )}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}