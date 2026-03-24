import { Document } from './types';

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function showNotification(title: string, body: string): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  new Notification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
  });
}

export function checkDeadlineNotifications(
  documents: Document[],
  labels: { sevenDays: string; oneDayBefore: string; todayDeadline: string }
): void {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  documents.forEach((doc) => {
    if (!doc.deadline || doc.status === 'done') return;

    const deadline = new Date(doc.deadline);
    const deadlineDay = new Date(
      deadline.getFullYear(),
      deadline.getMonth(),
      deadline.getDate()
    );
    const diffMs = deadlineDay.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));

    if (diffDays === 7) {
      showNotification(`\ud83d\udcc4 ${doc.title}`, labels.sevenDays);
    } else if (diffDays === 1) {
      showNotification(`\u26a0\ufe0f ${doc.title}`, labels.oneDayBefore);
    } else if (diffDays === 0) {
      showNotification(`\ud83d\udd34 ${doc.title}`, labels.todayDeadline);
    }
  });
}
