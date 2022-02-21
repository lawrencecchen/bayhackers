import invariant from "tiny-invariant";
import { definitions } from "~/lib/types/supabase";
import { supabase } from "~/utils/supabase/supabase.server";
import { pathToItemId } from "../components/Item/pathUtils";

export async function getItem(itemId: number) {
  const { data, error } = await supabase
    .from<definitions["items"]>("items")
    .select("*")
    .eq("item_id", itemId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("item doesn't exist.");
  }

  return data;
}

export async function getItemKids(parentPath: number) {
  const { data, error } = await supabase
    .rpc<definitions["items"]>("get_item_descendants", {
      ltree_query: parentPath,
    })
    .order("path");

  if (error) {
    console.error(error);
    throw error;
  }
  return data;
}

export async function createItem(request: Request) {
  const formData = await request.formData();
  const by = formData.get("by");
  const comment = formData.get("comment");
  const path = formData.get("path");

  invariant(typeof by === "string", "by must be a string");
  invariant(typeof comment === "string", "comment must be a string");
  invariant(typeof path === "string", "path must be a string");

  const itemId = pathToItemId(path);

  if (!itemId) {
    throw new Error("itemId is required");
  }

  const type = "comment";

  const { data, error } = await supabase
    .from<definitions["items"]>("items")
    .insert({
      type,
      by,
      text: comment,
      parent_id: itemId,
      path,
    })
    .single();

  if (error) {
    console.error(error);
    throw new Error("Failed to comment.");
  }

  return data;
}
