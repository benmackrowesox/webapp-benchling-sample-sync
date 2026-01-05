'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { AquacultureSite, MapData } from '../types/site';
import { createCompanyColorIndex, getCompanyColor } from '../data/processing';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';

const DefaultIcon = L.icon({
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface AquacultureMapLeafletProps {
  height?: number | string;
  center?: [number, number];
  zoom?: number;
}

export default function AquacultureMapLeaflet({ 
  height = 600, 
  center = [57.5, -4.5],
  zoom = 6 
}: AquacultureMapLeafletProps) {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedSpecies, setSelectedSpecies] = useState<string>('All');
  const [selectedCompany, setSelectedCompany] = useState<string>('All');
  const [selectedWatertype, setSelectedWatertype] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/sites');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setMapData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredSites = useMemo(() => {
    if (!mapData) return [];
    return mapData.sites.filter(site => {
      if (selectedSpecies !== 'All' && site.species !== selectedSpecies) return false;
      if (selectedCompany !== 'All' && site.company !== selectedCompany) return false;
      if (selectedWatertype !== 'All' && site.watertype !== selectedWatertype) return false;
      if (selectedRegion !== 'All' && site.region !== selectedRegion) return false;
      return true;
    });
  }, [mapData, selectedSpecies, selectedCompany, selectedWatertype, selectedRegion]);

  const companyColorIndex = useMemo(() => {
    if (!mapData) return new Map<string, number>();
    return createCompanyColorIndex(mapData.filters.companies);
  }, [mapData]);

  const resetFilters = () => {
    setSelectedSpecies('All');
    setSelectedCompany('All');
    setSelectedWatertype('All');
    setSelectedRegion('All');
  };

  const hasActiveFilters = selectedSpecies !== 'All' || selectedCompany !== 'All' || 
                          selectedWatertype !== 'All' || selectedRegion !== 'All';

  if (loading) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', borderRadius: 1 }}>
        <Typography>Loading aquaculture data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, backgroundColor: '#fee', color: '#c00', textAlign: 'center' }}>
        <Typography variant="h6">Error Loading Data</Typography>
        <Typography>{error}</Typography>
      </Paper>
    );
  }

  if (!mapData || mapData.sites.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">No Data Available</Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Paper sx={{ flex: '0 0 280px', p: 2, height: 'fit-content', position: 'sticky', top: 16 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Filter Options</Typography>
          {hasActiveFilters && (
            <Chip label="Reset" onClick={resetFilters} size="small" color="primary" clickable />
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
            {mapData.filters.watertypes.map(w => <MenuItem key={w} value={w}>{w}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Region</InputLabel>
          <Select value={selectedRegion} label="Region" onChange={(e) => setSelectedRegion(e.target.value)}>
            <MenuItem value="All">All Regions</MenuItem>
            {mapData.filters.regions.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </Select>
        </FormControl>

        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            Showing <strong>{filteredSites.length}</strong> of <strong>{mapData.totalCount}</strong> sites
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ flex: 1, minWidth: 0, height }}>
        {filteredSites.length > 0 ? (
          <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%', borderRadius: 8 }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredSites.map((site, index) => (
              site.latitude && site.longitude ? (
                <CircleMarker
                  key={index}
                  center={[site.latitude, site.longitude]}
                  radius={8}
                  pathOptions={{
                    color: getCompanyColor(site.company, companyColorIndex),
                    fillColor: getCompanyColor(site.company, companyColorIndex),
                    fillOpacity: 0.85,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div dangerouslySetInnerHTML={{ __html: site.hover_text || '' }} />
                  </Popup>
                </CircleMarker>
              ) : null
            ))}
          </MapContainer>
        ) : (
          <Paper sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">No sites match your filters</Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}

