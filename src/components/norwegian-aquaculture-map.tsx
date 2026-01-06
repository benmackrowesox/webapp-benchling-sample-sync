'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Typography, Paper, useMediaQuery, useTheme, IconButton, Drawer, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import dynamic from 'next/dynamic';
import type { NorwegianMapData } from '../maps/types/site';
import { createCompanyColorIndex, getCompanyColor } from '../utils/dataProcessing';
import { buildNorwayHoverText } from '../maps/data/processing';
import { loadNorwegianMapData } from '../utils/norwayAdapter';

import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface Props {
  height?: number | string;
}

export default function NorwegianAquacultureMap({ height = 600 }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [mapData, setMapData] = useState<NorwegianMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpecies, setSelectedSpecies] = useState<string>('All');
  const [selectedCompany, setSelectedCompany] = useState<string>('All');
  const [selectedWatertype, setSelectedWatertype] = useState<string>('All');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await loadNorwegianMapData('/norwegian-sites-2.csv');
        if (!mounted) return;
        setMapData(data);
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || 'Failed to load Norwegian data');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filteredSites = useMemo(() => {
    if (!mapData) return [];
    let filtered = mapData.sites;
    // Use includes() to match species within comma-separated lists (e.g., "Salmon, Trout, Rainbow Trout")
    if (selectedSpecies !== 'All') {
      filtered = filtered.filter(s => s.species && s.species.includes(selectedSpecies));
    }
    if (selectedCompany !== 'All') {
      filtered = filtered.filter(s => s.company && s.company.includes(selectedCompany));
    }
    if (selectedWatertype !== 'All') {
      filtered = filtered.filter(s => s.water_type && s.water_type.includes(selectedWatertype));
    }
    return filtered;
  }, [mapData, selectedSpecies, selectedCompany, selectedWatertype]);

  const companyColorIndex = useMemo(() => {
    if (!mapData) return new Map<string, number>();
    return createCompanyColorIndex(mapData.filters.companies);
  }, [mapData]);

  const mapCenter = useMemo(() => {
    if (!filteredSites || filteredSites.length === 0) return [64.0, 11.0] as [number, number];
    const valid = filteredSites.filter(s => s.latitude && s.longitude);
    if (valid.length === 0) return [64.0, 11.0] as [number, number];
    const lat = valid.reduce((sum, s) => sum + (s.latitude || 0), 0) / valid.length;
    const lon = valid.reduce((sum, s) => sum + (s.longitude || 0), 0) / valid.length;
    return [lat, lon] as [number, number];
  }, [filteredSites]);

  const resetFilters = () => {
    setSelectedSpecies('All');
    setSelectedCompany('All');
    setSelectedWatertype('All');
    if (isMobile) setFilterDrawerOpen(false);
  };

  if (loading) return (
    <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Typography>Loading Norwegian aquaculture data...</Typography>
    </Box>
  );

  if (error) return (
    <Paper sx={{ p: 3, backgroundColor: '#fee', color: '#c00' }}>
      <Typography variant="h6">Error</Typography>
      <Typography>{error}</Typography>
    </Paper>
  );

  if (!mapData) return null;

  // Filter panel content (used in both desktop inline and mobile drawer)
  const filterPanel = (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Norway - Filter Options</Typography>
        {isMobile && (
          <IconButton onClick={() => setFilterDrawerOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Species</InputLabel>
        <Select value={selectedSpecies} label="Species" onChange={(e) => setSelectedSpecies(e.target.value)}>
          <MenuItem value="All">All Species</MenuItem>
          {mapData.filters.species.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </Select>
      </FormControl>

      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Company</InputLabel>
        <Select value={selectedCompany} label="Company" onChange={(e) => setSelectedCompany(e.target.value)}>
          <MenuItem value="All">All Companies</MenuItem>
          {mapData.filters.companies.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </Select>
      </FormControl>

      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Water Type</InputLabel>
        <Select value={selectedWatertype} label="Water Type" onChange={(e) => setSelectedWatertype(e.target.value)}>
          <MenuItem value="All">All Water Types</MenuItem>
          {(mapData.filters.watertypes || []).map((w: string) => <MenuItem key={w} value={w}>{w}</MenuItem>)}
        </Select>
      </FormControl>

      <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary">Showing <strong>{filteredSites.length}</strong> of <strong>{mapData.totalCount}</strong> sites</Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Mobile filter button */}
      {isMobile && (
        <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Button onClick={() => setFilterDrawerOpen(true)} fullWidth variant="outlined" startIcon={<MenuIcon />}>
            Filters
          </Button>
        </Box>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          anchor="bottom"
          open={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          PaperProps={{ sx: { height: '80vh', borderTopLeftRadius: 16, borderTopRightRadius: 16 } }}
        >
          {filterPanel}
        </Drawer>
      )}

      {/* Desktop Layout */}
      {!isMobile && (
        <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
          <Paper sx={{ flex: '0 0 280px', p: 2, height: 'fit-content', position: 'sticky', top: 16 }}>
            {filterPanel}
          </Paper>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            {filteredSites.length > 0 ? (
              <Box sx={{ height: '100%', width: '100%', borderRadius: 1, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
                <MapContainer center={mapCenter} zoom={5} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {filteredSites.map((site, idx) => {
                    if (!site.latitude || !site.longitude) return null;
                    const color = getCompanyColor(site.company, companyColorIndex);
                    return (
                      <CircleMarker
                        key={`${site.site_id || site.site_name}-${idx}`}
                        center={[site.latitude, site.longitude]}
                        radius={8}
                        pathOptions={{ color, fillColor: color, fillOpacity: 0.85, weight: 2 }}
                      >
                        <Popup>
                          <div dangerouslySetInnerHTML={{ __html: buildNorwayHoverText(site) }} />
                        </Popup>
                      </CircleMarker>
                    );
                  })}
                </MapContainer>
              </Box>
            ) : (
              <Paper sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6" color="text.secondary">No sites match your filters</Typography>
              </Paper>
            )}
          </Box>
        </Box>
      )}

      {/* Mobile Map (full width below filter button) */}
      {isMobile && (
        <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
          {filteredSites.length > 0 ? (
            <Box sx={{ height: '100%', width: '100%', borderRadius: 1, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
              <MapContainer center={mapCenter} zoom={5} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {filteredSites.map((site, idx) => {
                  if (!site.latitude || !site.longitude) return null;
                  const color = getCompanyColor(site.company, companyColorIndex);
                  return (
                    <CircleMarker
                      key={`${site.site_id || site.site_name}-${idx}`}
                      center={[site.latitude, site.longitude]}
                      radius={8}
                      pathOptions={{ color, fillColor: color, fillOpacity: 0.85, weight: 2 }}
                    >
                      <Popup>
                        <div dangerouslySetInnerHTML={{ __html: buildNorwayHoverText(site) }} />
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            </Box>
          ) : (
            <Paper sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h6" color="text.secondary">No sites match your filters</Typography>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
}
