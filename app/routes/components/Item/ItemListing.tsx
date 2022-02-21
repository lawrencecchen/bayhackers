import { useState } from "react";
import { Link, Outlet, useParams, useSearchParams } from "remix";
import { definitions } from "~/lib/types/supabase";
import Item from "~/routes/item/$itemId";
import { generatePath } from "./generatePath";
import { getTimeAgo } from "./getTimeAgo";

function ItemListing({
  item,
  hiddenOptions,
  showScore = true,
  root,
  showContent = true,
}: {
  item: definitions["items"];
  hiddenOptions?: {
    onChange: (value: boolean) => void;
    hidden: boolean;
  };
  showScore?: boolean;
  root?: Item;
  showContent?: boolean;
}) {
  const commentPath = generatePath(item.item_id, item.path);
  const [searchParams] = useSearchParams();
  const params = useParams();

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
          className="place-self-center col-start-2"
          aria-hidden={hiddenOptions?.hidden}
          hidden={hiddenOptions?.hidden}
        >
          <button
            name="upvote"
            className="text-slate-500/80 p-1"
            title="upvote"
          >
            <svg
              viewBox="0 0 14 14"
              width="12"
              height="12"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="m7 0 7 14H0L7 0Z" />
            </svg>
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
            <span className="text-xs text-slate-500">
              {showScore && <>{item.score} points by </>}
              <Link
                to={`/users/${item.by}`}
                prefetch="intent"
                className="hover:underline"
              >
                {item.by}
              </Link>{" "}
              {getTimeAgo(new Date(item.inserted_at))}
              {" | "}
              {item.type === "comment" ? (
                <Link
                  to={`/item/${item.item_id}`}
                  prefetch="intent"
                  className="hover:underline"
                >
                  link
                </Link>
              ) : (
                <Link
                  to={`item/${item.item_id}`}
                  prefetch="intent"
                  className="hover:underline"
                >
                  comments
                </Link>
              )}
              {root && (
                <>
                  {" | "}
                  on:{" "}
                  <Link
                    to={`/item/${root.item_id}`}
                    prefetch="intent"
                    className="hover:underline"
                  >
                    {root.title}
                  </Link>
                </>
              )}
            </span>
          </div>
        </div>

        {showContent && (
          <div
            className="col-start-3"
            aria-hidden={hiddenOptions?.hidden}
            hidden={hiddenOptions?.hidden}
          >
            <div className="text-slate-700 my-1">{item.text}</div>
            {item.type === "comment" && (
              <>
                {!root && searchParams.get("to") === commentPath ? (
                  <Outlet />
                ) : (
                  <Link
                    to={`reply?to=${commentPath}`}
                    className="text-xs text-slate-600 underline"
                    state={{ disableScroll: true }}
                    prefetch="intent"
                  >
                    reply
                  </Link>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ItemListing;
