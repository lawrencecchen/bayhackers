import { ActionFunction, Form, redirect } from "remix";
import invariant from "tiny-invariant";
import { definitions } from "~/lib/types/supabase";
import { supabase } from "~/utils/supabase/supabase.server";

// FIXME: by = cookies :)

export const action: ActionFunction = async ({ params, request }) => {
  const formData = await request.formData();
  const title = formData.get("title");
  const url = formData.get("url");
  const by = formData.get("by");

  invariant(typeof title === "string", "title must be a string");
  invariant(typeof url === "string", "url must be a string");
  invariant(typeof by === "string", "by must be a string");

  const type = "story";

  const { data, error } = await supabase
    .from<definitions["items"]>("items")
    .insert({
      type,
      title,
      url,
      by,
    })
    .single();

  if (error) {
    console.error(error);
    throw new Error("Failed to submit.");
  }

  return redirect(`/item/${data.item_id}`);
};

export default function Submit() {
  return (
    <div className="max-w-6xl mx-auto w-full p-3">
      <Form reloadDocument method="post">
        <input type="hidden" name="by" value="lawrence" />
        <div className="grid grid-cols-5 items-center">
          <label htmlFor="title" className="col-span-1 text-sm font-semibold">
            title
          </label>
          <input
            type="text"
            className="border border-slate-300 px-2 py-1 col-span-4 sm:col-span-3"
            name="title"
          />
        </div>

        <hr className="my-4" />

        <div className="grid grid-cols-5 items-center">
          <label htmlFor="url" className="col-span-1 text-sm font-semibold">
            url
          </label>
          <input
            type="text"
            className="border border-slate-300 px-2 py-1 col-span-4 sm:col-span-3"
            name="url"
          />
        </div>

        <hr className="my-4" />

        <button
          type="submit"
          className="font-bold border border-slate-300 rounded-sm text-sm px-2 py-1 hover:underline"
        >
          submit
        </button>
      </Form>
    </div>
  );
}
