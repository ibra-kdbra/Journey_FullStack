import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  getAccessibleFile,
  getOwnedTeam,
  requireIdentity,
} from "./authHelpers";

export const createNewFile = mutation({
  args: {
    fileName: v.string(),
    teamId: v.string(),
    archieved: v.boolean(),
    document: v.string(),
    whiteboard: v.string(),
  },
  handler: async (ctx, args) => {
    const { email } = await requireIdentity(ctx);
    const team = await getOwnedTeam(ctx, args.teamId, email);
    if (!team) throw new Error("Forbidden");
    return await ctx.db.insert("files", {
      ...args,
      teamId: team._id,
      createdBy: email,
    });
  },
});

export const getFiles = query({
  args: {
    teamId: v.string(),
  },
  handler: async (ctx, args) => {
    const { email } = await requireIdentity(ctx);
    const team = await getOwnedTeam(ctx, args.teamId, email);
    if (!team) throw new Error("Forbidden");
    return await ctx.db
      .query("files")
      .filter((q) => q.eq(q.field("teamId"), team._id))
      .order("desc")
      .collect();
  },
});

export const updateDocument = mutation({
  args: {
    _id: v.id("files"),
    document: v.string(),
  },
  handler: async (ctx, args) => {
    const { email } = await requireIdentity(ctx);
    const file = await getAccessibleFile(ctx, args._id, email);
    if (!file) throw new Error("Forbidden");
    return await ctx.db.patch(args._id, { document: args.document });
  },
});

export const updateWhiteboard = mutation({
  args: {
    _id: v.id("files"),
    whiteboard: v.string(),
  },
  handler: async (ctx, args) => {
    const { email } = await requireIdentity(ctx);
    const file = await getAccessibleFile(ctx, args._id, email);
    if (!file) throw new Error("Forbidden");
    return await ctx.db.patch(args._id, { whiteboard: args.whiteboard });
  },
});

export const archiveFile = mutation({
  args: {
    _id: v.id("files"),
  },
  handler: async (ctx, args) => {
    const { email } = await requireIdentity(ctx);
    const file = await getAccessibleFile(ctx, args._id, email);
    if (!file) throw new Error("Forbidden");
    await ctx.db.patch(args._id, { archieved: true });
    return args._id;
  },
});

export const deleteFile = mutation({
  args: {
    _id: v.id("files"),
  },
  handler: async (ctx, args) => {
    const { email } = await requireIdentity(ctx);
    const file = await getAccessibleFile(ctx, args._id, email);
    if (!file) throw new Error("Forbidden");
    await ctx.db.delete(args._id);
    return args._id;
  },
});

export const getFilebyId = query({
  args: {
    _id: v.id("files"),
  },
  handler: async (ctx, args) => {
    const { email } = await requireIdentity(ctx);
    return await getAccessibleFile(ctx, args._id, email);
  },
});
