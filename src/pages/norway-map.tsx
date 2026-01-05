import React from 'react';
import NorwegianAquacultureMap from '../components/norwegian-aquaculture-map';
import { Box, Container, Typography } from '@mui/material';

export default function NorwayMapPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Norwegian Aquaculture Sites</Typography>
      <Box>
        <NorwegianAquacultureMap height={700} />
      </Box>
    </Container>
  );
}
