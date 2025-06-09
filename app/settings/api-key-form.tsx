"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function ApiKeyForm() {
  const [apiKey, setApiKey] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const saveApiKey = useMutation(api.apiKeys.saveApiKey);
  const existingKey = useQuery(api.apiKeys.getApiKey, { userId: undefined });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveApiKey({ apiKey, model: "openai" });
      setIsEditing(false);
      toast("API key saved successfully");
    } catch (error) {
      toast("Failed to save API key");
    }
  };

  if (!isEditing && existingKey) {
    return (
      <div className="space-y-4">
        <div>
          <Label>OpenAI API Key</Label>
          <p className="text-sm text-muted-foreground mt-2">
            Your API key is saved and secure
          </p>
        </div>
        <Button onClick={() => setIsEditing(true)}>Change API Key</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="apiKey">OpenAI API Key</Label>
        <Input
          id="apiKey"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your OpenAI API key"
          className="mt-2"
        />
        <p className="text-sm text-muted-foreground mt-2">
          Your API key is encrypted and stored securely
        </p>
      </div>
      <div className="flex gap-2">
        <Button type="submit">Save API Key</Button>
        {existingKey && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
