import { slugify } from "../utils/slugify";
import { supabase } from "../../../../../supabase-client"

export async function publishPost({ 
  title,
  previewText,
  previewImageUrl,
  content,
  selectedTagIds,
}) {
  if (!title || !content) { //Ensures title and content at minimum are provided
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
  }; // Prepares data to be sent to the server
  //Slug is generated from the title for a friendly URL

  const { error } = await supabase.from("posts").insert(postData); 
  // Inserts the new post into the "posts" table in the database using Supabase
  // The insert function returns an error if something goes wrong, which we handle here
  // This is called object destructuring in JavaScript. {error} means we only want the error property from the object that insert returns.

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
