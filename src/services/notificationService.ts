/**
 * Notification Service — placeholder for future push notification support.
 *
 * To activate:
 *  1. Run: npx expo install expo-notifications
 *  2. Add expo-notifications plugin to app.json
 *  3. Implement the functions below using Expo Notifications API.
 *
 * Docs: https://docs.expo.dev/versions/v56.0.0/sdk/notifications/
 */

export type NotificationSchedule = {
  habitId: string;
  habitName: string;
  time: { hour: number; minute: number };
  days?: number[]; // 0 = Sunday, 1 = Monday, ...
};

/**
 * Request notification permissions.
 * Returns true if granted, false otherwise.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  // TODO: implement with expo-notifications
  console.warn("[NotificationService] Permissions not yet implemented.");
  return false;
}

/**
 * Schedule a daily reminder for a habit.
 */
export async function scheduleHabitReminder(
  _schedule: NotificationSchedule
): Promise<string | null> {
  // TODO: implement with expo-notifications
  console.warn("[NotificationService] Scheduling not yet implemented.");
  return null;
}

/**
 * Cancel a scheduled notification by its identifier.
 */
export async function cancelHabitReminder(
  _notificationId: string
): Promise<void> {
  // TODO: implement with expo-notifications
  console.warn("[NotificationService] Cancellation not yet implemented.");
}

/**
 * Cancel all scheduled notifications.
 */
export async function cancelAllReminders(): Promise<void> {
  // TODO: implement with expo-notifications
  console.warn("[NotificationService] Cancel all not yet implemented.");
}
