"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ApiKeyForm } from "@/app/settings/api-key-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Key,
  SettingsIcon,
  LogOut,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function Settings() {
  const { signOut } = useAuthActions();
  const user = useQuery(api.user.currentUser);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  if (user === undefined) {
    return null; // Still loading
  }

  // Handle the case where user is null (not logged in)
  if (user === null) {
    router.push("/signin");
    return null;
  }

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  const currentTheme =
    themeOptions.find((option) => option.value === theme) || themeOptions[2];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-900 dark:to-slate-900">
      <div className="container mx-auto py-10 max-w-2xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/")}
          className="gap-2 mb-6 glass bg-white/50 hover:bg-white/70 border border-gray-200/50 dark:bg-gray-800/50 dark:hover:bg-gray-700/70 dark:border-gray-700/50"
        >
          <ArrowLeft className="size-4" />
          Back to chat
        </Button>

        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-500 to-slate-600 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl gradient-text">
              Settings
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Manage your account settings, preferences, and API keys.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Account Settings Card */}
          <Card className="glass bg-white/80 border-gray-200/50 backdrop-blur-xl dark:bg-gray-800/80 dark:border-gray-700/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-400 to-slate-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-gray-900 dark:text-gray-100">
                    Account Settings
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Update your personal information and email address.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label
                  htmlFor="email"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || "N/A"}
                  readOnly
                  className="font-mono text-sm glass bg-gray-50/50 border-gray-200/50 dark:bg-gray-700/50 dark:border-gray-600/50"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your email address used for logging in.
                </p>
              </div>
              <div className="grid gap-2">
                <Label
                  htmlFor="name"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Name
                </Label>
                <Input
                  id="name"
                  value={user.name || "Not set"}
                  readOnly
                  className="font-mono text-sm glass bg-gray-50/50 border-gray-200/50 dark:bg-gray-700/50 dark:border-gray-600/50"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your display name visible to others.
                </p>
              </div>
              {user.image && (
                <div className="grid gap-2">
                  <Label className="text-gray-700 dark:text-gray-300">
                    Profile Image URL
                  </Label>
                  <Input
                    value={user.image}
                    readOnly
                    className="font-mono text-sm glass bg-gray-50/50 border-gray-200/50 dark:bg-gray-700/50 dark:border-gray-600/50"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    URL of your profile image.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* API Keys Card */}
          <Card className="glass bg-white/80 border-gray-200/50 backdrop-blur-xl dark:bg-gray-800/80 dark:border-gray-700/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-400 to-gray-500 flex items-center justify-center">
                  <Key className="w-4 h-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-gray-900 dark:text-gray-100">
                    API Key
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Manage your API key for integrating with{" "}
                    <a
                      className="border-b border-gray-400 hover:border-gray-600 dark:border-gray-500 dark:hover:border-gray-400 transition-colors"
                      href="https://openrouter.ai/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      OpenRouter
                    </a>
                    .
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ApiKeyForm />
            </CardContent>
          </Card>

          {/* Preferences Card */}
          <Card className="glass bg-white/80 border-gray-200/50 backdrop-blur-xl dark:bg-gray-800/80 dark:border-gray-700/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-400 to-stone-500 flex items-center justify-center">
                  <SettingsIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-gray-900 dark:text-gray-100">
                    Preferences
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Customize your user experience.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label
                  htmlFor="theme"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Theme
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-between h-11",
                        "glass bg-gray-50/50 border-gray-200/50 hover:bg-gray-100/50",
                        "dark:bg-gray-700/50 dark:border-gray-600/50 dark:hover:bg-gray-600/50",
                        "transition-all duration-200",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-md bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                          <currentTheme.icon className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {currentTheme.label}
                        </span>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-[280px] glass bg-white/95 border-gray-200/50 backdrop-blur-xl dark:bg-gray-800/95 dark:border-gray-700/50 p-2"
                  >
                    {themeOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        className={cn(
                          "flex items-center gap-3 cursor-pointer rounded-lg p-3 transition-all duration-200",
                          "hover:bg-gray-100/50 dark:hover:bg-gray-700/50",
                          theme === option.value &&
                            "bg-gray-100/70 dark:bg-gray-700/70",
                        )}
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <option.icon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {option.label}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {option.value === "light" &&
                              "Always use light mode"}
                            {option.value === "dark" && "Always use dark mode"}
                            {option.value === "system" &&
                              "Follow system preference"}
                          </p>
                        </div>
                        {theme === option.value && (
                          <div className="w-2 h-2 rounded-full bg-gray-600 dark:bg-gray-400" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Choose your preferred theme for the application.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sign Out Button Card */}
          <Card className="glass bg-white/80 border-gray-200/50 backdrop-blur-xl dark:bg-gray-800/80 dark:border-gray-700/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-gray-900 dark:text-gray-100">
                    Sign Out
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Click here to securely sign out of your account
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={async () => {
                  await signOut();
                }}
                variant="destructive"
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
