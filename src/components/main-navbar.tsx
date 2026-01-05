import React, { FC, useEffect, useState } from "react";
import PropTypes from "prop-types";
import NextLink from "next/link";
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import { Menu as MenuIcon } from "../icons/menu";
import { ColourLogo } from "./logo";
import { useSettings } from "src/hooks/use-settings";
import { Settings } from "src/contexts/settings-context";
import { useAuth } from "src/hooks/use-auth";
import {
  MainNavbarButton,
  MainNavbarButtonPopout,
  MainNavbarPopupLink,
} from "./main-navbar-button";
import Newspaper from "@mui/icons-material/Newspaper";
import Mail from "@mui/icons-material/Mail";
import { User } from "src/icons/user";
import { useRouter } from "next/router";

interface MainNavbarProps {
  onOpenSidebar?: () => void;
}

const getValues = (settings: Settings) => ({
  direction: settings.direction,
  responsiveFontSizes: settings.responsiveFontSizes,
  theme: settings.theme,
});

export const MainNavbar: FC<MainNavbarProps> = (props) => {
  const router = useRouter();
  const { onOpenSidebar } = props;
  const auth = useAuth();
  const { settings, saveSettings } = useSettings();
  const [values, setValues] = useState<Settings>(getValues(settings));

  useEffect(() => {
    setValues(getValues(settings));
  }, [settings]);

  const handleChange = (field: string, value: unknown): void => {
    saveSettings({
      ...values,
      [field]: value,
    });
  };

  function isCurrentPage(matchPath: string): boolean {
    const path = router.asPath;
    return (path.match(matchPath)?.length ?? 0) > 0;
  }

  return (
    <AppBar
      elevation={0}
      sx={{
        backgroundColor: "white",
        borderBottomColor: "divider",
        borderBottomStyle: "solid",
        borderBottomWidth: 0,
        color: "black",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: 64 }}>
          <NextLink
            href="/"
            style={{
              display: "flex",
              justifyItems: "end",
            }}>

            <ColourLogo
              sx={{
                cursor: "grab",
                display: {
                  md: "inline",
                },
              }}
            />

          </NextLink>
          <Box sx={{ flexGrow: 1 }} />

          <IconButton
            color="inherit"
            onClick={onOpenSidebar}
            sx={{
              display: {
                md: "none",
              },
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          <Box
            sx={{
              alignItems: "center",
              display: {
                md: "flex",
                xs: "none",
              },
            }}
          >
            <MainNavbarButton
              text="Home"
              link="/"
              isCurrentPage={isCurrentPage(`/$`)}
            />
            <MainNavbarButton
              text="Why"
              link="/why"
              isCurrentPage={isCurrentPage(`/why`)}
            />
            <MainNavbarButton
              text="Detect"
              link="/detect"
              isCurrentPage={isCurrentPage(`/detect.*`)}
              mouseOver={
                <MainNavbarButtonPopout>
                  <MainNavbarPopupLink link="/detect/livestock">
                    Livestock
                  </MainNavbarPopupLink>
                  <MainNavbarPopupLink link="/detect/environment">
                    Environment
                  </MainNavbarPopupLink>
                </MainNavbarButtonPopout>
              }
            />
            <MainNavbarButton
              text="Predict"
              link="/predict"
              isCurrentPage={isCurrentPage("/predict")}
            />
            <MainNavbarButton
              text="Prevent"
              link="/prevent"
              isCurrentPage={isCurrentPage("/prevent")}
            />
            <MainNavbarButton
              text="Norway"
              link="/norway-map"
              isCurrentPage={isCurrentPage("/norway-map")}
            />
            <MainNavbarButton
              text="About"
              isCurrentPage={isCurrentPage("/(news|contact|opportunities)$")}
              mouseOver={
                <MainNavbarButtonPopout>
                  <MainNavbarPopupLink
                    link="/news"
                    icon={<Newspaper fontSize="small" />}
                  >
                    News
                  </MainNavbarPopupLink>
                  <MainNavbarPopupLink
                    link="/contact"
                    icon={<Mail fontSize="small" />}
                  >
                    Contact
                  </MainNavbarPopupLink>
                  <MainNavbarPopupLink
                    link="/opportunities"
                    icon={<User fontSize="small" />}
                  >
                    Opportunities
                  </MainNavbarPopupLink>
                </MainNavbarButtonPopout>
              }
            />
            <NextLink href="/authentication/login" passHref legacyBehavior>
              <Button
                component="a"
                size="medium"
                sx={{ ml: 10 }}
                variant="contained"
              >
                {auth.isAuthenticated ? "Account" : "Login"}
              </Button>
            </NextLink>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

const DiagnosticsButton = () => (
  <MainNavbarButton
    text="Home"
    mouseOver={
      <MainNavbarButtonPopout>
        <MainNavbarPopupLink link="/diagnostics">Overview</MainNavbarPopupLink>
        <MainNavbarPopupLink link="/eforesee">
          <Typography variant="body1">
            <Box component={"span"} sx={{ fontStyle: "italic" }}>
              e
            </Box>
            Foresee
          </Typography>
        </MainNavbarPopupLink>
      </MainNavbarButtonPopout>
    }
  />
);

MainNavbar.propTypes = {
  onOpenSidebar: PropTypes.func,
};
