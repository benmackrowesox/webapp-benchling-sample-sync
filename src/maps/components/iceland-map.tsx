'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Box, Typography, Paper, Slider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { IcelandSite, IcelandMapData } from '../types/site';
import { createCompanyColorIndex, getCompanyColor } from '../data/processing';

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => (
    <Box sx={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', borderRadius: 1 }}>
      <Typography>Loading Iceland map...</Typography>
    </Box>
  ),
});

interface IcelandMapProps {
  height?: number | string;
}

export default function IcelandMap({ height = 500 }: IcelandMapProps) {
  const [mapData, setMapData] = useState<IcelandMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>('All');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [biomassFilter, setBiomassFilter] = useState<number[]>([0, 5000]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/iceland-sites');
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
      if (selectedCompany !== 'All' && site.company !== selectedCompany) return false;
      if (selectedSpecies !== 'All' && !site.species.includes(selectedSpecies)) return false;
      if (selectedType !== 'All' && site.type !== selectedType) return false;
      if (site.maximal_allowed_biomass < biomassFilter[0] || site.maximal_allowed_biomass > biomassFilter[1]) return false;
      return true;
    });
  }, [mapData, selectedCompany, selectedSpecies, selectedType, biomassFilter]);

  const companyColorIndex = useMemo(() => {
    if (!mapData) return new Map<string, number>();
    return createCompanyColorIndex(mapData.filters.companies);
  }, [mapData]);

  const plotData = useMemo(() => {
    if (filteredSites.length === 0) return [];
    return [{
      type: 'scattergeo' as const,
      mode: 'markers' as const,
      lat: filteredSites.map(s => Number(s.latitude)),
      lon: filteredSites.map(s => Number(s.longitude)),
      marker: {
        size: 15,
        color: filteredSites.map(s => getCompanyColor(s.company, companyColorIndex)),
        opacity: 0.85,
        line: { color: 'white', width: 1 },
      },
      text: filteredSites.map(s => s.hover_text || `${s.location} - ${s.company}`),
      hoverinfo: 'text' as const,
    }];
  }, [filteredSites, companyColorIndex]);

  const biomassMarks = useMemo(() => {
    if (!mapData) return [];
    const max = Math.max(...mapData.sites.map(s => s.maximal_allowed_biomass));
    return [
      { value: 0, label: '0' },
      { value: max / 2, label: `${Math.round(max / 2)}t` },
      { value: max, label: `${max}t` },
    ];
  }, [mapData]);

  if (loading) return (
    <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', borderRadius: 1 }}>
      <Typography>Loading Iceland aquaculture data...</Typography>
    </Box>
  );

  if (error) return (
    <Paper sx={{ p: 3, backgroundColor: '#fee', color: '#c00', textAlign: 'center' }}>
      <Typography variant="h6">Error Loading Data</Typography>
      <Typography>{error}</Typography>
    </Paper>
  );

  if (!mapData) return (
    <Paper sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h6">No Data Available</Typography>
    </Paper>
  );

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Paper sx={{ flex: '0 0 250px', p: 2, height: 'fit-content', position: 'sticky', top: 16 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Filter Options</Typography>
        
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Company</InputLabel>
          <Select value={selectedCompany} label="Company" onChange={(e) => setSelectedCompany(e.target.value)}>
            <MenuItem value="All">All Companies</MenuItem>
            {mapData.filters.companies.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Species</InputLabel>
          <Select value={selectedSpecies} label="Species" onChange={(e) => setSelectedSpecies(e.target.value)}>
            <MenuItem value="All">All Species</MenuItem>
            {mapData.filters.species.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Type</InputLabel>
          <Select value={selectedType} label="Type" onChange={(e) => setSelectedType(e.target.value)}>
            <MenuItem value="All">All Types</MenuItem>
            {mapData.filters.types.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </Select>
        </FormControl>

        <Typography variant="body2" sx={{ mb: 1 }}>Max Biomass (tonnes)</Typography>
        <Slider
          value={biomassFilter}
          onChange={(_, v) => setBiomassFilter(v as number[])}
          valueLabelDisplay="auto"
          min={0}
          max={Math.max(...mapData.sites.map(s => s.maximal_allowed_biomass))}
          marks={biomassMarks}
        />

        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            Showing <strong>{filteredSites.length}</strong> of <strong>{mapData.totalCount}</strong> sites
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        {filteredSites.length > 0 ? (
          <Plot
            data={plotData}
            layout={{
              autosize: true,
              geo: {
                scope: 'europe',
                showland: true,
                landcolor: 'rgb(243, 243, 243)',
                showocean: true,
                oceancolor: 'rgb(204, 229, 255)',
                showcoastlines: true,
                coastlinecolor: 'rgb(100, 100, 100)',
                projection: { type: 'mercator' },
                center: { lat: 65, lon: -18 },
              },
              margin: { t: 0, b: 0, l: 0, r: 0 },
              showlegend: true,
              legend: { title: { text: 'Companies' }, orientation: 'v', x: 1.02, y: 1 },
            }}
            useResizeHandler={true}
            style={{ width: '100%', height }}
            config={{ displayModeBar: true, responsive: true }}
          />
        ) : (
          <Paper sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">No sites match your filters</Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}

