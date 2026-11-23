import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import db from '$lib/server/database';
import { UsersTeams } from '$models/team';

type TeamRole = 'admin' | 'member';

/**
 * Ensures the caller is signed in and is a member of the team (and, when
 * `role: 'admin'` is requested, an admin of it). Throws 401/403 otherwise.
 * Returns the caller's membership row.
 */
export async function requireTeamMember(
  user: { id: number } | null | undefined,
  teamId: number,
  role: TeamRole = 'member'
) {
  if (!user) error(401, 'Unauthorized');

  const membership = await db.query.UsersTeams.findFirst({
    where: and(eq(UsersTeams.teamId, teamId), eq(UsersTeams.userId, user.id))
  });

  if (!membership) error(403, 'Forbidden');
  if (role === 'admin' && membership.role !== 'admin') error(403, 'Forbidden');

  return membership;
}
