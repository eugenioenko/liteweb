import { useQuery } from "@tanstack/react-query";
import { fetchTables } from "@/api/client";

export function useTableList() {
  return useQuery({
    queryKey: ["tables"],
    queryFn: fetchTables,
  });
}
