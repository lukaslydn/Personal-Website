import { supabase } from "../../../../supabase-client"

export async function fetchPosts(selectedTags) {
    let query = supabase
      .from("posts")
      .select(
        "id, title, content, created_at, slug, previewimagebanner, previewtext, tags"
      )
      .eq("published", true)
      .order("created_at", { ascending: false });

    // Only filter when tags are provided
    if (selectedTags.length > 0) {
      query = query.or(
        selectedTags.map(id => `tags.cs.[${id}]`).join(',')
      );
    }


    const { data, error } = await query;

    if (error) {
      console.error("Error loading posts:", error);
      return null;
    } else {
      return(data);
    }
  }

