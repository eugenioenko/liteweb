import { useQuery } from "@tanstack/react-query";
import { fetchTableData } from "@/api/client";

export function useTableData(name: string, page: number, pageSize: number) {
  return useQuery({
    queryKey: ["data", name, page, pageSize],
    queryFn: () => fetchTableData(name, page, pageSize),
    enabled: !!name,
    placeholderData: (prev) => prev,
  });
}
