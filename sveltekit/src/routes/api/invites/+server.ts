// Utils
import { redirect } from 'sveltekit-flash-message/server';
import { redirect as kitRedirect, type RequestEvent } from '@sveltejs/kit';
import { eq, and, ne } from 'drizzle-orm';
import * as m from '$lib/utils/messages.json';

// Database
import db from '$lib/server/database';
import { Invite } from '$models/invite';
import { UsersTeams } from '$models/team';

async function handleInviteProcessing(event: RequestEvent, teamIdParam: string | null, inviteToken: string | null) {
  if (!event.locals.user) {
    redirect('/login', { type: 'error', message: m.teams.invite.receive.mustLogin }, event);
  }

  if (!inviteToken || !teamIdParam) {
    redirect('/', { type: 'error', message: m.teams.invite.receive.invalidUrl }, event);
  }

  const teamId = parseInt(teamIdParam);

  if (isNaN(teamId)) {
    redirect('/', { type: 'error', message: m.teams.invite.receive.invalidUrl }, event);
  }

  const invite = await db.query.Invite.findFirst({
    where: and(eq(Invite.teamId, teamId), eq(Invite.token, inviteToken))
  });

  if (!invite) {
    redirect('/', { type: 'error', message: m.teams.invite.receive.invalidUrl }, event);
  }

  if (invite.email !== event.locals.user?.email) {
    redirect('/', { type: 'error', message: m.teams.invite.receive.invalidUrl }, event);
  }

  if (invite.status !== 'pending') {
    redirect('/', { type: 'error', message: m.teams.invite.receive.claimed }, event);
  }

  if (invite.expiresAt < Date.now()) {
    await db.update(Invite).set({ status: 'expired' }).where(eq(Invite.id, invite.id));

    redirect('/', { type: 'error', message: m.teams.invite.receive.expiredUrl }, event);
  }

  try {
    const addUserToTeam = await db.insert(UsersTeams).values({
      teamId: invite.teamId,
      userId: event.locals.user?.id,
      role: 'member',
      joinedAt: Date.now()
    });

    if (addUserToTeam) {
      // Mark the current invite as accepted
      await db
        .update(Invite)
        .set({
          status: 'accepted'
        })
        .where(eq(Invite.id, invite.id));

      // Expire any other pending invites for the same team and email
      await db
        .update(Invite)
        .set({
          status: 'expired'
        })
        .where(
          and(
            eq(Invite.teamId, invite.teamId),
            eq(Invite.email, invite.email),
            eq(Invite.status, 'pending'),
            ne(Invite.id, invite.id)
          )
        );
    }
  } catch (error) {
    console.log(error);
    redirect(
      '/',
      {
        status: 500,
        type: 'error',
        message: m.general.error
      },
      event
    );
  }

  redirect(
    '/settings/teams',
    {
      type: 'success',
      message: m.teams.invite.receive.success
    },
    event
  );
}

// GET Request for the link in the invite email. GET must be safe (no state change), so this only sends the
// user to the Teams page, where the pending invite is shown with an Accept button that POSTs.
export async function GET(event: RequestEvent) {
  if (!event.locals.user) {
    redirect('/login', { type: 'error', message: m.teams.invite.receive.mustLogin }, event);
  }

  kitRedirect(303, '/settings/teams');
}

// POST Request for Accepting an Invite using Form Data
export async function POST(event: RequestEvent) {
  const formData = await event.request.formData();
  const teamIdParam = formData.get('teamId') as string | null;
  const inviteToken = formData.get('token') as string | null;
  await handleInviteProcessing(event, teamIdParam, inviteToken);
}
