import { Client } from '@libsql/client';

export async function generateDoubtID(db: Client): Promise<string> {
  const { rows } = await db.execute("SELECT id FROM doubts");
  const existingDoubtIds = rows.map(row => row.id as string);
  const upperString = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numberString = '0123456789';
  let doubtId = '';

  while (!doubtId || existingDoubtIds.includes(doubtId)) {
    doubtId =
      upperString.charAt(Math.floor(Math.random() * upperString.length)) +
      upperString.charAt(Math.floor(Math.random() * upperString.length)) +
      numberString.charAt(Math.floor(Math.random() * numberString.length)) +
      numberString.charAt(Math.floor(Math.random() * numberString.length)) +
      numberString.charAt(Math.floor(Math.random() * numberString.length));
  }
  return doubtId;
}

export async function addDoubt(
  db: Client,
  doubtId: string,
  author: string,
  description: string,
  messageId: string,
  channelId: string,
  subject: string,
  grade: string,
  image?: string
): Promise<string> {
  const id = doubtId
  const createdAt = Math.floor(Date.now() / 1000);
  await db.execute({
    sql: `
      INSERT INTO doubts (id, author, description, image, created_at, message_id, channel_id, subject, grade, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [id, author, description, image || null, createdAt, messageId, channelId, subject, grade, 'open'],
  });
  return id;
}

export async function editDoubtDescription(db: Client, id: string, newDescription: string): Promise<void> {
  const result = await db.execute({
    sql: `UPDATE doubts SET description = ? WHERE id = ? AND status != 'deleted'`,
    args: [newDescription, id],
  });
  if (result.rowsAffected === 0) throw new Error(`Doubt ${id} not found or already deleted`);
}

export async function deleteDoubt(db: Client, id: string): Promise<void> {
  const result = await db.execute({
    sql: `UPDATE doubts SET status = 'deleted' WHERE id = ? AND status != 'deleted'`,
    args: [id],
  });
  if (result.rowsAffected === 0) throw new Error(`Doubt ${id} not found or already deleted`);
}

export async function markDoubtAsSolved(
  db: Client,
  id: string,
  solvedBy: string,
  solvedMessageId: string,
  solvedChannelId: string,
): Promise<void> {
  const solvedAt = Math.floor(Date.now() / 1000);
  const result = await db.execute({
    sql: `
      UPDATE doubts
      SET status = 'solved', solved_by = ?, solved_at = ?, solved_message_id = ?, solved_channel_id = ?
      WHERE id = ? AND status = 'open'
    `,
    args: [solvedBy, solvedAt, solvedMessageId, solvedChannelId, id],
  });
  if (result.rowsAffected === 0) throw new Error(`Doubt ${id} not found or not open`);
}

export async function lastDoubtAsked(db: Client, userId: string): Promise<number> {
  const { rows } = await db.execute({
    sql: `SELECT created_at FROM doubts WHERE author = ? ORDER BY created_at DESC LIMIT 1`,
    args: [userId],
  });
  if (!rows.length) return 6 * 60 * 60 * 1000;
  const lastTime = (rows[0].created_at as number) * 1000;
  return Date.now() - lastTime;
}

export async function getDoubtById(db: Client, id: string): Promise<any> {
  const { rows } = await db.execute({
    sql: `SELECT * FROM doubts WHERE id = ?`,
    args: [id],
  });
  return rows[0] || null;
}

export async function searchDoubts(
  db: Client,
  subject: string,
  grade: string,
  keyword?: string
): Promise<any[]> {
  const query = keyword
    ? `SELECT * FROM doubts WHERE subject = ? AND grade = ? AND description LIKE ?`
    : `SELECT * FROM doubts WHERE subject = ? AND grade = ?`;
  const { rows } = await db.execute({
    sql: query,
    args: keyword ? [subject, grade, `%${keyword}%`] : [subject, grade],
  });
  return rows;
}

export async function getDoubtsForArchive(db: Client, subject: string, grade: string): Promise<any[]> {
  const { rows } = await db.execute({
    sql: `SELECT * FROM doubts WHERE subject = ? AND grade = ? AND status = 'solved'`,
    args: [subject, grade],
  });
  return rows;
}

export async function checkCooldown(db: Client, userId: string, cooldownMs: number): Promise<boolean> {
  const timeSinceLast = await lastDoubtAsked(db, userId);
  return timeSinceLast < cooldownMs;
}

export async function getUserDoubtCount(db: Client, userId: string): Promise<number> {
  const { rows } = await db.execute({
    sql: `SELECT COUNT(*) as count FROM doubts WHERE author = ?`,
    args: [userId],
  });
  return rows[0].count as number;
}

export async function undoSolveDoubt(db: Client, id: string): Promise<void> {
  const result = await db.execute({
    sql: `
      UPDATE doubts
      SET status = 'open', solved_by = NULL, solved_at = NULL, solved_message_id = NULL
      WHERE id = ? AND status = 'solved'
    `,
    args: [id],
  });
  if (result.rowsAffected === 0) throw new Error(`Doubt ${id} not found or not solved`);
}