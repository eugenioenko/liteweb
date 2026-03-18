import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { TableSchema } from "@/types/api";

interface SchemaTableProps {
  schema: TableSchema;
}

export function SchemaTable({ schema }: SchemaTableProps) {
  return (
    <div className="space-y-6 p-4">
      <section>
        <h3 className="mb-2 text-sm font-semibold">Columns</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Nullable</TableHead>
              <TableHead>Default</TableHead>
              <TableHead>PK</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schema.columns.map((col) => (
              <TableRow key={col.cid}>
                <TableCell className="text-muted-foreground">{col.cid}</TableCell>
                <TableCell className="font-mono font-medium">{col.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">
                    {col.type || "—"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {col.notnull ? (
                    <Badge variant="secondary">NOT NULL</Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">nullable</span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {col.default_value ?? "—"}
                </TableCell>
                <TableCell>
                  {col.primary_key > 0 ? (
                    <Badge className="text-xs">PK {col.primary_key}</Badge>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      {schema.indexes.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-semibold">Indexes</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Unique</TableHead>
                <TableHead>Columns</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schema.indexes.map((idx) => (
                <TableRow key={idx.name}>
                  <TableCell className="font-mono text-sm">{idx.name}</TableCell>
                  <TableCell>
                    {idx.unique ? <Badge variant="secondary">UNIQUE</Badge> : null}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{idx.columns.join(", ")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      )}
    </div>
  );
}
