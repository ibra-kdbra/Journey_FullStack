// composables/useComments.ts
import { usePocketBase } from "~/services/pocketbase";

export interface Comment {
  id: string;
  doc_path: string;
  content: string;
  author_id: string;
  author_name: string;
  created: string;
  updated: string;
}

export const useComments = () => {
  const pb = usePocketBase();

  const getComments = async (docPath: string) => {
    try {
      const records = await pb
        .collection("doc_comments_tbl")
        .getList<Comment>(1, 50, {
          filter: `doc_path = "${docPath}"`,
          sort: "created",
        });
      return records.items;
    } catch (err: any) {
      if (err.status === 404) {
        console.warn("Table doc_comments_tbl is missing. Returning empty comments.");
        return [];
      }
      console.error(err);
      return [];
    }
  };

  const createComment = async (data: {
    doc_path: string;
    content: string;
    author_id: string;
    author_name: string;
  }) => {
    return await pb.collection("doc_comments_tbl").create<Comment>(data);
  };

  const deleteComment = async (id: string) => {
    return await pb.collection("doc_comments_tbl").delete(id);
  };

  return {
    getComments,
    createComment,
    deleteComment,
  };
};
