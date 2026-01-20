import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { useRouter } from "next/router";
import { CircularProgress } from "@mui/material";
import { useAuth } from "../../hooks/use-auth";
import { AuthGuard } from "./auth-guard";

interface AdminGuardProps {
  children: ReactElement;
}

export const AdminGuard = ({ children }: AdminGuardProps) => {
  const router = useRouter();
  const { user, sendRequest } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        router.push("/authentication/login");
        return;
      }

      try {
        const response = await sendRequest("/api/admin/check", "GET");
        setIsAdmin(response?.isAdmin || false);
        
        if (!response?.isAdmin) {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        router.push("/dashboard");
      } finally {
        setChecking(false);
      }
    };

    checkAdminStatus();
  }, [user, router, sendRequest]);

  if (checking) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <AuthGuard>{children}</AuthGuard>;
};

