import { Link, useLoaderData, Outlet } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";

import { json } from "@remix-run/node";
import { getPostsListings } from "~/models/post.server";
import { requireAdminUser } from "~/session.server";

type LoaderData = {
  posts: Awaited<ReturnType<typeof getPostsListings>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdminUser(request);
  const posts = await getPostsListings();
  return json<LoaderData>({ posts });
};

export default function AdminRoute() {
  const { posts } = useLoaderData() as LoaderData;

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-12">
      <h1 className="mx-auto border-b-2 text-center text-3xl font-bold">
        Blog Admin
      </h1>
      <div className="grid grid-cols-4 gap-6">
        <nav className="col-span-4 md:col-span-1">
          <ul>
            {posts.map((post) => (
              <li key={post.slug}>
                <Link to={post.slug} className="text-blue-600 underline">
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <main className="col-span-4 md:col-span-3">
          {/* The <Outlet /> renders nested route children based on the route.
            Nested routes must be located in a folder with the same name as
            this route file. I.e. foldername for nested routes="\admin"
            because this file-name is "admin.tsx" */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
