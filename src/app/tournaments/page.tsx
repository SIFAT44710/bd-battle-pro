'use client';

import React, { useState, useMemo } from 'react';
import { useDemo } from '@/context/DemoContext';
import TournamentCard from '@/components/tournaments/TournamentCard';
import TournamentFilter from '@/components/tournaments/TournamentFilter';
import JoinModal from '@/components/tournaments/JoinModal';
import { Tournament, TournamentType, TournamentMap, TournamentStatus } from '@/types/tournament';
import { Swords, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function TournamentsPage() {
  const { tournaments, currentUser } = useDemo();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TournamentType | 'All'>('All');
  const [selectedMap, setSelectedMap] = useState<TournamentMap | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<TournamentStatus | 'All'>('All');
  const [activeJoinTournament, setActiveJoinTournament] = useState<Tournament | null>(null);

  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      // Search
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesMap = t.map.toLowerCase().includes(query);
        const matchesType = t.match_type.toLowerCase().includes(query);
        if (!matchesTitle && !matchesMap && !matchesType) return false;
      }

      // Type
      if (selectedType !== 'All' && t.match_type !== selectedType) {
        return false;
      }

      // Map
      if (selectedMap !== 'All' && t.map !== selectedMap) {
        return false;
      }

      // Status
      if (selectedStatus !== 'All' && t.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [tournaments, searchQuery, selectedType, selectedMap, selectedStatus]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('All');
    setSelectedMap('All');
    setSelectedStatus('All');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Swords className="w-4 h-4" />
            <span>Official Esports Lobby</span>
          </div>
          <h1 className="text-3xl font-black text-white mt-1">Tournaments & Matches</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Browse, filter, and register for Garena Free Fire competitive tournaments in Bangladesh.
          </p>
        </div>

        {currentUser?.role === 'admin' && (
          <Link
            href="/admin/tournaments/new"
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 self-start sm:self-auto shadow-lg shadow-emerald-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Tournament</span>
          </Link>
        )}
      </div>

      {/* Filter Component */}
      <TournamentFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedMap={selectedMap}
        onMapChange={setSelectedMap}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onReset={handleResetFilters}
      />

      {/* Results Count & Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>
            Showing <strong className="text-white">{filteredTournaments.length}</strong> tournaments
          </span>
        </div>

        {filteredTournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                onJoinClick={(t) => setActiveJoinTournament(t)}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-gray-800 space-y-3">
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mx-auto text-gray-400">
              <Swords className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No tournaments matched your filters</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Try adjusting your search query, map, or match format filters to see available matches.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold rounded-lg border border-gray-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Join Modal */}
      {activeJoinTournament && (
        <JoinModal
          tournament={activeJoinTournament}
          onClose={() => setActiveJoinTournament(null)}
        />
      )}
    </div>
  );
}
