import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsView } from "@/components/settings/settings-view";
import { meta } from "@/lib/data";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Business profile, preferences and team access." />
      <SettingsView businessName={meta.businessName} branch={meta.branch} user={meta.user} />
    </>
  );
}
