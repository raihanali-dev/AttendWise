import { Header } from "@/components/layout/header";
import { SettingsForm } from "@/components/settings/settings-form";
import { ImportExport } from "@/components/settings/import-export";
import { getUserSettings } from "@/actions/settings";

export default async function SettingsPage() {
  const settings = await getUserSettings();

  return (
    <>
      <Header title="Settings" />
      <main className="flex-1 space-y-6 p-4 lg:p-8">
        <SettingsForm
          initialSettings={{
            targetAttendance: settings.targetAttendance,
            darkModePreference: settings.darkModePreference as "light" | "dark" | "system",
          }}
        />
        <ImportExport />
      </main>
    </>
  );
}
