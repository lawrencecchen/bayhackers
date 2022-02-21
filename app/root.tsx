import {
  Link,
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "remix";
import type { MetaFunction } from "remix";
import styles from "./tailwind.css";
import { useCatch } from "remix";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export const meta: MetaFunction = () => {
  return { title: "Bay Hackers" };
};

export default function App() {
  const location = useLocation();

  const state = location.state as {
    disableScroll?: boolean;
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="border-b">
          <div className="max-w-6xl mx-auto w-full p-3 space-x-4">
            <NavLink to="/" className="font-semibold">
              Bay Hackers
            </NavLink>

            <Link
              to="/submit"
              className="text-sm px-2 py-1 hover:underline text-slate-700"
            >
              submit
            </Link>
          </div>
        </div>
        <Outlet />
        {!state?.disableScroll && <ScrollRestoration />}
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div>
      <h1>Error</h1>
      <p>{error.message}</p>
      <p>The stack trace is:</p>
      <pre>{error.stack}</pre>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  return (
    <div>
      <h1>Caught</h1>
      <p>Status: {caught.status}</p>
      <pre>
        <code>{JSON.stringify(caught.data, null, 2)}</code>
      </pre>
    </div>
  );
}
