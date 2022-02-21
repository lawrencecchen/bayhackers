import type { LoaderFunction } from "remix";
import { json, useLoaderData } from "remix";
import { definitions } from "~/lib/types/supabase";
import { supabase } from "~/utils/supabase/supabase.server";
import ItemListing from "./components/Item/ItemListing";

async function getItems() {
  const { data, error } = await supabase
    .from<definitions["items"]>("items")
    .select("*")
    .is("parent_id", null);

  if (error) {
    console.error(error);
    throw error;
  }
  return data;
}

interface ILoader {
  items: definitions["items"][];
}

export const loader: LoaderFunction = async () => {
  const items = await getItems();

  return json<ILoader>({ items });
};

export default function Index() {
  const { items } = useLoaderData<ILoader>();

  return (
    <>
      <div className="max-w-6xl mx-auto w-full p-3">
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.item_id}>
              <ItemListing item={item} showContent={false} />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
