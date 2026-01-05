import { useEffect } from "react";
import type { FC } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Divider,
  Drawer,
  Link,
  useMediaQuery,
} from "@mui/material";
import type { Theme } from "@mui/material";
import { styled } from "@mui/material/styles";

interface MainSidebarProps {
  onClose?: () => void;
  open?: boolean;
}

const MainSidebarLink = styled(Link)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  display: "block",
  padding: theme.spacing(1.5),
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

export const MainSidebar: FC<MainSidebarProps> = (props) => {
  const { onClose, open } = props;
  const router = useRouter();
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));

  const handlePathChange = () => {
    if (open) {
      onClose?.();
    }
  };

  useEffect(
    handlePathChange,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.asPath]
  );

  return (
    <Drawer
      anchor="right"
      onClose={onClose}
      open={!mdUp && open}
      PaperProps={{ sx: { width: 256 } }}
      sx={{
        zIndex: (theme) => theme.zIndex.appBar + 100,
      }}
      variant="temporary"
    >
      <Box sx={{ p: 2 }}>
        <Divider />
        <NextLink href="/" passHref legacyBehavior>
          <MainSidebarLink
            color="textSecondary"
            underline="none"
            variant="subtitle2"
          >
            Home
          </MainSidebarLink>
        </NextLink>
        <Divider />
        <NextLink href="/why" passHref legacyBehavior>
          <MainSidebarLink
            color="textSecondary"
            underline="none"
            variant="subtitle2"
          >
            Why
          </MainSidebarLink>
        </NextLink>
        <Divider />
        <NextLink href="/detect" passHref legacyBehavior>
          <MainSidebarLink
            color="textSecondary"
            underline="none"
            variant="subtitle2"
          >
            Detect
          </MainSidebarLink>
        </NextLink>

        <NextLink href="/detect/livestock" passHref legacyBehavior>
          <MainSidebarLink
            color="textSecondary"
            underline="none"
            variant="subtitle2"
          >
            &emsp;Detect - Livestock
          </MainSidebarLink>
        </NextLink>
        <NextLink href="/detect/environment" passHref legacyBehavior>
          <MainSidebarLink
            color="textSecondary"
            underline="none"
            variant="subtitle2"
          >
            &emsp;Detect - Environment
          </MainSidebarLink>
        </NextLink>
        <Divider />
        <NextLink href="/predict" passHref legacyBehavior>
          <MainSidebarLink
            color="textSecondary"
            underline="none"
            variant="subtitle2"
          >
            Predict
          </MainSidebarLink>
        </NextLink>
        <Divider />
        <NextLink href="/prevent" passHref legacyBehavior>
          <MainSidebarLink
            color="textSecondary"
            underline="none"
            variant="subtitle2"
          >
            Prevent
          </MainSidebarLink>
        </NextLink>
        <Divider />
        <NextLink href="/news" passHref legacyBehavior>
          <MainSidebarLink
            color="textSecondary"
            underline="none"
            variant="subtitle2"
          >
            News
          </MainSidebarLink>
        </NextLink>
        <NextLink href="/contact" passHref legacyBehavior>
          <MainSidebarLink
            color="textSecondary"
            underline="none"
            variant="subtitle2"
          >
            Contact
          </MainSidebarLink>
        </NextLink>
        <NextLink href="/opportunities" passHref legacyBehavior>
          <MainSidebarLink
            color="textSecondary"
            underline="none"
            variant="subtitle2"
          >
            Opportunities
          </MainSidebarLink>
        </NextLink>
        <Divider />
        <NextLink href="/authentication/login" passHref legacyBehavior>
          <Button component="a" fullWidth sx={{ mt: 1.5 }} variant="contained">
            Login
          </Button>
        </NextLink>
      </Box>
    </Drawer>
  );
};

MainSidebar.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
