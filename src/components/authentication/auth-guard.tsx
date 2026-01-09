import type { FC, ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useTypedAuth } from "../../hooks/use-auth";
import { Box, CircularProgress, Typography } from "@mui/material";

interface AuthGuardProps {
  children: ReactNode;
  guardFailedChildren?: ReactNode;
}

export const AdminGuard: FC<AuthGuardProps> = (props) => {
  const { children, guardFailedChildren } = props;
  const { user } = useTypedAuth();

  console.log("[AdminGuard] Checking user:", user?.id);

  // here check the user permissions
  if (!user) {
    console.log("[AdminGuard] No user, returning null");
    return null;
  }
  const canView: boolean = user.isAdmin || false;

  console.log("[AdminGuard] canView:", canView);

  if (!canView) {
    return guardFailedChildren ? <>{guardFailedChildren}</> : null;
  }

  return <>{children}</>;
};

export const ApprovedUserGuard: FC<AuthGuardProps> = (props) => {
  const { children, guardFailedChildren } = props;
  const { user } = useTypedAuth();

  console.log("[ApprovedUserGuard] Checking user:", user?.id);
  console.log("[ApprovedUserGuard] User details:", {
    isApproved: user?.isApproved,
    emailVerified: user?.emailVerified,
  });

  const canView: boolean = (user?.isApproved && user?.emailVerified) || false;
  console.log("[ApprovedUserGuard] canView:", canView);

  if (!canView) {
    console.log("[ApprovedUserGuard] User cannot view");
    if (guardFailedChildren) {
      console.log("[ApprovedUserGuard] Rendering guardFailedChildren");
      return <>{guardFailedChildren}</>;
    }
    // Still return children but with a warning - this is for the sidebar case
    console.log("[ApprovedUserGuard] No guardFailedChildren, rendering children anyway for sidebar");
    return <>{children}</>;
  }

  console.log("[ApprovedUserGuard] User can view, rendering children");
  return <>{children}</>;
};

export const AuthGuard: FC<AuthGuardProps> = (props) => {
  const { children } = props;
  const auth = useTypedAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  console.log("[AuthGuard] Checking auth:", {
    isAuthenticated: auth.isAuthenticated,
    isInitialized: auth.isInitialized,
    user: auth.user?.id,
    isReady: router.isReady,
    checked
  });

  useEffect(
    () => {
      if (!router.isReady) {
        return;
      }

      console.log("[AuthGuard] Auth state:", auth.isAuthenticated);

      if (!auth.isAuthenticated) {
        console.log("[AuthGuard] Not authenticated, setting redirect timeout");
        setTimeout(() => {
          // hack to prevent premature redirect to login page: redirect can occur before auth context updated, so check again after a delay.
          if (!auth.isAuthenticated) {
            console.log("[AuthGuard] Still not authenticated after delay, redirecting to login");
            router
              .push({
                pathname: "/authentication/login",
                query: { returnUrl: router.asPath },
              })
              .catch(console.error);
          } else {
            setChecked(true);
          }
        }, 1000);
      } else {
        setChecked(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.isReady, auth.isAuthenticated]
  );

  if (!checked) {
    console.log("[AuthGuard] Not checked yet, showing loading");
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography>Checking authentication...</Typography>
        <Typography variant="caption" color="textSecondary">
          isAuthenticated: {auth.isAuthenticated ? "true" : "false"}
        </Typography>
      </Box>
    );
  }

  // if got here, it means that the redirect did not occur, and that tells us that the user is
  // authenticated / authorized.

  return <>{children}</>;
};

AuthGuard.propTypes = {
  children: PropTypes.node,
};

export const AdminOrApprovedGuard: FC<AuthGuardProps> = (props) => {
  const { children, guardFailedChildren } = props;
  const { user } = useTypedAuth();

  console.log("[AdminOrApprovedGuard] Checking user:", user?.id);
  console.log("[AdminOrApprovedGuard] User details:", {
    isAdmin: user?.isAdmin,
    isApproved: user?.isApproved,
    emailVerified: user?.emailVerified,
  });

  const isApproved = (user?.isApproved && user?.emailVerified) || false;
  const isAdmin = user?.isAdmin || false;

  const canView: boolean = isAdmin || isApproved;

  console.log("[AdminOrApprovedGuard] canView:", canView, { isApproved, isAdmin });

  if (!canView) {
    console.log("[AdminOrApprovedGuard] User cannot view, returning null");
    if (guardFailedChildren) {
      console.log("[AdminOrApprovedGuard] Rendering guardFailedChildren");
      return <>{guardFailedChildren}</>;
    }
    return null;
  }

  console.log("[AdminOrApprovedGuard] User can view, rendering children");
  return <>{children}</>;
};

AdminOrApprovedGuard.propTypes = {
  children: PropTypes.node,
};
