import { useState } from "react";
import { Link } from "remix";
import { definitions } from "~/lib/types/supabase";
import { getTimeAgo } from "./getTimeAgo";

function ItemListing({
  item,
  hiddenOptions,
  showScore=true
}: {
  item: definitions["items"];
  hiddenOptions?: {
    onChange: (value: boolean) => void;
    hidden: boolean;
  };
  showScore: boolean;
}) {
  return (
    <div className="flex">
      <div className="grid grid-cols-[auto,36px,1fr] w-full items-baseline">
        {hiddenOptions && (
          <div className="">
            <button
              className="inline text-xs text-slate-500 p-1 hover:underline"
              onClick={() => hiddenOptions.onChange(!hiddenOptions.hidden)}
            >
              {hiddenOptions.hidden ? "[+]" : "[−]"}
            </button>
          </div>
        )}
        <form
          method="post"
          className="mr-1 place-self-center col-start-2"
          aria-hidden={hiddenOptions?.hidden}
          hidden={hiddenOptions?.hidden}
        >
          <button name="upvote" className="text-slate-400" title="upvote">
            ▲
          </button>
        </form>

        <div className="col-start-3">
          <div className="text-lg font-medium">
            {item.url ? (
              <>
                <a href={item.url}>{item.title}</a>{" "}
                <Link
                  to={`/from?site=${encodeURIComponent(
                    new URL(item.url).host
                  )}`}
                  className="text-xs text-slate-500 hover:underline"
                >
                  ({new URL(item.url).host})
                </Link>
              </>
            ) : (
              <Link to={`item/${item.item_id}`}>{item.title}</Link>
            )}
          </div>
          <div>
            <span className="text-xs text-gray-500">
              {showScore && 
                <>{item.score} points by{" "}</>
              }
              <Link to={`/users/${item.by}`} className="hover:underline">
                {item.by}
              </Link>{" "}
              {getTimeAgo(new Date(item.inserted_at))} |{" "}
              {item.type === "comment" ? (
                <Link to={`?${item.item_id}`} className="hover:underline">
                  link
                </Link>
              ) : (
                <Link to={`item/${item.item_id}`} className="hover:underline">
                  comments
                </Link>
              )}
            </span>
          </div>
        </div>

        {item.type === "comment" && (
          <div
            className="col-start-3"
            aria-hidden={hiddenOptions?.hidden}
            hidden={hiddenOptions?.hidden}
          >
            <div className="text-slate-700 my-1">{item.text}</div>
            <Link to="reply" className="text-xs text-gray-600 underline">
              reply
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ItemListing;
