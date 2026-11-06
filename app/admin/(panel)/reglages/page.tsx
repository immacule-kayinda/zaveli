import type { Metadata } from "next";

import { saveSettings } from "@/app/admin/order-actions";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Réglages" };
export const instant = false;

type PageProps = { searchParams: Promise<{ enregistre?: string | string[] }> };

export default async function SettingsPage({ searchParams }: PageProps) {
  const [settings, params] = await Promise.all([getSettings(), searchParams]);
  return (
    <section className="max-w-2xl">
      <h1 className="font-display text-4xl text-ink">Réglages</h1>
      <p className="mt-2 text-sm text-muted">Ce qui change sur la boutique sans toucher au code.</p>
      <div className="mt-8">
        <SettingsForm action={saveSettings} settings={settings} saved={Boolean(params.enregistre)} />
      </div>
    </section>
  );
}
