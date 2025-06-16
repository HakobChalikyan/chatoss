import { Metadata } from "next";
import { Settings } from "@/app/settings/settings";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings and preferences.",
};

export default function SettingsPage() {
  return (
    <Settings/>
  );
}
