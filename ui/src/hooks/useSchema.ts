import { useQuery } from "@tanstack/react-query";
import { fetchSchema } from "@/api/client";

export function useSchema(name: string) {
  return useQuery({
    queryKey: ["schema", name],
    queryFn: () => fetchSchema(name),
    enabled: !!name,
  });
}
