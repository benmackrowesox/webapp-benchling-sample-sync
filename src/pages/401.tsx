import { useEffect } from "react";
import type { NextPage } from "next";
import NextLink from "next/link";
import Head from "next/head";
import {
  Box,
  Button,
  Container,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { gtm } from "../lib/client/gtm";

const AuthorizationRequired: NextPage = () => {
  const theme = useTheme();
  const mobileDevice = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  return <>
    <Head>
      <title>Error: Authorization Required | Esox Biologics</title>
    </Head>
    <Box
      component="main"
      sx={{
        alignItems: "center",
        backgroundColor: "background.paper",
        display: "flex",
        flexGrow: 1,
        py: "80px",
      }}
    >
      <Container maxWidth="lg">
        <Typography align="center" variant={mobileDevice ? "h4" : "h1"}>
          401: Authorization required
        </Typography>
        <Typography
          align="center"
          color="textSecondary"
          sx={{ mt: 0.5 }}
          variant="subtitle2"
        >
          Unauthorized.
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 6,
          }}
        >
          <Box
            alt="Under development"
            component="img"
            src={`/static/error/404-error.png`}
            sx={{
              height: "auto",
              maxWidth: "100%",
              width: 400,
            }}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 6,
          }}
        >
          <NextLink href="/dashboard" passHref legacyBehavior>
            <Button component="a" variant="outlined">
              Back to Dashboard
            </Button>
          </NextLink>
        </Box>
      </Container>
    </Box>
  </>;
};

export default AuthorizationRequired;
