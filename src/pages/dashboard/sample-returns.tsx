import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { Box, Container, Typography, Paper, Divider, Link as MuiLink, Tooltip } from "@mui/material";
import { AuthGuard } from "../../components/authentication/auth-guard";
import { DashboardLayout } from "../../components/dashboard/dashboard-layout";
import { gtm } from "../../lib/client/gtm";
import { useEffect } from "react";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

const DHL_RETURNS_URL = "https://returns.dhlexpresscommerce.com/?id=8e366f748c4547eca9bc8aaf6f995ab9&embed=true";
const ROYAL_MAIL_COLLECTION_URL = "https://send.royalmail.com/collect/youritems";
const ROYAL_MAIL_TRACK_RETURN_URL = "https://www.royalmail.com/track-my-return";

const SampleReturns: NextPage = () => {
  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  return (
    <>
      <Head>
        <title>Sample Returns | Esox Biologics</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom>
            Sample Returns
          </Typography>

          {/* Client Returns - Domestic Section */}
          <Paper sx={{ p: 4, mb: 4, mt: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Domestic Returns
            </Typography>
            <Typography variant="body1" paragraph>
              Our domestic sample returns are managed through Royal Mail's Tracked Return service.
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "text.primary" }}>
                If labels were provided...
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2, display: "block" }}>
                Existing clients are provided with pre-paid Tracked 48 return labels on large letter envelopes along with our sample collection kits. The label should look like this:
              </Typography>
              <Box sx={{ my: 3, position: "relative", width: "100%", maxWidth: 300 }}>
                <Image
                  src="/royal-mail-label-example.png"
                  alt="Royal Mail Tracked 48 Return Label Example"
                  width={300}
                  height={150}
                  style={{ width: "100%", height: "auto", border: "1px solid", borderColor: "divider", borderRadius: 4 }}
                />
              </Box>
              <Typography variant="body1" paragraph sx={{ mt: 3 }}>
                You have three options:
              </Typography>
              <Box component="ul" sx={{ pl: 3, mb: 3 }}>
                <li>
                  <Typography variant="body1">
                    <strong>Option 1 (Hand Over)</strong> - Give the package to Royal Mail personel if you already have regular deliveries / collections
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <strong>Option 2 (Drop Off)</strong> - Take your package to your local post-office
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <strong>Option 3 (Schedule Collection)</strong> - Schedule a collection by{" "}
                    <Tooltip title="Royal Mail collection booking page" arrow>
                      <MuiLink
                        href={ROYAL_MAIL_COLLECTION_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ display: "inline-flex", alignItems: "center" }}
                      >
                        following this link
                        <OpenInNewIcon sx={{ fontSize: 14, ml: 0.5 }} />
                      </MuiLink>
                    </Tooltip>{" "}
                    and entering the tracking number or postage item ID
                  </Typography>
                </li>
              </Box>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "text.primary" }}>
                If labels were NOT provided...
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2, display: "block" }}>
                New clients will need to generate their own return label
              </Typography>
              <Typography variant="body1" paragraph>
                We are registered with Royal Mail allowing you to search for Esox Biologics as an official retailer.
                You can access the Royal Mail return portal here -{" "}
                <Tooltip title="Opens Royal Mail tracking page" arrow>
                  <MuiLink
                    href={ROYAL_MAIL_TRACK_RETURN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ display: "inline-flex", alignItems: "center" }}
                  >
                    https://www.royalmail.com/track-my-return#/details/8806
                    <OpenInNewIcon sx={{ fontSize: 14, ml: 0.5 }} />
                  </MuiLink>
                </Tooltip>
              </Typography>
              <Typography variant="body1" paragraph>
                You will be required to enter mandatory information in order to generate a return label and QR code
              </Typography>
              <Typography variant="body1" paragraph>
                You then have three options:
              </Typography>
              <Box component="ul" sx={{ pl: 3 }}>
                <li>
                  <Typography variant="body1">
                    <strong>Option 1 (Print Label)</strong> - Print and attach label to parcel, book collection using tracking number or postage item ID (as described above)
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <strong>Option 2 (No Label)</strong> - Book collection using selecting "Bring My label option" once label has been generated
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <strong>Option 3 (QR Code)</strong> - Take parcel to either Post Office or Royal Mail Parcel Locker, scan QR code and print label.
                  </Typography>
                </li>
              </Box>
              <Typography variant="body1" sx={{ mt: 2 }}>
                In this case you will need to provide your own shipping box or envelope, ensuring that the sample collection kit fits inside securely.
              </Typography>
            </Box>
          </Paper>

          {/* Client Returns - International Section */}
          <Paper sx={{ p: 4, mb: 4, mt: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              International Returns
            </Typography>
            <Typography variant="body1" paragraph>
            Our international sample returns are managed through DHL Tracked Return service.
              Please <MuiLink href="mailto:ben.mackrow@esoxbiologics.com">contact our operations team</MuiLink> to arrange shipment and obtain the necessary documentation required for customs.
            </Typography>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

SampleReturns.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default SampleReturns;

