import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const VIEW_PREFERENCE_KEY = "view_preference";

export type ViewPreference = "chats" | "folders";

function getInitialView(searchParams: URLSearchParams): ViewPreference {
  // First check URL
  const urlView = searchParams.get("view") as ViewPreference;
  if (urlView && (urlView === "chats" || urlView === "folders")) {
    return urlView;
  }

  // Then check localStorage
  const storedView = localStorage.getItem(
    VIEW_PREFERENCE_KEY,
  ) as ViewPreference;
  if (storedView && (storedView === "chats" || storedView === "folders")) {
    return storedView;
  }

  // Default to chats if nothing found
  return "chats";
}

export function useViewPreference() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<ViewPreference>(() =>
    getInitialView(searchParams),
  );

  // Sync URL and localStorage on mount
  useEffect(() => {
    const urlView = searchParams.get("view") as ViewPreference;
    if (urlView && (urlView === "chats" || urlView === "folders")) {
      // Update localStorage to match URL
      localStorage.setItem(VIEW_PREFERENCE_KEY, urlView);
    } else {
      // If no URL param, check localStorage and update URL if needed
      const storedView = localStorage.getItem(
        VIEW_PREFERENCE_KEY,
      ) as ViewPreference;
      if (storedView && (storedView === "chats" || storedView === "folders")) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("view", storedView);
        router.push(`?${params.toString()}`);
      }
    }
  }, [searchParams, router]);

  // Update the view preference, localStorage, and URL
  const updateView = (newView: ViewPreference) => {
    setView(newView);
    localStorage.setItem(VIEW_PREFERENCE_KEY, newView);

    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", newView);
    router.push(`?${params.toString()}`);
  };

  return { view, updateView };
}
