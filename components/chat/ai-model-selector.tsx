"use client";

import { useState, useMemo } from "react";
import { Check, Sparkles, Search, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AI_MODELS, AIModel } from "@/lib/ai-models";
import { CAPABILITY_CONFIG } from "@/lib/ai-capabilities";

interface AIModelSelectorProps {
  selectedModel: AIModel;
  onModelSelect: (model: AIModel) => void;
}

type CapabilityKey = keyof AIModel["capabilities"];

const CapabilityIcon = ({
  capability,
  active,
}: {
  capability: CapabilityKey;
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
      <TooltipContent side="top" className="text-xs">
        {config.label}
      </TooltipContent>
    </Tooltip>
  );
};

const CapabilityFilter = ({
  capability,
  active,
  onClick,
}: {
  capability: CapabilityKey;
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
              : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100 hover:text-gray-600",
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {config.label}
      </TooltipContent>
    </Tooltip>
  );
};

export function AIModelSelector({
  selectedModel,
  onModelSelect,
}: AIModelSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<CapabilityKey>>(
    new Set(),
  );

  const filteredModels = useMemo(() => {
    let models = AI_MODELS;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      models = models.filter(
        (model) =>
          model.name.toLowerCase().includes(query) ||
          model.description.toLowerCase().includes(query) ||
          model.id.toLowerCase().includes(query),
      );
    }

    // Apply capability filters
    if (activeFilters.size > 0) {
      models = models.filter((model) =>
        Array.from(activeFilters).every((filter) => model.capabilities[filter]),
      );
    }

    return models;
  }, [searchQuery, activeFilters]);

  const handleModelSelect = (model: AIModel) => {
    onModelSelect(model);
    setIsOpen(false);
    setSearchQuery("");
  };

  const toggleFilter = (capability: CapabilityKey) => {
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
  };

  const hasActiveFilters =
    activeFilters.size > 0 || searchQuery.trim().length > 0;

  return (
    <TooltipProvider>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-xs hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
            {selectedModel.name}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[420px] p-0">
          {/* Search Section */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 h-9 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Capability Filters */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Filter className="h-3.5 w-3.5" />
                <span>Filter:</span>
              </div>
              <div className="flex gap-2">
                {(Object.keys(CAPABILITY_CONFIG) as CapabilityKey[]).map(
                  (capability) => (
                    <CapabilityFilter
                      key={capability}
                      capability={capability}
                      active={activeFilters.has(capability)}
                      onClick={() => toggleFilter(capability)}
                    />
                  ),
                )}
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Models List */}
          <div className="max-h-[400px] overflow-y-auto">
            {filteredModels.length === 0 ? (
              <div className="p-6 text-center">
                <div className="text-gray-400 mb-2">
                  <Search className="h-8 w-8 mx-auto" />
                </div>
                <p className="text-sm text-gray-500 mb-1">No models found</p>
                <p className="text-xs text-gray-400">
                  {searchQuery
                    ? `Try a different search term`
                    : `Try adjusting your filters`}
                </p>
              </div>
            ) : (
              <div className="p-3">
                {filteredModels.map((model, index) => (
                  <button
                    key={model.id}
                    onClick={() => handleModelSelect(model)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl transition-all duration-200",
                      "border-2 hover:shadow-md",
                      selectedModel.id === model.id
                        ? "bg-blue-50 border-blue-200 shadow-sm"
                        : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50",
                      index > 0 && "mt-2",
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm text-gray-900 truncate">
                            {model.name}
                          </h3>
                          {selectedModel.id === model.id && (
                            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                          {model.description}
                        </p>
                      </div>
                    </div>

                    {/* Capability Icons */}
                    <div className="flex gap-2">
                      {(Object.keys(CAPABILITY_CONFIG) as CapabilityKey[]).map(
                        (capability) => (
                          <CapabilityIcon
                            key={capability}
                            capability={capability}
                            active={model.capabilities[capability]}
                          />
                        ),
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {filteredModels.length} of {AI_MODELS.length} models
              </span>
              {hasActiveFilters && (
                <span className="text-blue-600">
                  {activeFilters.size} filter
                  {activeFilters.size !== 1 ? "s" : ""} active
                </span>
              )}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}
