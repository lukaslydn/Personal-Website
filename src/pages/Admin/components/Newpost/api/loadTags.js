import { supabase } from "../../../../../supabase-client"

export async function loadTags() {
  const { data, error } = await supabase
    .from("tags")
    .select("id, tag, icon, color")
    .order("tag")

  if (error) {
    console.error(error)
    return { error: "Failed to load tags" };
  }

  return(data || [])
}