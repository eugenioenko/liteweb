import { useRef, useState } from "react";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { Copy, Check } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { TableData } from "@/types/api";

const TRUNCATE_AT = 80;

// ── Per-cell component — owns the hover timer and copy button ─────────────────
function DataCell({
  value,
  onOpenDialog,
}: {
  value: string | number | null;
  onOpenDialog: (v: string) => void;
}) {
  const [showCopy, setShowCopy] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (value === null) {
    return <Badge variant="secondary" className="font-mono text-xs opacity-60">NULL</Badge>;
  }

  const str = String(value);
  const isLong = str.length > TRUNCATE_AT;
  const display = isLong ? str.slice(0, TRUNCATE_AT) + "…" : str;

  function handleMouseEnter() {
    timerRef.current = setTimeout(() => setShowCopy(true), 500);
  }

  function handleMouseLeave() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setShowCopy(false);
    setCopied(false);
  }

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(str).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div
      className="relative cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onOpenDialog(str)}
    >
      <span className="font-mono text-xs">{display}</span>

      {showCopy && (
        <button
          onClick={handleCopy}
          title="Copy value"
          className="absolute -left-1 -top-1 z-10 flex items-center justify-center rounded border bg-background p-1 shadow-sm transition-colors hover:bg-accent"
        >
          {copied
            ? <Check className="h-4 w-4 text-primary" />
            : <Copy className="h-4 w-4 text-muted-foreground" />
          }
        </button>
      )}
    </div>
  );
}

// ── Cell value dialog ─────────────────────────────────────────────────────────
function CellDialog({
  value,
  onClose,
}: {
  value: string | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (value === null) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <Dialog open={value !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Cell value</DialogTitle>
        </DialogHeader>
        <textarea
          readOnly
          value={value ?? ""}
          className="h-40 w-full resize-y rounded-md border bg-muted px-3 py-2 font-mono text-xs focus:outline-none"
        />
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
          >
            {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={() => { handleCopy(); onClose(); }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
          >
            <Copy className="h-3 w-3" />
            Copy and close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main table component ──────────────────────────────────────────────────────
interface DataTableProps {
  data: TableData;
}

export function DataTable({ data }: DataTableProps) {
  const [dialogValue, setDialogValue] = useState<string | null>(null);

  const columns: ColumnDef<(string | number | null)[]>[] = data.columns.map((col, idx) => ({
    id: col,
    header: col,
    accessorFn: (row) => row[idx],
    cell: ({ getValue }) => (
      <DataCell
        value={getValue() as string | number | null}
        onOpenDialog={setDialogValue}
      />
    ),
  }));

  const table = useReactTable({
    data: data.rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={data.columns.length} className="h-24 text-center text-muted-foreground">
                No rows
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <CellDialog value={dialogValue} onClose={() => setDialogValue(null)} />
    </>
  );
}
