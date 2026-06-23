"use client";

import { useState, useTransition } from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { CustomSelect } from "@/components/ui/custom-select";
import { saveReviewReminders } from "./review-reminders-action";

export interface ReviewReminderSettings {
  enabled: boolean;
  frequency: string;
  sendDay: number;
  recipientRoles: string[];
  nextSendAt: string | null;
}

const FREQUENCY_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
];

const DAY_OPTIONS = Array.from({ length: 28 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

const ROLE_OPTIONS = [
  { value: "admin", label: "Admins" },
  { value: "member", label: "Members" },
];

function formatNextSend(date: string | null): string {
  if (!date) return "Not scheduled";
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function ReviewRemindersForm({
  initialSettings,
}: {
  initialSettings: ReviewReminderSettings;
}) {
  const [enabled, setEnabled] = useState(initialSettings.enabled);
  const [frequency, setFrequency] = useState(initialSettings.frequency);
  const [sendDay, setSendDay] = useState(String(initialSettings.sendDay));
  const [roles, setRoles] = useState<string[]>(initialSettings.recipientRoles);
  const [nextSendAt, setNextSendAt] = useState(initialSettings.nextSendAt);
  const [isPending, startTransition] = useTransition();

  function toggleRole(role: string) {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }

  function handleSave() {
    if (enabled && roles.length === 0) {
      toast.error("Select at least one recipient group");
      return;
    }
    startTransition(async () => {
      const result = await saveReviewReminders({
        enabled,
        frequency,
        sendDay: Number(sendDay),
        recipientRoles: roles,
      });
      if (result.success) {
        setNextSendAt(result.nextSendAt);
        toast.success("Review reminder settings saved");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="mt-4 space-y-5">
      {/* Enable toggle */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white">Enable reminders</p>
          <p className="text-xs text-gray-500">
            Turn the recurring review reminder on or off.
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      {/* Frequency + send day */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-400">
            Frequency
          </label>
          <CustomSelect
            value={frequency}
            onChange={setFrequency}
            options={FREQUENCY_OPTIONS}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-400">
            Send on day of month
          </label>
          <CustomSelect
            value={sendDay}
            onChange={setSendDay}
            options={DAY_OPTIONS}
          />
        </div>
      </div>

      {/* Recipient roles */}
      <div>
        <p className="mb-1.5 text-xs font-medium text-gray-400">Send to</p>
        <div className="flex gap-5">
          {ROLE_OPTIONS.map((role) => (
            <label
              key={role.value}
              className="flex cursor-pointer items-center gap-2 text-sm text-gray-300"
            >
              <input
                type="checkbox"
                checked={roles.includes(role.value)}
                onChange={() => toggleRole(role.value)}
                className="size-4 rounded border-white/20 bg-white/5 accent-yellow-400"
              />
              {role.label}
            </label>
          ))}
        </div>
      </div>

      {/* Next reminder (read-only) */}
      <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-2.5">
        <span className="text-xs font-medium text-gray-400">Next reminder</span>
        <span className="text-sm font-medium text-white">
          {enabled ? formatNextSend(nextSendAt) : "Not scheduled"}
        </span>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? (
          <>
            <Loader2Icon className="size-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save"
        )}
      </button>
    </div>
  );
}
