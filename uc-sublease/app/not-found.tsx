import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { COPY } from "@/lib/copy";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="font-medium">{COPY.empty.pageNotFound.title}</p>
      <p className="pt-1 text-sm text-muted-foreground">{COPY.empty.pageNotFound.body}</p>
      <Button className="mt-4" render={<Link href="/list" />} nativeButton={false}>
        Back to browse
      </Button>
    </div>
  );
}
