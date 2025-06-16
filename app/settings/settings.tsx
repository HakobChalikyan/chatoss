"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ApiKeyForm } from "@/app/settings/api-key-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function Settings() {
  const { signOut } = useAuthActions();
  const user = useQuery(api.user.currentUser);
  const router = useRouter();

  if (user === undefined) {
    return null; // Still loading
  }

  // Handle the case where user is null (not logged in)
  if (user === null) {
    router.push("/signin");
    return null;
  }

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Button
      variant="ghost"
      size="sm"
      onClick={() => router.push("/")}
      className="gap-2"
      >
        <ArrowLeft className="size-4" />
        Back to chat
      </Button>
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Settings
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage your account settings, preferences, and API keys.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Account Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Update your personal information and email address.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email || "N/A"}
                readOnly // Make it read-only for display purposes
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground">
                Your email address used for logging in.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={user.name || "Not set"}
                readOnly // Make it read-only
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground">
                Your display name visible to others.
              </p>
            </div>
            {user.image && (
              <div className="grid gap-2">
                <Label>Profile Image URL</Label>
                <Input
                  value={user.image}
                  readOnly
                  className="font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground">
                  URL of your profile image.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Keys Card */}
        <Card>
          <CardHeader>
            <CardTitle>API Key</CardTitle>
            <CardDescription>
              Manage your API key for integrating with{" "}
              <a className="border-b" href="https://openrouter.ai/" target="_blank" rel="noopener noreferrer">
                OpenRouter
              </a>
              .
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ApiKeyForm />
          </CardContent>
        </Card>
        {/* Preferences Card */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>
              Customize your user experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="theme">Theme</Label>
              <Input
                id="theme"
                value="System (Dark/Light based on OS)"
                readOnly
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground">
                Choose your preferred theme for the application.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sign Out Button Card */}
        <Card>
          <CardHeader>
            <CardTitle>Sign Out</CardTitle>
            <CardDescription>
              Click here to securely sign out of your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={async () => {
                await signOut();
              }}
              variant="destructive"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}