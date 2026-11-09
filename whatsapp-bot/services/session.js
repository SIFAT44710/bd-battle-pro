/**
 * Player Conversation State Management
 * Keeps track of pending bookings (e.g. player sent a payment screenshot first, then sends squad name)
 */
class SessionManager {
  constructor(ttlMinutes = 15) {
    this.sessions = new Map();
    this.ttlMs = ttlMinutes * 60 * 1000;
  }

  get(phone) {
    const session = this.sessions.get(phone);
    if (!session) return null;
    if (Date.now() - session.updatedAt > this.ttlMs) {
      this.sessions.delete(phone);
      return null;
    }
    return session.data;
  }

  set(phone, data) {
    const existing = this.get(phone) || {};
    this.sessions.set(phone, {
      updatedAt: Date.now(),
      data: { ...existing, ...data }
    });
  }

  clear(phone) {
    this.sessions.delete(phone);
  }
}

export const sessionManager = new SessionManager();
