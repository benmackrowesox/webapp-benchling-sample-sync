'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Typography, Paper, Chip } from '@mui/material';
import dynamic from 'next/dynamic';
import { MapData } from '../types/site';
import { createCompanyColorIndex, getCompanyColor, buildHoverText } from '../utils/dataProcessing';

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
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpecies, setSelectedSpecies] = useState<string>('All');
  const [selectedCompany, setSelectedCompany] = useState<string>('All');
  const [selectedWatertype, setSelectedWatertype] = useState<string>('All');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/norwegian-sites');
        if (!res.ok) throw new Error('Failed to fetch Norwegian data');
        const data = await res.json();
        setMapData(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredSites = useMemo(() => {
    if (!mapData) return [];
    let filtered = mapData.sites;
    if (selectedSpecies !== 'All') filtered = filtered.filter(s => s.species === selectedSpecies);
    if (selectedCompany !== 'All') filtered = filtered.filter(s => s.company === selectedCompany);
    if (selectedWatertype !== 'All') filtered = filtered.filter(s => s.watertype === selectedWatertype);
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

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Paper sx={{ flex: '0 0 280px', p: 2, height: 'fit-content', position: 'sticky', top: 16 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Norway - Filter Options</Typography>
          <Chip label="Reset" onClick={resetFilters} size="small" clickable />
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
            {mapData.filters.watertypes.map(w => <MenuItem key={w} value={w}>{w}</MenuItem>)}
          </Select>
        </FormControl>

        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">Showing <strong>{filteredSites.length}</strong> of <strong>{mapData.totalCount}</strong> sites</Typography>
        </Box>
      </Paper>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        {filteredSites.length > 0 ? (
          <Box sx={{ height, width: '100%', borderRadius: 1, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
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
                    key={`${site.facility_id || site.site_name}-${idx}`}
                    center={[site.latitude, site.longitude]}
                    radius={8}
                    pathOptions={{ color, fillColor: color, fillOpacity: 0.85, weight: 2 }}
                  >
                    <Popup>
                      <div dangerouslySetInnerHTML={{ __html: buildHoverText(site) }} />
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </Box>
        ) : (
          <Paper sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6" color="text.secondary">No sites match your filters</Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
