import { useState } from "react";
import {
  ActionFunction,
  Form,
  json,
  LoaderFunction,
  useLoaderData,
} from "remix";
import invariant from "tiny-invariant";
import { definitions } from "~/lib/types/supabase";
import { supabase } from "~/utils/supabase";
import ItemListing from "../components/Item/ItemListing";

async function getItem(itemId: string) {
  const { data, error } = await supabase
    .from<definitions["items"]>("items")
    .select("*")
    .eq("item_id", itemId)
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
}

async function getItemKids(parentPath: string) {
  const { data, error } = await supabase
    .rpc<definitions["items"]>("get_item_descendants", {
      parent_path: parentPath,
    })
    .order("path");

  if (error) {
    console.error(error);
    throw error;
  }
  return data;
}

type Item = definitions["items"];
interface ItemWithKids extends Item {
  kids?: number[];
}

interface INormalizedKids {
  [key: number]: ItemWithKids;
}

function transformKids(
  root: definitions["items"],
  kids: definitions["items"][]
) {
  let result: INormalizedKids = {
    [root.item_id]: { ...root, kids: [] },
  };

  for (let i = 0; i < kids.length; i++) {
    const descendant = kids[i];
    const splitId = descendant.path?.split("/");
    const parentId = Number(splitId?.[splitId?.length - 1]);
    if (!result[descendant.item_id]) {
      result[descendant.item_id] = { ...descendant, kids: [] };
    }
    if (parentId) {
      if (!result[parentId].kids) {
        result[parentId].kids = [];
      }
      result[parentId].kids?.push(descendant.item_id);
    }
  }

  return result;
}

interface ILoader {
  kids: INormalizedKids;
  rootId: number;
}

export const loader: LoaderFunction = async ({ params }) => {
  const itemId = params.itemId;
  invariant(typeof itemId === "string", "itemId must be a string");
  const [item, itemKids] = await Promise.all([
    getItem(itemId),
    getItemKids(itemId),
  ]);

  const kids = transformKids(item, itemKids);

  return json<ILoader>({ rootId: item.item_id, kids });
};

export const action: ActionFunction = async ({ params, request }) => {
  const formData = await request.formData();
  const by = formData.get("by");
  const comment = formData.get("comment");
  const itemId = Number(params.itemId);
  const path = formData.get("path");

  invariant(typeof by === "string", "by must be a string");
  invariant(typeof comment === "string", "comment must be a string");
  invariant(typeof path === "string", "path must be a string");

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

  return json({ data });
};

function generatePath(itemId: number, parentPath?: string) {
  if (!parentPath || parentPath.length === 0) {
    return itemId;
  }
  return [itemId, parentPath].join(".");
}

function Kid({ id, kids }: { id: number; kids: INormalizedKids }) {
  const kid = kids[id];
  const kidIds = kid.kids;
  const [hidden, setHidden] = useState(false);

  return (
    <div className="">
      <>
        <li className="my-4">
          <ItemListing
            item={kid}
            hiddenOptions={{ hidden, onChange: setHidden }}
          />
        </li>

        {kidIds && kidIds.length > 0 && (
          <ul className="ml-14" aria-hidden={hidden} hidden={hidden}>
            {kidIds.map((kidId) => (
              <Kid key={kidId} id={kidId} kids={kids} />
            ))}
          </ul>
        )}
      </>
    </div>
  );
}

function Item() {
  const { rootId, kids } = useLoaderData<ILoader>();
  const root = kids[rootId];

  return (
    <div className="max-w-6xl mx-auto w-full p-3">
      <ItemListing item={root} />

      <Form reloadDocument className="mt-4 ml-9" method="post">
        <input type="hidden" name="itemId" value={root.item_id} />
        <input type="hidden" name="by" value="lawrence" />
        <input
          type="hidden"
          name="path"
          value={generatePath(root.item_id, root.path)}
        />
        <textarea
          className="block border border-gray-300 px-2 py-1"
          name="comment"
          aria-label="Comment"
          cols={80}
          rows={4}
        ></textarea>

        <button
          type="submit"
          className="mt-2 font-bold border border-gray-300 rounded-sm text-sm px-2 py-1"
        >
          comment
        </button>
      </Form>

      {root && (
        <ul className="mt-6">
          {root.kids?.map((id) => (
            <Kid key={id} id={id} kids={kids} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default Item;
