import type { FC, ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useTypedAuth } from "../../hooks/use-auth";

interface AuthGuardProps {
  children: ReactNode;
  guardFailedChildren?: ReactNode;
}

export const AdminGuard: FC<AuthGuardProps> = (props) => {
  const { children, guardFailedChildren } = props;
  const { user } = useTypedAuth();

  // here check the user permissions
  if (!user) {
    return null;
  }
  const canView: boolean = user.isAdmin || false;

  if (!canView) {
    return guardFailedChildren ? <>{guardFailedChildren}</> : null;
  }

  return <>{children}</>;
};

export const ApprovedUserGuard: FC<AuthGuardProps> = (props) => {
  const { children, guardFailedChildren } = props;
  const { user } = useTypedAuth();

  const canView: boolean = (user?.isApproved && user.emailVerified) || false;

  if (!canView) {
    return guardFailedChildren ? <>{guardFailedChildren}</> : null;
  }

  return <>{children}</>;
};

export const AuthGuard: FC<AuthGuardProps> = (props) => {
  const { children } = props;
  const auth = useTypedAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(
    () => {
      if (!router.isReady) {
        return;
      }

      if (!auth.isAuthenticated) {
        setTimeout(() => {
          // hack to prevent premature redirect to login page: redirect can occur before auth context updated, so check again after a delay.
          if (!auth.isAuthenticated) {
            router
              .push({
                pathname: "/authentication/login",
                query: { returnUrl: router.asPath },
              })
              .catch(console.error);
          }
        }, 1000);
      } else {
        setChecked(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.isReady]
  );

  if (!checked) {
    return null;
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

  const isApproved = (user?.isApproved && user?.emailVerified) || false;
  const isAdmin = user?.isAdmin || false;

  const canView: boolean = isAdmin || isApproved;

  if (!canView) {
    return guardFailedChildren ? <>{guardFailedChildren}</> : null;
  }

  return <>{children}</>;
};

AdminOrApprovedGuard.propTypes = {
  children: PropTypes.node,
};
