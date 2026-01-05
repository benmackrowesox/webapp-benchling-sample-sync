import { useEffect } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { Box, Button, Card, Container, Typography } from "@mui/material";
import { GuestGuard } from "../../components/authentication/guest-guard";
import { FirebaseLogin } from "../../components/authentication/firebase-login";
import { ColourLogo } from "../../components/logo";
import { useAuth } from "../../hooks/use-auth";
import { gtm } from "../../lib/client/gtm";
import { ArrowLeft } from "src/icons/arrow-left";

type Platform = "Amplify" | "Auth0" | "Firebase" | "JWT";

const Login: NextPage = () => {
  const router = useRouter();
  const { platform }: { platform: Platform } = useAuth();

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  return <>
    <Head>
      <title>Login | Esox Biologics</title>
    </Head>
    <Box
      component="main"
      sx={{
        backgroundColor: "background.default",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          py: {
            xs: "60px",
            md: "120px",
          },
        }}
      >
        <NextLink href="/" passHref legacyBehavior>
          <Button component="a" startIcon={<ArrowLeft fontSize="small" />}>
            Home
          </Button>
        </NextLink>
        <Box
          sx={{
            alignItems: "center",
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "neutral.900" : "neutral.100",
            borderColor: "divider",
            borderRadius: 1,
            borderStyle: "solid",
            borderWidth: 1,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            mt: 2,
            mb: 4,
            p: 2,
            "& > img": {
              height: 32,
              width: "auto",
              flexGrow: 0,
              flexShrink: 0,
            },
          }}
        >
          <Typography color="textSecondary" variant="caption">
            The app authenticates via Firebase
          </Typography>
          <img alt="Auth platform" src={"/static/icons/firebase.svg"} />
        </Box>
        <Card elevation={16} sx={{ p: 4 }}>
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <NextLink href="/" passHref>

              <ColourLogo />

            </NextLink>
            <Typography variant="h4">Log In</Typography>
            <Typography color="textSecondary" sx={{ mt: 2 }} variant="body2">
              Sign in to the internal platform
            </Typography>
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              mt: 3,
            }}
          >
            {platform === "Firebase" && <FirebaseLogin />}
          </Box>
        </Card>
      </Container>
    </Box>
  </>;
};

Login.getLayout = (page) => <GuestGuard>{page}</GuestGuard>;

export default Login;
