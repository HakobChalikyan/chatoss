import {
  LucideIcon,
  Brain,
  MessageCircle,
  Rocket,
  Zap,
  Sparkles,
  Compass,
  BookOpen,
  Code,
} from "lucide-react";

interface Category {
  id: string;
  icon: LucideIcon;
  label: string;
  color: string;
}

interface SuggestedQuestion {
  icon: LucideIcon;
  text: string;
  gradient: string;
  category: string;
}

export const categories: Category[] = [
  {
    id: "create",
    icon: Sparkles,
    label: "Create",
    color:
      "from-neutral-500 to-neutral-600 dark:from-neutral-400 dark:to-neutral-500",
  },
  {
    id: "explore",
    icon: BookOpen,
    label: "Explore",
    color: "from-stone-500 to-zinc-600 dark:from-stone-400 dark:to-zinc-500",
  },
  {
    id: "code",
    icon: Code,
    label: "Code",
    color:
      "from-neutral-500 to-neutral-600 dark:from-neutral-400 dark:to-neutral-500",
  },
  {
    id: "learn",
    icon: Compass,
    label: "Learn",
    color: "from-zinc-500 to-stone-600 dark:from-zinc-400 dark:to-stone-500",
  },
];

export const suggestedQuestions: SuggestedQuestion[] = [
  {
    icon: Zap,
    text: "Generate a catchy slogan for a coffee shop.",
    gradient: "from-red-500 to-red-600 dark:from-red-400 dark:to-red-500",
    category: "create",
  },
  {
    icon: Sparkles,
    text: "Design a superhero with an unusual power.",
    gradient:
      "from-yellow-500 to-yellow-600 dark:from-yellow-400 dark:to-yellow-500",
    category: "create",
  },
  {
    icon: Sparkles,
    text: "Write a haiku about the ocean at night.",
    gradient:
      "from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500",
    category: "create",
  },
  {
    icon: Rocket,
    text: "Are black holes real?",
    gradient:
      "from-neutral-500 to-neutral-600 dark:from-neutral-400 dark:to-neutral-500",
    category: "explore",
  },
  {
    icon: MessageCircle,
    text: "What is the meaning of life?",
    gradient: "from-zinc-500 to-zinc-600 dark:from-zinc-400 dark:to-zinc-500",
    category: "explore",
  },
  {
    icon: BookOpen,
    text: "What’s the most mysterious place on Earth?",
    gradient: "from-teal-500 to-teal-600 dark:from-teal-400 dark:to-teal-500",
    category: "explore",
  },
  {
    icon: Code,
    text: "Explain closures in JavaScript.",
    gradient: "from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500",
    category: "code",
  },
  {
    icon: Code,
    text: "What is the difference between `let`, `const`, and `var` in JavaScript?",
    gradient:
      "from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500",
    category: "code",
  },
  {
    icon: Code,
    text: "How does recursion work?",
    gradient:
      "from-amber-500 to-amber-600 dark:from-amber-400 dark:to-amber-500",
    category: "code",
  },
  {
    icon: Brain,
    text: "How does AI work?",
    gradient:
      "from-neutral-500 to-neutral-600 dark:from-neutral-400 dark:to-neutral-500",
    category: "learn",
  },
  {
    icon: Compass,
    text: "How do vaccines work?",
    gradient: "from-sky-500 to-sky-600 dark:from-sky-400 dark:to-sky-500",
    category: "learn",
  },
  {
    icon: Compass,
    text: "What is Occam’s Razor?",
    gradient:
      "from-violet-500 to-violet-600 dark:from-violet-400 dark:to-violet-500",
    category: "learn",
  },
];
