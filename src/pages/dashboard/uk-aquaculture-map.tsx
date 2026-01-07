import type { NextPage } from "next";
import Head from "next/head";
import { Box, Container, Typography, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { AuthGuard } from "../../components/authentication/auth-guard";
import { DashboardLayout } from "../../components/dashboard/dashboard-layout";
import { gtm } from "../../lib/client/gtm";
import { useEffect, useState } from "react";
import AquacultureMapLeaflet from "../../components/aquaculture-map-leaflet";
import IcelandMap from "../../components/iceland-map";
import NorwegianAquacultureMap from "../../components/norwegian-aquaculture-map";
import CanadianAquacultureMap from "../../components/canadian-aquaculture-map";

type MapRegion = 'uk' | 'iceland' | 'norway' | 'canada';

const UKAquacultureMap: NextPage = () => {
  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const [selectedRegion, setSelectedRegion] = useState<MapRegion>('uk');

  const handleRegionChange = (
    _event: React.MouseEvent<HTMLElement>,
    newRegion: MapRegion | null
  ) => {
    if (newRegion !== null) {
      setSelectedRegion(newRegion);
    }
  };

  return (
    <>
      <Head>
        <title>Aquaculture Maps | Esox Biologics</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" gutterBottom>
              Aquaculture Map
            </Typography>
            <ToggleButtonGroup
              value={selectedRegion}
              exclusive
              onChange={handleRegionChange}
              size="small"
            >
              <ToggleButton value="uk">UK</ToggleButton>
              <ToggleButton value="iceland">Iceland</ToggleButton>
              <ToggleButton value="norway">Norway</ToggleButton>
              <ToggleButton value="canada">Canada</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Typography variant="body1" color="text.secondary" paragraph>
            {selectedRegion === 'uk' 
              ? 'Interactive map showing UK aquaculture facilities, fish farms, and related infrastructure across the United Kingdom.'
              : selectedRegion === 'iceland'
                ? 'Interactive map showing Iceland aquaculture facilities, fish farms, and related infrastructure across Iceland.'
                : selectedRegion === 'norway'
                  ? 'Interactive map showing Norwegian aquaculture sites from the supplied Norwegian dataset.'
                  : 'Interactive map showing Canadian aquaculture sites across British Columbia, New Brunswick, Newfoundland, Nova Scotia, and Quebec.'}
          </Typography>
          <Box sx={{ mt: 3 }}>
            {selectedRegion === 'uk' ? (
              <AquacultureMapLeaflet height={700} />
            ) : selectedRegion === 'iceland' ? (
              <IcelandMap height={700} />
            ) : selectedRegion === 'norway' ? (
              <NorwegianAquacultureMap height={700} />
            ) : (
              <CanadianAquacultureMap height={700} />
            )}
          </Box>
        </Container>
      </Box>
    </>
  );
};

UKAquacultureMap.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default UKAquacultureMap;
