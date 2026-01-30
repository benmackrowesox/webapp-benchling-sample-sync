'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Typography, Paper, Chip } from '@mui/material';
import { ChileSite, ChileMapData } from '../types/chile-site';

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

interface ChileMapProps {
  height?: number | string;
}

// Color palette for companies
const COLORS = [
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
  '#393b79', // dark blue
  '#637939', // dark green
  '#8c6d31', // dark goldenrod
  '#843c39', // dark red
  '#7b4173', // dark purple
  '#3182bd', // light blue
  '#e6550d', // light orange
  '#31a354', // light green
  '#756bb1', // light purple
  '#636363', // dark gray
];

export default function ChileMap({ height = 600 }: ChileMapProps) {
  const [mapData, setMapData] = useState<ChileMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedSpecies, setSelectedSpecies] = useState<string>('All');
  const [selectedCompany, setSelectedCompany] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedConcessionType, setSelectedConcessionType] = useState<string>('All');

  // Fetch Chile map data
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/chile-sites');
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
    return COLORS[index % COLORS.length];
  };

  // Get status color (using English status values)
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
        return '#2ca02c'; // green for active
      case 'pending':
        return '#ff7f0e'; // orange for pending
      case 'expired':
        return '#d62728'; // red for expired
      case 'renewal':
        return '#9467bd'; // purple for renewal
      case 'suspended':
        return '#8c564b'; // brown for suspended
      default:
        return '#7f7f7f'; // gray for unknown
    }
  };

  // Filter sites based on selected filters
  const filteredSites = useMemo(() => {
    if (!mapData) return [];
    
    let filtered = mapData.sites;

    if (selectedSpecies !== 'All') {
      filtered = filtered.filter(s => s.species.includes(selectedSpecies));
    }

    if (selectedCompany !== 'All') {
      filtered = filtered.filter(s => s.company === selectedCompany);
    }

    if (selectedStatus !== 'All') {
      filtered = filtered.filter(s => s.status === selectedStatus);
    }

    if (selectedRegion !== 'All') {
      filtered = filtered.filter(s => s.region === selectedRegion);
    }

    if (selectedConcessionType !== 'All') {
      filtered = filtered.filter(s => s.concession_type === selectedConcessionType);
    }

    return filtered;
  }, [mapData, selectedSpecies, selectedCompany, selectedStatus, selectedRegion, selectedConcessionType]);

  // Reset filters
  const resetFilters = () => {
    setSelectedSpecies('All');
    setSelectedCompany('All');
    setSelectedStatus('All');
    setSelectedRegion('All');
    setSelectedConcessionType('All');
  };

  // Check if any filters are active
  const hasActiveFilters = selectedSpecies !== 'All' || 
                          selectedCompany !== 'All' || 
                          selectedStatus !== 'All' ||
                          selectedRegion !== 'All' ||
                          selectedConcessionType !== 'All';

  // Calculate center of filtered data
  const mapCenter = useMemo(() => {
    if (filteredSites.length === 0) {
      return [-39.0, -72.0] as [number, number]; // Center of Chile (Los Lagos region)
    }

    const validSites = filteredSites.filter(s => {
      const lat = s.latitude;
      const lon = s.longitude;
      return lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon);
    });
    
    if (validSites.length === 0) {
      return [-39.0, -72.0] as [number, number];
    }

    const avgLat = validSites.reduce((sum, s) => sum + (s.latitude || 0), 0) / validSites.length;
    const avgLon = validSites.reduce((sum, s) => sum + (s.longitude || 0), 0) / validSites.length;

    return [avgLat, avgLon] as [number, number];
  }, [filteredSites]);

  // Calculate zoom level based on number of sites
  const mapZoom = useMemo(() => {
    if (filteredSites.length === 0) return 6;
    if (filteredSites.length < 10) return 7;
    if (filteredSites.length < 50) return 6;
    return 5;
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
        <Typography>Loading Chile aquaculture data...</Typography>
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
          No Chile aquaculture site data was found.
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
          <Typography variant="h6">Chile Filters</Typography>
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
          <InputLabel>Company (Holder)</InputLabel>
          <Select
            value={selectedCompany}
            label="Company (Holder)"
            onChange={(e) => setSelectedCompany(e.target.value)}
          >
            <MenuItem value="All">All Companies</MenuItem>
            {mapData.filters.companies.map(company => (
              <MenuItem key={company} value={company}>{company}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={selectedStatus}
            label="Status"
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <MenuItem value="All">All Statuses</MenuItem>
            {mapData.filters.statuses.map(status => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Region</InputLabel>
          <Select
            value={selectedRegion}
            label="Region"
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            <MenuItem value="All">All Regions</MenuItem>
            {mapData.filters.regions.map(region => (
              <MenuItem key={region} value={region}>{region}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Concession Type</InputLabel>
          <Select
            value={selectedConcessionType}
            label="Concession Type"
            onChange={(e) => setSelectedConcessionType(e.target.value)}
          >
            <MenuItem value="All">All Types</MenuItem>
            {mapData.filters.concession_types.map(type => (
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
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredSites.map((site, index) => {
                if (site.latitude === undefined || site.longitude === undefined) return null;
                
                const color = site.company ? getCompanyColor(site.company) : getStatusColor(site.status);
                const hoverText = site.hover_text || '';
                
                return (
                  <CircleMarker
                    key={`${site.id}-${index}`}
                    center={[site.latitude, site.longitude]}
                    radius={8}
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

