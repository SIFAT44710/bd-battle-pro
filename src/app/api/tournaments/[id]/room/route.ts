import { NextResponse } from 'next/server';
import { INITIAL_TOURNAMENTS, INITIAL_PARTICIPANTS } from '@/lib/seed-data';
import { isWithinRoomReleaseWindow, getMinutesUntilStart } from '@/lib/utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteParams) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const role = searchParams.get('role');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    const tournament = INITIAL_TOURNAMENTS.find((t) => t.id === id);
    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Tournament not found' },
        { status: 404 }
      );
    }

    const isAdmin = role === 'admin';
    const isParticipant = INITIAL_PARTICIPANTS.some(
      (p) => p.tournament_id === id && p.user_id === userId
    );

    if (!isAdmin && !isParticipant) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: Only registered players and admins can access room credentials',
        },
        { status: 403 }
      );
    }

    const isWindowOpen = isWithinRoomReleaseWindow(tournament.match_time);
    const minutesLeft = getMinutesUntilStart(tournament.match_time);

    if (!isAdmin && !isWindowOpen) {
      return NextResponse.json(
        {
          success: false,
          is_unlocked: false,
          error: 'Room credentials remain locked until 15 minutes before match start.',
          minutes_until_start: minutesLeft,
          match_time: tournament.match_time,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      is_unlocked: true,
      room_id: tournament.room_id || 'Not Set Yet by Organizer',
      room_password: tournament.room_password || 'Not Set Yet',
      match_time: tournament.match_time,
      minutes_until_start: minutesLeft,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
