import { useEffect } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { Box, Container, Divider } from "@mui/material";
import { MainLayout } from "../components/main-layout";
import { gtm } from "../lib/client/gtm";

const PathogenDetection: NextPage = () => {
  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  return (
    <>
      <Head>
        <title>Newsletter Sign-Up | Esox Biologics</title>
      </Head>
      <main>
        <Box
          sx={{
            backgroundColor: "background.paper",
          }}
        >
          <Box
            sx={{
              height: "100vh",
              width: "100%",
              position: "relative",
              backgroundImage: "url(/static/newsletter-background.png)",
              backgroundSize: "cover",
              backgroundPosition: "top left",
            }}
          >
            <Container
              sx={{
                display: "flex",
                alignItems: "center",
                height: "100%",
                pt: 12,
              }}
            >
              <iframe
                width="100%"
                height="100%"
                src="https://b077c2ab.sibforms.com/serve/MUIEALW8rFjes2M6V8ndnoEl2CuojvUBuej0QFh-EY_4i65RZ0_5gzCSLJ1SCU2TeK_FvEl8lc4ZaY1S107zVdDTOIR2xlHMRS-3Ta_nV80RTYSfILHQp7_hJjoNOsXQNfObJFCeloGElxN3i5NAM59f1s-ecZSzXyW-EvKpyebndVZ-bX0urd4V1NPc6kF_ynb_T-h3SbOGwbGk"
                frameBorder="0"
                allowFullScreen
                style={{
                  display: "block",
                  marginLeft: "auto",
                  marginRight: "auto",
                  maxWidth: "100%",
                }}
              ></iframe>
            </Container>
          </Box>
        </Box>
        <Divider />
        {/* <HomeServices /> */}
      </main>
    </>
  );
};

PathogenDetection.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default PathogenDetection;
