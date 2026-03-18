import { Skeleton } from "@/components/ui/skeleton";

// Width pool — indexed by (row * 3 + col) % length for natural variation
const WIDTHS = ["w-16", "w-24", "w-32", "w-20", "w-28", "w-14", "w-36", "w-18"];
const COLS = 6;
const ROWS = 10;

function cellWidth(row: number, col: number) {
  return WIDTHS[(row * 3 + col) % WIDTHS.length];
}

export function DataSkeleton() {
  return (
    <table className="w-full caption-bottom text-sm">
      <thead>
        <tr className="border-b">
          {Array.from({ length: COLS }).map((_, col) => (
            <th key={col} className="h-10 px-3 text-left">
              <Skeleton className={`h-3 ${WIDTHS[(col * 2) % WIDTHS.length]}`} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: ROWS }).map((_, row) => (
          <tr key={row} className="border-b">
            {Array.from({ length: COLS }).map((_, col) => (
              <td key={col}>
                <Skeleton className={`h-3 ${cellWidth(row, col)}`} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function SchemaSkeleton() {
  const colWidths = ["w-8", "w-28", "w-20", "w-16", "w-20", "w-10"];
  return (
    <div className="p-4 space-y-6">
      <section>
        <Skeleton className="h-3 w-16 mb-3" />
        <table className="w-full caption-bottom text-sm">
          <thead>
            <tr className="border-b">
              {colWidths.map((w, i) => (
                <th key={i} className="h-10 px-3 text-left">
                  <Skeleton className={`h-3 ${w}`} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, row) => (
              <tr key={row} className="border-b">
                {colWidths.map((w, col) => (
                  <td key={col}>
                    <Skeleton className={`h-3 ${w}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
