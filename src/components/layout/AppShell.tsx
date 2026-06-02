import { TopNav } from "@/components/layout/TopNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-shell">
      <TopNav />
      {children}
    </div>
  );
}
