"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { updateWorkspaceName } from "./update-workspace-action";
import { inviteTeamMember } from "./actions";

export function WorkspaceForm({
  defaultName,
}: {
  defaultName: string;
}) {
  async function handleSave(formData: FormData) {
    const result = await updateWorkspaceName(formData);
    if (result.success) {
      toast.success("Changes Saved Successfully");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form action={handleSave} className="flex gap-3">
      <div className="flex-1">
        <label htmlFor="name" className="sr-only">
          Workspace name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={defaultName}
          placeholder="Workspace name"
          required
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/50"
        />
      </div>
      <button
        type="submit"
        className="rounded-lg bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-yellow-300"
      >
        Save
      </button>
    </form>
  );
}

export function InviteForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleInvite(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await inviteTeamMember(formData);
        if (result.success) {
          toast.success("Invitation sent successfully");
          formRef.current?.reset();
        } else {
          setError(result.error ?? "Something went wrong");
        }
      } catch {
        setError("An unexpected error occurred. Please try again.");
      }
    });
  }

  return (
    <form ref={formRef} action={handleInvite} className="mt-4 space-y-2">
      <div className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="colleague@company.com"
            required
            disabled={isPending}
            onChange={() => setError(null)}
            className={`w-full rounded-lg border bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:ring-1 disabled:cursor-not-allowed disabled:opacity-60 ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                : "border-white/10 focus:border-yellow-400/50 focus:ring-yellow-400/50"
            }`}
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-yellow-400"
        >
          {isPending ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              Inviting...
            </>
          ) : (
            "Invite"
          )}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </form>
  );
}
