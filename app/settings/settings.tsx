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
  LogOut,
  Sun,
  Moon,
  Monitor,
  Shield,
  Palette,
  ExternalLink,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function Settings() {
  const { signOut } = useAuthActions();
  const user = useQuery(api.user.currentUser);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (user === null) {
    router.push("/signin");
    return null;
  }

  const themeOptions = [
    {
      value: "light",
      label: "Light",
      icon: Sun,
      desc: "Bright and clean interface",
    },
    { value: "dark", label: "Dark", icon: Moon, desc: "Easy on the eyes" },
    {
      value: "system",
      label: "System",
      icon: Monitor,
      desc: "Matches your device",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 max-w-4xl">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="gap-2 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-all duration-200"
            >
              <ArrowLeft className="size-4" />
              Back to chat
            </Button>
            <Button
              onClick={async () => {
                await signOut();
              }}
              variant="destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Page Header */}
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl gradient-text">
              Settings
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Manage your preferences and API keys.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Section */}
            <Card className="group hover:shadow-xl transition-all duration-300 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {user.image ? (
                        <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-indigo-100 dark:ring-indigo-900/50">
                          <img
                            src={user.image}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center ring-4 ring-indigo-100 dark:ring-indigo-900/50">
                          <User className="w-10 h-10 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {user.name || "Welcome"}
                      </CardTitle>
                      <CardDescription className="text-base text-slate-600 dark:text-slate-400 mt-1">
                        Account Information
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Display Name
                    </Label>
                    <Input
                      value={user.name || "Not set"}
                      readOnly
                      className="bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-base h-12 rounded-xl font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Email Address
                    </Label>
                    <Input
                      value={user.email || "N/A"}
                      readOnly
                      className="bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-base h-12 rounded-xl font-mono"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Configuration */}
            <Card className="group hover:shadow-xl transition-all duration-300 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                    <Key className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      API Integration
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      Connect with{" "}
                      <a
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
                        href="https://openrouter.ai/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        OpenRouter
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ApiKeyForm />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Theme Selector */}
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                    <Palette className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Appearance
                    </CardTitle>
                    <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                      Customize your theme
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  {themeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl transition-all duration-200 text-left",
                        "hover:bg-slate-50 dark:hover:bg-slate-700/50",
                        theme === option.value
                          ? "bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-500/20"
                          : "bg-slate-50/50 dark:bg-slate-700/30",
                      )}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          theme === option.value
                            ? "bg-indigo-500 text-white"
                            : "bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300",
                        )}
                      >
                        <option.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {option.label}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {option.desc}
                        </div>
                      </div>
                      {theme === option.value && (
                        <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
