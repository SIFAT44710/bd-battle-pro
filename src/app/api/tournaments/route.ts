import { NextResponse } from 'next/server';
import { INITIAL_TOURNAMENTS } from '@/lib/seed-data';

export async function GET() {
  // Public endpoint: ALWAYS strip sensitive room credentials from public listings!
  const publicTournaments = INITIAL_TOURNAMENTS.map(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ room_id, room_password, ...rest }) => rest
  );

  return NextResponse.json({
    success: true,
    data: publicTournaments,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, match_type, map, entry_fee, prize_pool, max_slots, match_time } = body;

    if (!title || !match_type || !map || match_time === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required tournament fields' },
        { status: 400 }
      );
    }

    const newTournament = {
      id: `tourney_${Date.now()}`,
      title,
      game: 'Free Fire',
      match_type,
      map,
      entry_fee: Number(entry_fee) || 0,
      prize_pool: Number(prize_pool) || 0,
      per_kill: Number(body.per_kill) || 0,
      prize_distribution: body.prize_distribution || { first: 0, second: 0, third: 0 },
      max_slots: Number(max_slots) || 48,
      current_slots: 0,
      status: 'upcoming',
      match_time,
      room_id: body.room_id || null,
      room_password: body.room_password || null,
      rules: body.rules || '',
      banner_url: body.banner_url || '',
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Tournament created successfully (Demo Server)',
      data: newTournament,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
