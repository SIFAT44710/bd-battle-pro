'use client';

import React from 'react';
import { TournamentType, TournamentMap, TournamentStatus } from '@/types/tournament';
import { Search, X, Filter } from 'lucide-react';

interface TournamentFilterProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedType: TournamentType | 'All';
  onTypeChange: (type: TournamentType | 'All') => void;
  selectedMap: TournamentMap | 'All';
  onMapChange: (map: TournamentMap | 'All') => void;
  selectedStatus: TournamentStatus | 'All';
  onStatusChange: (status: TournamentStatus | 'All') => void;
  onReset: () => void;
}

export default function TournamentFilter({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedMap,
  onMapChange,
  selectedStatus,
  onStatusChange,
  onReset,
}: TournamentFilterProps) {
  const matchTypes: (TournamentType | 'All')[] = ['All', 'Squad', 'Solo', 'Duo', 'Clash Squad'];
  const maps: (TournamentMap | 'All')[] = ['All', 'Bermuda', 'Purgatory', 'Kalahari', 'Alpine', 'Nexterra'];
  const statuses: { label: string; value: TournamentStatus | 'All' }[] = [
    { label: 'All Matches', value: 'All' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Live Now', value: 'live' },
    { label: 'Completed', value: 'completed' },
  ];

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedType !== 'All' ||
    selectedMap !== 'All' ||
    selectedStatus !== 'All';

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#0B0F19] border border-[#1E2536] space-y-4 shadow-xl">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#00A3FF] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search Free Fire tournaments by title, map, or mode..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#07090F] border border-[#1E2536] text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-[#FF2438] transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Match Type Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-gray-400 text-xs font-bold flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-[#FF2438]" />
            Mode:
          </span>
          {matchTypes.map((type) => (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                selectedType === type
                  ? 'bg-gradient-to-r from-[#FF2438] to-[#E01B2E] text-white shadow-md shadow-red-950/60'
                  : 'bg-[#121622] text-gray-400 hover:text-white hover:bg-[#182030] border border-[#1E2536]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-gray-400 text-xs font-bold mr-1">Status:</span>
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => onStatusChange(s.value)}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                selectedStatus === s.value
                  ? 'bg-gradient-to-r from-[#00A3FF] to-blue-600 text-white shadow-md shadow-blue-950/60'
                  : 'bg-[#121622] text-gray-400 hover:text-white hover:bg-[#182030] border border-[#1E2536]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Pills & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1E2536] text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-gray-400 font-bold mr-1">Map:</span>
          {maps.map((map) => (
            <button
              key={map}
              onClick={() => onMapChange(map)}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all ${
                selectedMap === map
                  ? 'bg-[#1E2536] text-[#00A3FF] border border-[#00A3FF]/40'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {map}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-[11px] text-[#FF2438] hover:text-red-400 flex items-center gap-1 font-bold transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );
}
