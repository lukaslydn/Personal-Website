import { slugify } from "../utils/slugify";
import { supabase } from "../../../../../supabase-client"

export async function publishPost({
  title,
  previewText,
  previewImageUrl,
  content,
  selectedTagIds,
}) {
  if (!title || !content) {
    return { error: "Missing required fields" };
  }

  const postData = {
    title,
    previewtext: previewText || null,
    previewimagebanner: previewImageUrl || null,
    slug: slugify(title),
    content,
    tags: selectedTagIds,
    published: true,
  };

  const { error } = await supabase.from("posts").insert(postData);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
