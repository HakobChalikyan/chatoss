import { useState, useEffect } from "react";

const VIEW_PREFERENCE_KEY = "view_preference";

export type ViewPreference = "chats" | "folders";

function getInitialView(): ViewPreference {
  // Check localStorage
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
  const [view, setView] = useState<ViewPreference>(() => getInitialView());

  // Update the view preference and localStorage
  const updateView = (newView: ViewPreference) => {
    setView(newView);
    localStorage.setItem(VIEW_PREFERENCE_KEY, newView);
  };

  return { view, updateView };
}
