import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { requireIdentity } from "./authHelpers";

export const getTeams = query({
  args: {},
  handler: async (ctx) => {
    const { email } = await requireIdentity(ctx);
    return await ctx.db
      .query("teams")
      .filter((q) => q.eq(q.field("createdBy"), email))
      .collect();
  },
});

export const createTeam = mutation({
  args: {
    teamName: v.string(),
  },
  handler: async (ctx, args) => {
    const { email } = await requireIdentity(ctx);
    return await ctx.db.insert("teams", {
      teamName: args.teamName,
      createdBy: email,
    });
  },
});
