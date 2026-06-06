import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { SettingsForm } from "@/components/settings/settings-form";
import { ImportExport } from "@/components/settings/import-export";
import { RouteLoading } from "@/components/ui/route-loading";
import { getUserSettingsByUserId } from "@/actions/settings";
import { requireAuth } from "@/lib/session";

async function SettingsContent({ promise }: { promise: ReturnType<typeof getUserSettingsByUserId> }) {
  const settings = await promise;

  return (
    <>
      <SettingsForm
        initialSettings={{
          targetAttendance: settings.targetAttendance,
          darkModePreference: settings.darkModePreference as "light" | "dark" | "system",
        }}
      />
      <ImportExport />
    </>
  );
}

export default async function SettingsPage() {
  const session = await requireAuth();
  const settingsPromise = getUserSettingsByUserId(session.user.id);

  return (
    <>
      <Header title="Settings" />
      <main className="flex-1 space-y-6 p-4 lg:p-8">
        <Suspense fallback={<RouteLoading />}>
          <SettingsContent promise={settingsPromise} />
        </Suspense>
      </main>
    </>
  );
}
