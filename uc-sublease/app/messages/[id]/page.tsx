"use client";

import { useParams } from "next/navigation";
import { MessagesView } from "@/components/messages-view";

export default function ThreadPage() {
  const { id } = useParams<{ id: string }>();
  return <MessagesView activeId={id} />;
}
