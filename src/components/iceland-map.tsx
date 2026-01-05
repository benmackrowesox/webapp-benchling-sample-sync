'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Typography, Paper, Chip } from '@mui/material';
import { IcelandSite, IcelandMapData } from '../types/iceland-site';
import { buildIcelandHoverText, siteProducesSpecies } from '../utils/dataProcessing';

// Dynamically import Leaflet components to avoid SSR issues
import dynamic from 'next/dynamic';
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

interface IcelandMapProps {
  height?: number | string;
}

const ICELAND_COLORS = [
  '#1f77b4', // blue
  '#ff7f0e', // orange
  '#2ca02c', // green
  '#d62728', // red
  '#9467bd', // purple
  '#8c564b', // brown
  '#e377c2', // pink
  '#7f7f7f', // gray
  '#bcbd22', // yellow-green
  '#17becf', // cyan
];

export default function IcelandMap({ height = 600 }: IcelandMapProps) {
  const [mapData, setMapData] = useState<IcelandMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedCompany, setSelectedCompany] = useState<string>('All');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');

  // Fetch Iceland map data
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/iceland-sites');
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

  // Create company color index
  const companyColorIndex = useMemo(() => {
    if (!mapData) return new Map<string, number>();
    const indexMap = new Map<string, number>();
    mapData.filters.companies.forEach((company, index) => {
      indexMap.set(company, index);
    });
    return indexMap;
  }, [mapData]);

  // Get company color
  const getCompanyColor = (company: string): string => {
    const index = companyColorIndex.get(company) ?? 0;
    return ICELAND_COLORS[index % ICELAND_COLORS.length];
  };

  // Filter sites based on selected filters
  const filteredSites = useMemo(() => {
    if (!mapData) return [];
    
    let filtered = mapData.sites;

    if (selectedCompany !== 'All') {
      filtered = filtered.filter(s => s.company === selectedCompany);
    }

    // Use siteProducesSpecies to match sites that contain the selected species
    // This allows filtering sites where a particular species is farmed, regardless of other species
    if (selectedSpecies !== 'All') {
      filtered = filtered.filter(s => siteProducesSpecies(s, selectedSpecies));
    }

    if (selectedType !== 'All') {
      filtered = filtered.filter(s => s.type === selectedType);
    }

    return filtered;
  }, [mapData, selectedCompany, selectedSpecies, selectedType]);

  // Reset filters
  const resetFilters = () => {
    setSelectedCompany('All');
    setSelectedSpecies('All');
    setSelectedType('All');
  };

  // Check if any filters are active
  const hasActiveFilters = selectedCompany !== 'All' || 
                          selectedSpecies !== 'All' || 
                          selectedType !== 'All';

  // Calculate center of filtered data
  const mapCenter = useMemo(() => {
    if (filteredSites.length === 0) {
      return [65.0, -18.0] as [number, number]; // Center of Iceland
    }

    const validSites = filteredSites.filter(s => {
      const lat = typeof s.latitude === 'string' ? parseFloat(s.latitude) : s.latitude;
      const lon = typeof s.longitude === 'string' ? parseFloat(s.longitude) : s.longitude;
      return lat && lon && !isNaN(lat) && !isNaN(lon);
    });
    if (validSites.length === 0) {
      return [65.0, -18.0] as [number, number];
    }

    const avgLat = validSites.reduce((sum, s) => {
      const lat = typeof s.latitude === 'string' ? parseFloat(s.latitude) : s.latitude;
      return sum + (lat || 0);
    }, 0) / validSites.length;
    const avgLon = validSites.reduce((sum, s) => {
      const lon = typeof s.longitude === 'string' ? parseFloat(s.longitude) : s.longitude;
      return sum + (lon || 0);
    }, 0) / validSites.length;

    return [avgLat, avgLon] as [number, number];
  }, [filteredSites]);

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
        <Typography>Loading Iceland aquaculture data...</Typography>
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
          No Iceland aquaculture site data was found.
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
          <Typography variant="h6">Iceland Filters</Typography>
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
          <InputLabel>Type</InputLabel>
          <Select
            value={selectedType}
            label="Type"
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <MenuItem value="All">All Types</MenuItem>
            {mapData.filters.types.map(type => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
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
              zoom={6}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredSites.map((site, index) => {
                const lat = typeof site.latitude === 'string' ? parseFloat(site.latitude) : site.latitude;
                const lon = typeof site.longitude === 'string' ? parseFloat(site.longitude) : site.longitude;
                if (!lat || !lon || isNaN(lat) || isNaN(lon)) return null;
                
                const color = getCompanyColor(site.company);
                const hoverText = site.hover_text || buildIcelandHoverText(site);
                
                return (
                  <CircleMarker
                    key={`${site.id_number || site.location}-${index}`}
                    center={[lat, lon]}
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

