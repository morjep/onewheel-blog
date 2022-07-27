import { Outlet } from "@remix-run/react";

// test commit to initiate deployment

export default function PostRoute() {
  return <Outlet />;
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
