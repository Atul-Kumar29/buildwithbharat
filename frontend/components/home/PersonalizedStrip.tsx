import Link from "next/link";

/** "See personalised recommendations" strip above the footer. UI shell only. */
export function PersonalizedStrip() {
  return (
    <section className="border-t border-neutral-300 bg-white px-4 py-8 text-center shadow-[0_-1px_0_rgba(0,0,0,0.04)]">
      <p className="text-sm text-neutral-800">See personalised recommendations</p>
      <Link
        href="/login"
        className="mx-auto mt-2 block w-full max-w-[300px] rounded-lg bg-teal-400 py-2 text-sm font-semibold text-slate-900 hover:bg-teal-300"
      >
        Sign in
      </Link>
      <p className="mt-2 text-xs text-neutral-700">
        New customer?{" "}
        <Link href="/login" className="text-teal-700 hover:underline">Start here.</Link>
      </p>
    </section>
  );
}
