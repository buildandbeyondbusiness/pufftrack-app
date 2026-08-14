import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './config';
import type { PuffLog, VapeProfile, AppSettings } from '../types';

/**
 * Subscribe to a user's real-time puff history in Firestore
 */
export const subscribeUserPuffs = (
  uid: string,
  onData: (puffs: PuffLog[]) => void,
  onError?: (err: Error) => void
) => {
  try {
    const puffsRef = collection(db, 'users', uid, 'puffs');
    const q = query(puffsRef, orderBy('timestamp', 'desc'), limit(1000));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: PuffLog[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            timestamp: data.timestamp,
            mood: data.mood,
            note: data.note,
          });
        });
        onData(list);
      },
      (error) => {
        console.warn('Firestore puffs subscribe error', error);
        if (onError) onError(error);
      }
    );
  } catch (e) {
    console.warn('Firestore subscription exception', e);
    return () => {};
  }
};

/**
 * Sync a single puff hit to Firestore
 */
export const syncSavePuff = async (uid: string, puff: PuffLog) => {
  try {
    const puffRef = doc(db, 'users', uid, 'puffs', puff.id);
    await setDoc(puffRef, {
      timestamp: puff.timestamp,
      mood: puff.mood || null,
      note: puff.note || null,
      createdAt: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('Failed to sync puff to Firestore', e);
  }
};

/**
 * Delete a puff hit from Firestore
 */
export const syncDeletePuff = async (uid: string, puffId: string) => {
  try {
    const puffRef = doc(db, 'users', uid, 'puffs', puffId);
    await deleteDoc(puffRef);
  } catch (e) {
    console.warn('Failed to delete puff from Firestore', e);
  }
};

/**
 * Subscribe to user profile & settings in Firestore
 */
export const subscribeUserProfile = (
  uid: string,
  onData: (data: { vapeProfile?: VapeProfile; settings?: AppSettings }) => void
) => {
  try {
    const profileRef = doc(db, 'users', uid, 'profile', 'settings');
    return onSnapshot(profileRef, (snap) => {
      if (snap.exists()) {
        onData(snap.data() as { vapeProfile?: VapeProfile; settings?: AppSettings });
      }
    });
  } catch (e) {
    console.warn('Firestore profile error', e);
    return () => {};
  }
};

/**
 * Save user profile & settings to Firestore
 */
export const syncSaveUserProfile = async (
  uid: string,
  vapeProfile: VapeProfile,
  settings: AppSettings
) => {
  try {
    const profileRef = doc(db, 'users', uid, 'profile', 'settings');
    await setDoc(profileRef, { vapeProfile, settings, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (e) {
    console.warn('Failed to sync user profile to Firestore', e);
  }
};
