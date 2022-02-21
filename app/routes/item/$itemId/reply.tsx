import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
  useLoaderData,
} from "remix";
import invariant from "tiny-invariant";
import { definitions } from "~/lib/types/supabase";
import CommentForm from "~/routes/components/Item/CommentForm";
import { pathToItemId } from "~/routes/components/Item/pathUtils";
import { createItem } from "~/routes/crud/items.server";
import { supabase } from "~/utils/supabase/supabase.server";

export const loader: LoaderFunction = async ({ params, request }) => {
  const url = new URL(request.url);
  const parentPath = url.searchParams.get("to");

  invariant(typeof params.itemId === "string", "itemId must be a string");

  const itemId = pathToItemId(parentPath ?? "");
  console.log(parentPath, itemId);

  const { data: item, error } = await supabase
    .from<definitions["items"]>("items")
    .select("*")
    .eq("item_id", itemId)
    .single();

  if (error) {
    throw redirect(`/item/${params.itemId}`);
  }

  return json({ parentPath });
};

export const action: ActionFunction = async ({ request }) => {
  const data = await createItem(request);

  return redirect(`/item/${data.item_id}`);
};

function Reply() {
  const { parentPath } = useLoaderData();

  return (
    <CommentForm parentPath={parentPath} submitLabel="reply" className="mt-2" />
  );
}

export default Reply;
