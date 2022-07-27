import { marked } from "marked";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { getPost } from "~/models/post.server";
import invariant from "tiny-invariant";

type LoaderData = {
  title: string;
  html: string;
};

// Server side code, i.e. the loader function only runs on the server!!!
export const loader: LoaderFunction = async ({ params }) => {
  // Remix params will be available in the `params` object. In this case we're only interested in the `slug` param.
  // The slug param is comming from the $slug route param. If the file was changed to $postid.tsx, the param would be `postid`.
  const { slug } = params;
  invariant(slug, "slug is required");

  const post = await getPost(slug);
  invariant(post, `post not found ${slug}`);

  // Server side processing of the markdown!
  const html = marked(post.markdown);

  // by parsing out the title we are reducing what we send over the network
  return json<LoaderData>({ title: post.title, html });
};

// Client (and server) side code
export default function PostRoute() {
  const { title, html } = useLoaderData() as LoaderData;
  return (
    <main className="mx-auto max-w-screen-xl px-4 py-12">
      <h1 className="mx-auto border-b-2 text-center text-3xl font-bold">
        {title}
      </h1>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
