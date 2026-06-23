export type UserRole = "admin" | "member";
export type BillingCycle = "monthly" | "yearly";
export type SubscriptionStatus = "active" | "cancelled";
export type NotificationType = "30_day" | "14_day" | "7_day";
export type ReminderFrequency = "monthly" | "quarterly";

export interface Workspace {
  id: string;
  name: string;
  created_at: string;
}

export interface Profile {
  id: string;
  workspace_id: string;
  role: UserRole;
  email: string;
  full_name: string;
  is_active: boolean;
  signup_conversion_tracked: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  workspace_id: string;
  software_name: string;
  price: number;
  currency: string;
  billing_cycle: BillingCycle;
  seats: number;
  next_renewal_date: string;
  status: SubscriptionStatus;
  is_unused: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationLog {
  id: string;
  subscription_id: string;
  notification_type: NotificationType;
  sent_at: string;
}

export interface WorkspaceInvite {
  id: string;
  workspace_id: string;
  email: string;
  invited_by: string;
  accepted: boolean;
  created_at: string;
}

export interface WorkspaceReminderSettings {
  id: string;
  workspace_id: string;
  enabled: boolean;
  frequency: ReminderFrequency;
  send_day: number;
  recipient_roles: UserRole[];
  last_sent_at: string | null;
  next_send_at: string | null;
  updated_by: string | null;
  updated_at: string;
}

export type BillingPlan = "free" | "pro" | "business";
export type BillingStatus = "active" | "past_due" | "canceled";

export interface WorkspaceBilling {
  id: string;
  workspace_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: BillingPlan;
  status: BillingStatus;
  billing_cycle: BillingCycle | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  updated_at: string;
}

export interface BillingInvoice {
  id: string;
  workspace_id: string;
  stripe_invoice_id: string;
  amount_paid: number;
  currency: string;
  status: string;
  invoice_pdf: string | null;
  paid_at: string | null;
  created_at: string;
}
