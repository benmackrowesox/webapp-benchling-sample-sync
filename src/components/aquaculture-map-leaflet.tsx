'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Typography, Paper, Chip } from '@mui/material';
import { AquacultureSite, FilterOptions, MapData } from '../types/site';
import { createCompanyColorIndex, getCompanyColor, buildHoverText } from '../utils/dataProcessing';

// Dynamically import Leaflet components to avoid SSR issues
import dynamic from 'next/dynamic';

// Leaflet CSS import - needs to be outside dynamic import
import 'leaflet/dist/leaflet.css';

// Dynamic import of Leaflet components
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

interface AquacultureMapLeafletProps {
  height?: number | string;
}

export default function AquacultureMapLeaflet({ height = 600 }: AquacultureMapLeafletProps) {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpecies, setSelectedSpecies] = useState<string>('All');
  const [selectedCompany, setSelectedCompany] = useState<string>('All');
  const [selectedWatertype, setSelectedWatertype] = useState<string>('All');

  // Fetch map data
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/sites');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
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

  // Filter sites based on selected filters
  const filteredSites = useMemo(() => {
    if (!mapData) return [];
    
    let filtered = mapData.sites;

    if (selectedSpecies !== 'All') {
      filtered = filtered.filter(s => s.species === selectedSpecies);
    }

    if (selectedCompany !== 'All') {
      filtered = filtered.filter(s => s.company === selectedCompany);
    }

    if (selectedWatertype !== 'All') {
      filtered = filtered.filter(s => s.watertype === selectedWatertype);
    }

    return filtered;
  }, [mapData, selectedSpecies, selectedCompany, selectedWatertype]);

  // Create company color index
  const companyColorIndex = useMemo(() => {
    if (!mapData) return new Map<string, number>();
    return createCompanyColorIndex(mapData.filters.companies);
  }, [mapData]);

  // Reset filters
  const resetFilters = () => {
    setSelectedSpecies('All');
    setSelectedCompany('All');
    setSelectedWatertype('All');
  };

  // Check if any filters are active
  const hasActiveFilters = selectedSpecies !== 'All' || 
                          selectedCompany !== 'All' || 
                          selectedWatertype !== 'All';

  // Calculate center of filtered data
  const mapCenter = useMemo(() => {
    if (filteredSites.length === 0) {
      return [57.5, -4.5] as [number, number]; // Center of Scotland
    }

    const validSites = filteredSites.filter(s => s.latitude && s.longitude);
    if (validSites.length === 0) {
      return [57.5, -4.5] as [number, number];
    }

    const avgLat = validSites.reduce((sum, s) => sum + (s.latitude || 0), 0) / validSites.length;
    const avgLon = validSites.reduce((sum, s) => sum + (s.longitude || 0), 0) / validSites.length;

    return [avgLat, avgLon] as [number, number];
  }, [filteredSites]);

  // Create custom icon for markers (using circle marker via CircleMarker component)
  const getMarkerColor = (company: string) => {
    return getCompanyColor(company, companyColorIndex);
  };

  if (loading) {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: 1,
        }}
      >
        <Typography>Loading aquaculture data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Paper
        sx={{
          p: 3,
          backgroundColor: '#fee',
          color: '#c00',
          textAlign: 'center',
        }}
      >
        <Typography variant="h6">Error Loading Data</Typography>
        <Typography>{error}</Typography>
      </Paper>
    );
  }

  if (!mapData || mapData.sites.length === 0) {
    return (
      <Paper
        sx={{
          p: 3,
          textAlign: 'center',
        }}
      >
        <Typography variant="h6">No Data Available</Typography>
        <Typography color="text.secondary">
          No aquaculture site data was found.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      {/* Filters Panel */}
      <Paper
        sx={{
          flex: '0 0 280px',
          p: 2,
          height: 'fit-content',
          position: 'sticky',
          top: 16,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Filter Options</Typography>
          {hasActiveFilters && (
            <Chip
              label="Reset"
              onClick={resetFilters}
              size="small"
              color="primary"
              clickable
            />
          )}
        </Box>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Species</InputLabel>
          <Select
            value={selectedSpecies}
            label="Species"
            onChange={(e) => setSelectedSpecies(e.target.value)}
          >
            <MenuItem value="All">All Species</MenuItem>
            {mapData.filters.species.map(species => (
              <MenuItem key={species} value={species}>{species}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Company</InputLabel>
          <Select
            value={selectedCompany}
            label="Company"
            onChange={(e) => setSelectedCompany(e.target.value)}
          >
            <MenuItem value="All">All Companies</MenuItem>
            {mapData.filters.companies.map(company => (
              <MenuItem key={company} value={company}>{company}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Water Type</InputLabel>
          <Select
            value={selectedWatertype}
            label="Water Type"
            onChange={(e) => setSelectedWatertype(e.target.value)}
          >
            <MenuItem value="All">All Water Types</MenuItem>
            {mapData.filters.watertypes.map(watertype => (
              <MenuItem key={watertype} value={watertype}>{watertype}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            Showing <strong>{filteredSites.length}</strong> of <strong>{mapData.totalCount}</strong> sites
          </Typography>
        </Box>
      </Paper>

      {/* Map */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {filteredSites.length > 0 ? (
          <Box
            sx={{
              height,
              width: '100%',
              borderRadius: 1,
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
            }}
          >
            <MapContainer
              center={mapCenter}
              zoom={7}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredSites.map((site, index) => {
                if (!site.latitude || !site.longitude) return null;
                
                const hoverText = buildHoverText(site);
                const color = getMarkerColor(site.company);
                
                return (
                  <CircleMarker
                    key={`${site.facility_id || site.site_name}-${index}`}
                    center={[site.latitude, site.longitude]}
                    radius={10}
                    pathOptions={{
                      color: color,
                      fillColor: color,
                      fillOpacity: 0.85,
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <div 
                        dangerouslySetInnerHTML={{ __html: hoverText }}
                        style={{ 
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                          fontSize: '14px',
                          lineHeight: '1.5',
                        }}
                      />
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </Box>
        ) : (
          <Paper
            sx={{
              height,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No sites match your filters
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filter criteria
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}

