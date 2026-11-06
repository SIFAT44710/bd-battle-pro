'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDemo } from '@/context/DemoContext';
import TournamentCard from '@/components/tournaments/TournamentCard';
import TournamentFilter from '@/components/tournaments/TournamentFilter';
import JoinModal from '@/components/tournaments/JoinModal';
import { Tournament, TournamentType, TournamentMap, TournamentStatus } from '@/types/tournament';
import { Swords, PlusCircle, Crown } from 'lucide-react';
import Link from 'next/link';

function TournamentsContent() {
  const searchParams = useSearchParams();
  const initialType = (searchParams.get('type') as TournamentType) || 'All';
  const initialFee = searchParams.get('fee');

  const { tournaments, currentUser } = useDemo();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TournamentType | 'All'>(initialType);
  const [selectedMap, setSelectedMap] = useState<TournamentMap | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<TournamentStatus | 'All'>('All');
  const [activeJoinTournament, setActiveJoinTournament] = useState<Tournament | null>(null);

  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      // Free fee filter
      if (initialFee === 'free' && t.entry_fee !== 0) {
        return false;
      }

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
  }, [tournaments, searchQuery, selectedType, selectedMap, selectedStatus, initialFee]);

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
          <div className="flex items-center gap-2 text-[#00A3FF] font-bold text-xs uppercase tracking-wider">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Official BBP Esports Lobby</span>
          </div>
          <h1 className="text-3xl font-black text-white mt-1 flex items-center gap-3">
            <span>Tournaments & Matches</span>
            <span className="text-xs px-2.5 py-1 rounded-md bg-red-950/60 text-[#FF2438] border border-red-500/30 uppercase font-black tracking-widest">
              Live Season
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Browse, filter, and register for Garena Free Fire competitive tournaments across Bangladesh.
          </p>
        </div>

        {currentUser?.role === 'admin' && (
          <Link
            href="/admin/tournaments/new"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-2 self-start sm:self-auto shadow-lg shadow-red-600/30 transition-all"
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
          <div className="p-12 text-center rounded-2xl bg-[#0C101A] border border-[#1E2536] space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#121624] flex items-center justify-center mx-auto text-gray-400">
              <Swords className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No tournaments matched your filters</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Try adjusting your search query, map, or match format filters to see available matches.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-[#151D2F] hover:bg-[#1E2A44] text-gray-200 text-xs font-bold rounded-lg border border-[#1E2536] transition-colors"
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

export default function TournamentsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-400">Loading tournaments...</div>}>
      <TournamentsContent />
    </Suspense>
  );
}
