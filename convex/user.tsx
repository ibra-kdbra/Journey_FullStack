import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireIdentity } from "./authHelpers";

// Returns only the caller's own user record(s).
export const getUser = query({
  args: {},
  handler: async (ctx) => {
    const { email } = await requireIdentity(ctx);
    return await ctx.db
      .query("user")
      .filter((q) => q.eq(q.field("email"), email))
      .collect();
  },
});

export const createUser = mutation({
  args: {
    name: v.string(),
    image: v.string(),
  },
  handler: async (ctx, args) => {
    const { email } = await requireIdentity(ctx);
    const existing = await ctx.db
      .query("user")
      .filter((q) => q.eq(q.field("email"), email))
      .first();
    if (existing) return existing._id;
    return await ctx.db.insert("user", { ...args, email });
  },
});
