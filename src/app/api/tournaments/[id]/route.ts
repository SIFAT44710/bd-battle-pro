import { NextResponse } from 'next/server';
import { INITIAL_TOURNAMENTS } from '@/lib/seed-data';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteParams) {
  const { id } = await context.params;
  const tournament = INITIAL_TOURNAMENTS.find((t) => t.id === id);

  if (!tournament) {
    return NextResponse.json({ success: false, error: 'Tournament not found' }, { status: 404 });
  }

  // Public endpoint: Room ID and Password are NEVER exposed directly in GET detail
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { room_id, room_password, ...safeTournament } = tournament;

  return NextResponse.json({
    success: true,
    data: safeTournament,
  });
}

export async function PATCH(request: Request, context: RouteParams) {
  const { id } = await context.params;
  const body = await request.json();

  return NextResponse.json({
    success: true,
    message: `Tournament ${id} updated (Demo Server)`,
    updates: body,
  });
}
