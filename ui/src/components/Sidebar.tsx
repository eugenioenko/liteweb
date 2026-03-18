import { Link, useParams } from "react-router-dom";
import { Database, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTableList } from "@/hooks/useTableList";
import type { TableObject } from "@/types/api";

const SKELETON_WIDTHS = ["w-24", "w-32", "w-20", "w-28", "w-16", "w-36", "w-22"];

function SidebarSkeleton() {
  return (
    <div className="px-3 pt-2 space-y-1">
      <div className="mb-2 h-2.5 w-12 animate-pulse rounded bg-sidebar-accent" />
      {SKELETON_WIDTHS.map((w, i) => (
        <div key={i} className={`h-6 animate-pulse rounded bg-sidebar-accent ${w}`} />
      ))}
    </div>
  );
}

function SidebarItem({ obj, active }: { obj: TableObject; active: boolean }) {
  return (
    <Link
      to={`/table/${encodeURIComponent(obj.name)}`}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
        active
          ? "bg-sidebar-active text-sidebar-active-foreground font-medium"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <Table2 className="h-3.5 w-3.5 shrink-0 opacity-70" />
      <span className="truncate">{obj.name}</span>
    </Link>
  );
}

export function Sidebar() {
  const { name } = useParams<{ name: string }>();
  const { data: objects, isLoading, isError } = useTableList();

  const tables = objects?.filter((o) => o.type === "table") ?? [];
  const views = objects?.filter((o) => o.type === "view") ?? [];

  return (
    <aside className="flex h-full w-60 flex-col bg-sidebar">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-sidebar-border px-4 py-3">
        <Database className="h-4 w-4 text-sidebar-muted-foreground" />
        <span className="text-sm font-semibold text-sidebar-foreground">liteweb</span>
      </div>

      {/* Table list */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading && <SidebarSkeleton />}
        {isError && (
          <p className="px-3 py-2 text-xs text-destructive">Failed to load tables</p>
        )}

        {tables.length > 0 && (
          <section className="mb-3">
            <p className="mb-1 px-3 text-xs font-medium uppercase tracking-wide text-sidebar-muted-foreground">
              Tables
            </p>
            {tables.map((t) => (
              <SidebarItem key={t.name} obj={t} active={t.name === name} />
            ))}
          </section>
        )}

        {views.length > 0 && (
          <section>
            <p className="mb-1 px-3 text-xs font-medium uppercase tracking-wide text-sidebar-muted-foreground">
              Views
            </p>
            {views.map((v) => (
              <SidebarItem key={v.name} obj={v} active={v.name === name} />
            ))}
          </section>
        )}

        {!isLoading && !isError && objects?.length === 0 && (
          <p className="px-3 py-2 text-xs text-sidebar-muted-foreground">No tables found</p>
        )}
      </div>

    </aside>
  );
}
