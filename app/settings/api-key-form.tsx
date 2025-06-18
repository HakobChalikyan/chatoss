"use client";

import type React from "react";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Key, Check, Edit } from "lucide-react";

export function ApiKeyForm() {
  const [apiKey, setApiKey] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const saveApiKey = useMutation(api.apiKeys.saveApiKey);
  const existingKey = useQuery(api.apiKeys.getApiKey, { userId: undefined });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveApiKey({ apiKey, model: "openrouter" });
      setIsEditing(false);
      toast("API key saved successfully");
    } catch (error) {
      toast("Failed to save API key");
    }
  };

  if (!isEditing && existingKey) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-xl glass bg-green-50/50 border border-green-200/50 dark:bg-green-900/20 dark:border-green-700/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
            <Label className="text-green-800 dark:text-green-200 font-medium">
              OpenRouter API Key
            </Label>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300">
            Your API key is saved and secure
          </p>
        </div>
        <Button
          onClick={() => setIsEditing(true)}
          variant="outline"
          className="glass bg-white/50 hover:bg-white/70 border-neutral-200/50 dark:bg-neutral-700/50 dark:hover:bg-neutral-600/70 dark:border-neutral-600/50"
        >
          <Edit className="w-4 h-4 mr-2" />
          Change API Key
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label
          htmlFor="apiKey"
          className="text-neutral-700 dark:text-neutral-300 flex items-center gap-2"
        >
          OpenRouter API Key
        </Label>
        <Input
          id="apiKey"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your OpenRouter API key"
          className="mt-2 glass bg-white/50 border-neutral-200/50 dark:bg-neutral-700/50 dark:border-neutral-600/50"
        />
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
          Your API key is encrypted and stored securely
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          type="submit"
          className="bg-gradient-to-r from-neutral-500 to-neutral-600 hover:from-neutral-600 hover:to-neutral-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Check className="w-4 h-4 mr-2" />
          Save API Key
        </Button>
        {existingKey && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsEditing(false)}
            className="glass bg-white/50 hover:bg-white/70 border-neutral-200/50 dark:bg-neutral-700/50 dark:hover:bg-neutral-600/70 dark:border-neutral-600/50"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
