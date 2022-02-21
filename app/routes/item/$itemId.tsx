import { useState } from "react";
import { ActionFunction, json, LoaderFunction, useLoaderData } from "remix";
import invariant from "tiny-invariant";
import { definitions } from "~/lib/types/supabase";
import CommentForm from "../components/Item/CommentForm";
import { generatePath } from "../components/Item/generatePath";
import ItemListing from "../components/Item/ItemListing";
import { pathToItemId } from "../components/Item/pathUtils";
import { createItem, getItem, getItemKids } from "../crud/items.server";

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
    const parentId = pathToItemId(descendant.path);
    if (!result[descendant.item_id]) {
      result[descendant.item_id] = {
        ...descendant,
        kids: [],
      };
    }
    if (parentId) {
      if (!result[parentId]?.kids) {
        result[parentId] = { ...result[parentId], kids: [] };
      }
      result[parentId]?.kids?.push(descendant.item_id);
    }
  }

  return result;
}

interface ILoader {
  kids: INormalizedKids;
  itemId: number;
  root?: Item;
}

export const loader: LoaderFunction = async ({ params }) => {
  const itemId = Number(params.itemId);
  if (!itemId) {
    throw new Response("not found", { status: 404 });
  }
  const [item, itemKids] = await Promise.all([
    getItem(itemId),
    getItemKids(itemId),
  ]);

  const kids = transformKids(item, itemKids);
  const rootParentId = kids?.[itemId]?.parent_id;
  const root = rootParentId ? await getItem(rootParentId) : undefined;

  return json<ILoader>({ itemId, kids, root });
};

export const action: ActionFunction = async ({ request }) => {
  const data = await createItem(request);
  return json({ data });
};

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
            showScore={false}
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
  const { itemId, kids, root } = useLoaderData<ILoader>();
  const first = kids[itemId];
  const kidIds = first?.kids;

  return (
    <div className="max-w-6xl mx-auto w-full p-3">
      <ItemListing item={first} root={root} />

      <CommentForm
        parentPath={generatePath(first.item_id, first.path)}
        className="mt-4 ml-9"
      />

      {kidIds && (
        <ul className="mt-6">
          {kidIds?.map((id) => (
            <Kid key={id} id={id} kids={kids} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default Item;
