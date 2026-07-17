import { redirect } from "next/navigation";

export default async function StoryEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/stories/${slug}/1`);
}
