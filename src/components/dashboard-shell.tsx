"use client";

import { useSidebar } from "@/components/sidebar-context";
import { cn } from "@/lib/utils";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col transition-[padding] duration-200 lg:pl-64",
        collapsed && "lg:!pl-16",
      )}
    >
      {children}
    </div>
  );
}
