import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { useTableList } from "@/hooks/useTableList";

function RedirectToFirstTable() {
  const { data: tables } = useTableList();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/" && tables && tables.length > 0) {
      navigate(`/table/${encodeURIComponent(tables[0].name)}`, { replace: true });
    }
  }, [tables, location.pathname, navigate]);

  return null;
}

export function AppLayout() {
  const { authenticated, authEnabled, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && authEnabled && !authenticated) {
      navigate("/login", { replace: true });
    }
  }, [authenticated, authEnabled, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="lw-spinner" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <RedirectToFirstTable />
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
