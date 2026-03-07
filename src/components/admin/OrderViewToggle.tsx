"use client";

import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface OrderViewToggleProps {
  currentView: string;
}

export function OrderViewToggle({ currentView }: OrderViewToggleProps) {
  const router = useRouter();
  const pathname = usePathname();

  const setView = (view: "table" | "kanban") => {
    const url = view === "kanban" ? `${pathname}?view=kanban` : pathname;
    router.push(url);
  };

  return (
    <div className="flex items-center border border-gray-200 rounded overflow-hidden text-[12px]">
      <button
        onClick={() => setView("table")}
        className={cn(
          "px-3 py-1.5 transition-colors",
          currentView !== "kanban"
            ? "bg-black text-white"
            : "text-gray-400 hover:text-black"
        )}
      >
        Table
      </button>
      <button
        onClick={() => setView("kanban")}
        className={cn(
          "px-3 py-1.5 transition-colors border-l border-gray-200",
          currentView === "kanban"
            ? "bg-black text-white"
            : "text-gray-400 hover:text-black"
        )}
      >
        Kanban
      </button>
    </div>
  );
}
