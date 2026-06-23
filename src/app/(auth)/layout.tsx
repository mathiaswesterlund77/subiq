export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a08] px-4 py-10 text-white">
      {children}
    </div>
  );
}
