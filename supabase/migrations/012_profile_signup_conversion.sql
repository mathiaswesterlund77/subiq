-- Track whether the Google Ads "signup" conversion has already fired for this profile.
-- Used to fire window.gtag('event','conversion', …) exactly once — on the user's first
-- dashboard load after signing up — and never again on subsequent logins.
alter table public.profiles
  add column if not exists signup_conversion_tracked boolean not null default false;
