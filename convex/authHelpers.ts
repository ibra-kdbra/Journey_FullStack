import type { MutationCtx, QueryCtx } from "./_generated/server";

type Ctx = QueryCtx | MutationCtx;

/**
 * Returns the verified identity of the caller or throws. The email comes from
 * the validated Kinde ID token and is never client-supplied.
 */
export async function requireIdentity(ctx: Ctx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity || !identity.email) {
    throw new Error("Unauthenticated");
  }
  return { identity, email: identity.email };
}

/**
 * Loads a team by id and checks that the caller owns it (team membership is
 * the creator's email). Returns null when the team does not exist or the
 * caller may not access it, so existence is not leaked.
 */
export async function getOwnedTeam(ctx: Ctx, teamId: string, email: string) {
  const id = ctx.db.normalizeId("teams", teamId);
  if (!id) return null;
  const team = await ctx.db.get(id);
  if (!team || team.createdBy !== email) return null;
  return team;
}

/** Loads a file and checks the caller owns the team it belongs to. */
export async function getAccessibleFile(
  ctx: Ctx,
  fileId: Parameters<Ctx["db"]["get"]>[0],
  email: string
) {
  const file = await ctx.db.get(fileId);
  if (!file) return null;
  const team = await getOwnedTeam(ctx, file.teamId, email);
  return team ? file : null;
}
