"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsSchema, type SettingsInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUserSettings } from "@/actions/settings";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const TARGET_PRESETS = [70, 75, 80, 85, 90, 95];

interface SettingsFormProps {
  initialSettings: SettingsInput;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const { setTheme } = useTheme();
  const router = useRouter();

  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialSettings,
  });

  const onSubmit = async (data: SettingsInput) => {
    setLoading(true);
    try {
      const result = await updateUserSettings(data);
      if (result.success) {
        setTheme(data.darkModePreference);
        toast.success("Settings saved");
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to save settings");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label>Target Attendance</Label>
            <div className="flex flex-wrap gap-2">
              {TARGET_PRESETS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={
                    form.watch("targetAttendance") === preset ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => form.setValue("targetAttendance", preset)}
                >
                  {preset}%
                </Button>
              ))}
            </div>
            <Input
              type="number"
              min={1}
              max={100}
              {...form.register("targetAttendance", { valueAsNumber: true })}
              placeholder="Custom target %"
            />
          </div>

          <div className="space-y-2">
            <Label>Theme</Label>
            <Select
              value={form.watch("darkModePreference")}
              onValueChange={(value: "light" | "dark" | "system") =>
                form.setValue("darkModePreference", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
