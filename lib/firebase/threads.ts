'use client';

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';

import { getDb } from './client';
import type { ChatMessage, ChatThread } from '@/lib/types';

/*
  Firestore layout:

    users/{uid}/threads/{threadId}                 — title, pinned, createdAt
    users/{uid}/threads/{threadId}/messages/{id}   — one message per document

  Messages are a subcollection rather than an array on the thread because a
  PentAI thread is unusually fat: five model answers per turn puts a 100-turn
  thread past Firestore's hard 1 MB per-document limit. Separate documents also
  mean appending an answer writes one small doc instead of rewriting the whole
  history on every token.

  Every path is rooted at users/{uid}, which is what the Security Rules key
  ownership off — a user can only ever address their own subtree.
*/

const threadsCol = (uid: string) => collection(getDb(), 'users', uid, 'threads');
const threadDoc = (uid: string, threadId: string) => doc(getDb(), 'users', uid, 'threads', threadId);
const messagesCol = (uid: string, threadId: string) =>
  collection(getDb(), 'users', uid, 'threads', threadId, 'messages');

/**
 * Live subscription to a user's threads (metadata only — no messages).
 * Returns an unsubscribe function.
 */
export function subscribeToThreads(
  uid: string,
  onChange: (threads: Omit<ChatThread, 'messages'>[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(threadsCol(uid), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snap) => {
      const threads = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: typeof data.title === 'string' ? data.title : 'Untitled',
          createdAt:
            typeof data.createdAt === 'number'
              ? data.createdAt
              : (data.createdAt?.toMillis?.() ?? Date.now()),
          pinned: Boolean(data.pinned),
        };
      });

      // Pinned first, then newest — matching the previous local behaviour.
      threads.sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt - a.createdAt);
      onChange(threads);
    },
    (err) => onError?.(err)
  );
}

/** Live subscription to one thread's messages, in send order. */
export function subscribeToMessages(
  uid: string,
  threadId: string,
  onChange: (messages: ChatMessage[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(messagesCol(uid, threadId), orderBy('seq', 'asc'));

  return onSnapshot(
    q,
    (snap) => {
      onChange(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            role: data.role,
            content: typeof data.content === 'string' ? data.content : '',
            modelId: typeof data.modelId === 'string' ? data.modelId : undefined,
            ts: typeof data.ts === 'number' ? data.ts : undefined,
          } as ChatMessage;
        })
      );
    },
    (err) => onError?.(err)
  );
}

export async function createThread(uid: string, threadId: string, title: string) {
  await setDoc(threadDoc(uid, threadId), {
    title,
    pinned: false,
    createdAt: Date.now(),
    updatedAt: serverTimestamp(),
  });
}

export async function renameThread(uid: string, threadId: string, title: string) {
  await updateDoc(threadDoc(uid, threadId), { title, updatedAt: serverTimestamp() });
}

export async function setThreadPinned(uid: string, threadId: string, pinned: boolean) {
  await updateDoc(threadDoc(uid, threadId), { pinned, updatedAt: serverTimestamp() });
}

/**
 * Deletes a thread and its messages. Firestore does not cascade, so the
 * subcollection has to be cleared explicitly or those documents are orphaned
 * and stay billable forever.
 */
export async function deleteThread(uid: string, threadId: string) {
  const msgs = await getDocs(messagesCol(uid, threadId));

  // Batches cap at 500 writes.
  for (let i = 0; i < msgs.docs.length; i += 450) {
    const batch = writeBatch(getDb());
    for (const d of msgs.docs.slice(i, i + 450)) batch.delete(d.ref);
    await batch.commit();
  }

  await deleteDoc(threadDoc(uid, threadId));
}

/**
 * Appends one message. `seq` gives a stable order: several models answer the
 * same turn within the same millisecond, so ordering on `ts` alone shuffles
 * the columns between reloads.
 */
export async function appendMessage(
  uid: string,
  threadId: string,
  message: ChatMessage,
  seq: number
) {
  const ref = doc(messagesCol(uid, threadId));
  await setDoc(ref, {
    role: message.role,
    content: message.content,
    modelId: message.modelId ?? null,
    ts: message.ts ?? Date.now(),
    seq,
  });
  await updateDoc(threadDoc(uid, threadId), { updatedAt: serverTimestamp() }).catch(() => {
    /* thread may have been deleted mid-flight; the message write still stands */
  });
}
