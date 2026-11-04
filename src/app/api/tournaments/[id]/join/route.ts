import { NextResponse } from 'next/server';
import { INITIAL_TOURNAMENTS, INITIAL_PARTICIPANTS } from '@/lib/seed-data';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteParams) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { user_id, ign, ff_uid, user_balance } = body;

    if (!user_id || !ign || !ff_uid) {
      return NextResponse.json(
        { success: false, error: 'Missing required player credentials (user_id, ign, ff_uid)' },
        { status: 400 }
      );
    }

    const tournament = INITIAL_TOURNAMENTS.find((t) => t.id === id);
    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Tournament not found' },
        { status: 404 }
      );
    }

    if (tournament.status !== 'upcoming') {
      return NextResponse.json(
        { success: false, error: `Tournament status is ${tournament.status}. Registration closed.` },
        { status: 400 }
      );
    }

    if (tournament.current_slots >= tournament.max_slots) {
      return NextResponse.json(
        { success: false, error: 'Tournament is full! No slots remaining.' },
        { status: 400 }
      );
    }

    const alreadyJoined = INITIAL_PARTICIPANTS.some(
      (p) => p.tournament_id === id && p.user_id === user_id
    );
    if (alreadyJoined) {
      return NextResponse.json(
        { success: false, error: 'You are already registered for this tournament' },
        { status: 409 }
      );
    }

    if (Number(user_balance) < tournament.entry_fee) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient balance. Required: ৳${tournament.entry_fee}, Available: ৳${user_balance}`,
        },
        { status: 400 }
      );
    }

    // Allocate next free slot
    const takenSlots = new Set(
      INITIAL_PARTICIPANTS.filter((p) => p.tournament_id === id).map((p) => p.slot_number)
    );
    let assignedSlot = 1;
    while (takenSlots.has(assignedSlot) && assignedSlot <= tournament.max_slots) {
      assignedSlot++;
    }

    return NextResponse.json({
      success: true,
      message: `Registration confirmed! Assigned Slot #${assignedSlot}`,
      slot_number: assignedSlot,
      entry_fee: tournament.entry_fee,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
