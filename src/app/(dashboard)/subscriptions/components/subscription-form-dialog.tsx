"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import { CustomDatePicker } from "@/components/ui/custom-date-picker";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { addSubscription, updateSubscription } from "../actions";
import type { Subscription } from "@/lib/supabase/types";

const subscriptionSchema = z.object({
  software_name: z.string().min(1, "Required"),
  price: z.string().min(1, "Required").refine((v) => Number(v) > 0, "Must be greater than 0"),
  currency: z
    .string()
    .min(2, "Required")
    .max(3, "Max 3 characters")
    .regex(/^[A-Za-z]+$/, "Only letters are allowed"),
  billing_cycle: z.enum(["monthly", "yearly"]),
  seats: z.string().min(1).refine((v) => Number(v) >= 1, "Min 1"),
  next_renewal_date: z.string(),
  status: z.enum(["active", "cancelled"]),
});

type FormValues = z.infer<typeof subscriptionSchema>;

interface SubscriptionFormDialogProps {
  mode: "add" | "edit";
  subscription?: Subscription;
}

export function SubscriptionFormDialog({
  mode,
  subscription,
}: SubscriptionFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues:
      mode === "edit" && subscription
        ? {
            software_name: subscription.software_name,
            price: String(subscription.price),
            currency: subscription.currency,
            billing_cycle: subscription.billing_cycle,
            seats: String(subscription.seats),
            next_renewal_date: subscription.next_renewal_date,
            status: subscription.status,
          }
        : {
            software_name: "",
            price: "",
            currency: "",
            billing_cycle: "monthly",
            seats: "1",
            next_renewal_date: "",
            status: "active",
          },
  });

  function onSubmit(data: FormValues) {
    const formData = new FormData();
    if (mode === "edit" && subscription) formData.set("id", subscription.id);
    formData.set("software_name", data.software_name);
    formData.set("price", data.price);
    formData.set("currency", data.currency);
    formData.set("billing_cycle", data.billing_cycle);
    formData.set("seats", data.seats);
    const startDate = data.next_renewal_date || new Date().toISOString().split("T")[0];
    formData.set("next_renewal_date", startDate);
    formData.set("status", data.status);

    startTransition(async () => {
      const result =
        mode === "add"
          ? await addSubscription(formData)
          : await updateSubscription(formData);

      if (result.success) {
        toast.success(
          mode === "add" ? "Subscription added" : "Subscription updated"
        );
        setOpen(false);
        reset();
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    });
  }

  const inputClass = (hasError: boolean) =>
    `h-9 w-full rounded-lg border bg-transparent px-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/50 ${
      hasError ? "border-red-500" : "border-white/15"
    }`;


  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger
        render={
          mode === "add" ? (
            <Button className="bg-yellow-400 text-black font-semibold hover:bg-yellow-300">
              <Plus className="size-4" data-icon="inline-start" />
              Add Subscription
            </Button>
          ) : (
            <Button variant="ghost" size="icon-xs" className="text-gray-400 hover:text-yellow-400">
              <Pencil className="size-3.5" />
            </Button>
          )
        }
      />
      <DialogContent className="border border-white/15 bg-black sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-white">
            {mode === "add" ? "Add Subscription" : "Edit Subscription"}
          </DialogTitle>
          <p className="text-sm text-gray-500">
            {mode === "add"
              ? "Add a new subscription to track."
              : "Update subscription details."}
          </p>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mt-2 grid gap-4"
        >
          {/* Software Name */}
          <div className="grid gap-1.5">
            <label htmlFor="software_name" className="text-sm font-medium text-gray-300">
              Software Name <span className="text-yellow-400">*</span>
            </label>
            <input
              id="software_name"
              placeholder="e.g. Slack"
              className={inputClass(!!errors.software_name)}
              {...register("software_name")}
            />
            {errors.software_name && (
              <p className="text-xs text-red-400">{errors.software_name.message}</p>
            )}
          </div>

          {/* Price + Currency */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label htmlFor="price" className="text-sm font-medium text-gray-300">
                Price <span className="text-yellow-400">*</span>
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                placeholder="99.00"
                className={inputClass(!!errors.price)}
                {...register("price")}
              />
              {errors.price && (
                <p className="text-xs text-red-400">{errors.price.message}</p>
              )}
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="currency" className="text-sm font-medium text-gray-300">
                Currency <span className="text-yellow-400">*</span>
              </label>
              <input
                id="currency"
                maxLength={3}
                placeholder="USD"
                className={`${inputClass(!!errors.currency)} uppercase`}
                {...register("currency")}
              />
              {errors.currency && (
                <p className="text-xs text-red-400">{errors.currency.message}</p>
              )}
            </div>
          </div>

          {/* Billing Cycle + Seats */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-gray-300">
                Billing Cycle
              </label>
              <Controller
                name="billing_cycle"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { value: "monthly", label: "Monthly" },
                      { value: "yearly", label: "Yearly" },
                    ]}
                  />
                )}
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="seats" className="text-sm font-medium text-gray-300">
                Seats
              </label>
              <input
                id="seats"
                type="number"
                min="1"
                className={inputClass(false)}
                {...register("seats")}
              />
            </div>
          </div>

          {/* Start Date + Status */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-gray-300">
                Start Date
              </label>
              <Controller
                name="next_renewal_date"
                control={control}
                render={({ field }) => (
                  <CustomDatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Defaults to today"
                  />
                )}
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-gray-300">
                Status
              </label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { value: "active", label: "Active" },
                      { value: "cancelled", label: "Cancelled" },
                    ]}
                  />
                )}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="mt-1 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              className="text-gray-400 hover:text-white"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-yellow-400 font-semibold text-black hover:bg-yellow-300 disabled:opacity-50"
            >
              {isPending
                ? "Saving..."
                : mode === "add"
                  ? "Add Subscription"
                  : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
