import { useEffect } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { Box, Container, Typography } from "@mui/material";
import { ContactForm } from "../components/contact/contact-form";
import { gtm } from "../lib/client/gtm";
import { MainLayout } from "src/components/main-layout";
import { BookAMeeting } from "src/components/shared/BookAMeeting";
import { calendlyConfig } from "src/public-config";

const Contact: NextPage = () => {
  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  return (
    <>
      <Head>
        <title>Contact | Esox Biologics</title>
      </Head>
      <Box
        component="main"
        sx={{
          display: "grid",
          gridTemplateColumns: {
            lg: "repeat(2, 1fr)",
            xs: "repeat(1, 1fr)",
          },
          flexGrow: 1,
        }}
        id="mainRoot"
      >
        {calendlyConfig.calendlyUrl && (
          <BookAMeeting
            rootElementId={"mainRoot"}
            displayButton={false}
            calendlyUrl={calendlyConfig.calendlyUrl}
          />
        )}
        <Box
          sx={{
            backgroundColor: "background.default",
            py: 8,
          }}
        >
          <Container
            maxWidth="md"
            sx={{
              pl: {
                lg: 15,
              },
            }}
          >
            <Box
              sx={{
                alignItems: "center",
                display: "flex",
                mb: 6,
                mt: 8,
              }}
            >
              <Typography variant="h1">Contact </Typography>
            </Box>
            <Typography sx={{ py: 3 }} variant="body1">
              {`Have a question? We'd love to hear from you. Send us a message
              either directly to our inquiries email below or using the form on
              this page.`}
            </Typography>
            <Typography sx={{ color: "primary.main" }} variant="h6">
              inquiries@esoxbiologics.com
            </Typography>
          </Container>
        </Box>
        <Box
          sx={{
            backgroundColor: "background.paper",
            px: 1,
            py: 15,
          }}
        >
          <Container maxWidth="md">
            <Typography sx={{ pb: 3 }} variant="h6">
              Fill the form below
            </Typography>
            <ContactForm />
          </Container>
        </Box>
      </Box>
    </>
  );
};

Contact.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default Contact;
