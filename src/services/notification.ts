import DB from '@config/database';

export const findUserNotification = async (userId: number) => {
  const notification = await DB.query<Model.Notification[]>(`
    SELECT
      notification_id,
      notification_type,
      notification_title,
      notification_text,
      notification_link,
      created_time
    FROM notification
    WHERE user_id = '${userId}'
    ORDER BY created_time DESC
    LIMIT 20;
  `);
  return notification;
};

export const deleteUserNotification = async (
  notificationId: number,
  userId: number
) => {
  await DB.query<Model.Notification[]>(`
    DELETE FROM notification
    WHERE user_id = '${userId}' AND notification_id = '${notificationId}';
  `);
};

export const deleteAllUserNotification = async (userId: number) => {
  await DB.query<Model.Notification[]>(`
    DELETE FROM notification
    WHERE user_id = '${userId}';
  `);
};
