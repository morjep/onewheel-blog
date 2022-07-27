import {
  Form,
  useActionData,
  useCatch,
  useLoaderData,
  useParams,
  useTransition,
} from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import {
  createPost,
  deletePost,
  getPost,
  updatePost,
} from "~/models/post.server";
import invariant from "tiny-invariant";
import { requireAdminUser } from "~/session.server";
import type { Post } from "@prisma/client";

// Server side code, i.e. the action function only runs on the server!!!
type LoaderData = { post?: Post };

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdminUser(request);
  invariant(params.slug, "slug is required");

  if (params.slug === "new") {
    return json<LoaderData>({});
  }

  const post = await getPost(params.slug);
  if (!post) {
    throw new Response("Not Found", { status: 404 });
  }

  return json<LoaderData>({ post });
};

type ActionData =
  | {
      title: null | string;
      slug: null | string;
      markdown: null | string;
    }
  | undefined;

export const action: ActionFunction = async ({ request, params }) => {
  await requireAdminUser(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  invariant(params.slug, "slug is required");

  if (intent === "delete") {
    await deletePost(params.slug);
    return redirect(`/posts/admin`);
  }

  const title = formData.get("title");
  const slug = formData.get("slug");
  const markdown = formData.get("markdown");

  const errors: ActionData = {
    title: title ? null : "Title is required",
    slug: slug ? null : "Slug is required",
    markdown: markdown ? null : "Markdown is required",
  };

  const hasErrors = Object.values(errors).some((error) => error !== null);
  if (hasErrors) {
    return json<ActionData>(errors);
  }
  invariant(typeof title === "string", "title must be string");
  invariant(typeof slug === "string", "slug must be string");
  invariant(typeof markdown === "string", "markdown must be string");

  if (params.slug === "new") {
    createPost({ title, slug, markdown });
  } else {
    updatePost(params.slug, { title, slug, markdown });
  }
  return redirect("/posts/admin");
};

const inputClassName =
  "w-full  rounded border-2 border-gray-300 rounded-lg p-2 focus:outline-none focus:border-blue-500";

// Client (and server) side code
export default function NewPostRoute() {
  const data = useLoaderData() as LoaderData;
  const errors = useActionData() as ActionData;
  const transition = useTransition();
  const isUpdating = transition.submission?.formData.get("intent") === "update";
  const isCreating = transition.submission?.formData.get("intent") === "create";
  const isDeleting = transition.submission?.formData.get("intent") === "delete";

  const isNewPost = !data.post;
  return (
    <Form method="post" key={data.post?.slug ?? "new"}>
      <p>
        <label>
          Title:
          {errors?.title ? (
            <em className="text-red-500"> Title is required </em>
          ) : null}
        </label>
        <input
          type="text"
          name="title"
          className={inputClassName}
          placeholder="Title"
          defaultValue={data.post?.title}
        />
      </p>
      <p>
        <label>
          Slug:{" "}
          {errors?.slug ? (
            <em className="text-red-500"> Slug is required </em>
          ) : null}
        </label>
        <input
          type="text"
          name="slug"
          className={inputClassName}
          placeholder="slug"
          defaultValue={data.post?.slug}
        />
      </p>
      <p>
        <label htmlFor="markdown">
          Markdown:{" "}
          {errors?.markdown ? (
            <em className="text-red-500"> Markdown is required </em>
          ) : null}
        </label>
        <textarea
          id="markdown"
          name="markdown"
          rows={20}
          className={`${inputClassName} font-monospace`}
          placeholder="Your post content..."
          defaultValue={data.post?.markdown}
        />
      </p>
      <div className="flex justify-end gap-4">
        {isNewPost ? null : (
          <button
            type="submit"
            name="intent"
            value="delete"
            className="rounded bg-red-500 py-2 px-4 font-bold text-white hover:bg-red-700 disabled:bg-red-300"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Post"}
          </button>
        )}
        <button
          type="submit"
          name="intent"
          value={isNewPost ? "create" : "update"}
          className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300"
          disabled={isCreating || isUpdating}
        >
          {isNewPost ? (isCreating ? "Creating..." : "Create Post") : null}
          {isNewPost ? null : isUpdating ? "Updating..." : "Update Post"}
        </button>
      </div>
    </Form>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  const params = useParams();
  if (caught.status == 404) {
    return (
      <div> Uh oh! The post with slug "{params.slug}" could not be found! </div>
    );
  }
  throw new Error(`Unexpected error: ${caught.status}`);
}

export function ErrorBoundary({ error }: { error: unknown }) {
  if (error instanceof Error) {
    return (
      <div className="text-red-500">
        oh no, something went wrong:
        <pre>{error.message}</pre>
      </div>
    );
  }
  return <div className="text-red-500">oh no, something went wrong:</div>;
}
