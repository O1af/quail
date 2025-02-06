"use client";
import Loading from "@/components/Dev/Loading/Loading";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  if (loading) {
    return <Loading />;
  }
  return children;
}
