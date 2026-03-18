import { useState } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/DataTable";
import { SchemaTable } from "@/components/SchemaTable";
import { Pagination, getStoredPageSize } from "@/components/Pagination";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DataSkeleton, SchemaSkeleton } from "@/components/TableSkeleton";
import { useTableData } from "@/hooks/useTableData";
import { useSchema } from "@/hooks/useSchema";

export function TablePage() {
  const { name = "" } = useParams<{ name: string }>();
  const decodedName = decodeURIComponent(name);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(getStoredPageSize);

  const { data: tableData, isLoading: dataLoading, isError: dataError } = useTableData(
    decodedName,
    page,
    pageSize
  );
  const { data: schema, isLoading: schemaLoading, isError: schemaError } = useSchema(decodedName);

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPage(1);
  }

  return (
    <Tabs defaultValue="data" className="flex h-full flex-col overflow-hidden">
      {/* Single header row: title · tabs · theme toggle */}
      <div className="flex items-center gap-4 border-b px-6 py-2">
        <h1 className="text-base font-semibold">{decodedName}</h1>
        <TabsList className="h-7">
          <TabsTrigger value="data" className="px-3 py-0.5 text-xs">Data</TabsTrigger>
          <TabsTrigger value="schema" className="px-3 py-0.5 text-xs">Schema</TabsTrigger>
        </TabsList>
        <div className="ml-auto">
          <ThemeToggle className="text-muted-foreground hover:bg-accent hover:text-foreground" />
        </div>
      </div>

      <TabsContent value="data" className="flex flex-1 flex-col overflow-hidden m-0">
        {dataLoading && <DataSkeleton />}
        {dataError && (
          <p className="px-6 py-4 text-sm text-destructive">Failed to load data</p>
        )}
        {tableData && (
          <>
            <div className="flex-1 overflow-auto">
              <DataTable data={tableData} />
            </div>
            <Pagination
              page={tableData.page}
              pageSize={tableData.page_size}
              total={tableData.total}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        )}
      </TabsContent>

      <TabsContent value="schema" className="flex-1 overflow-auto m-0">
        {schemaLoading && <SchemaSkeleton />}
        {schemaError && (
          <p className="px-6 py-4 text-sm text-destructive">Failed to load schema</p>
        )}
        {schema && <SchemaTable schema={schema} />}
      </TabsContent>
    </Tabs>
  );
}
