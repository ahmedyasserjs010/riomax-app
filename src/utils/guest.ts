import { storage } from './storage';

const GUEST_ID_KEY = 'riomax_guest_id';
let inMemoryGuestId: string | null = null;

export const getGuestId = async (): Promise<string> => {
  if (inMemoryGuestId) return inMemoryGuestId;

  try {
    let guestId = await storage.getItem(GUEST_ID_KEY);
    if (!guestId || !guestId.startsWith('guest_')) {
      const randomPart = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
      guestId = `guest_${Date.now()}_${randomPart}`;
      await storage.setItem(GUEST_ID_KEY, guestId);
    }
    inMemoryGuestId = guestId;
    return guestId;
  } catch (e) {
    if (!inMemoryGuestId) {
      inMemoryGuestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    }
    return inMemoryGuestId;
  }
};

export const clearGuestId = async (): Promise<void> => {
  inMemoryGuestId = null;
  try {
    await storage.deleteItem(GUEST_ID_KEY);
  } catch (e) {}
};

