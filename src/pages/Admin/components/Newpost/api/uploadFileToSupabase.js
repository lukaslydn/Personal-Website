import { supabase } from "../../../../../supabase-client";

export async function uploadFileToSupabase(file) {
  console.log("Uploading file:", file);
  const filePath = `${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("blog-images")
    .upload(filePath, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("blog-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
};

// Export the uploadToSupabase function for use in other parts of the application
// import { uploadToSupabase } from "../utils/uploadFileToSupabase";
// Example usage:
// const fileInput = document.querySelector("#fileInput");
// fileInput.addEventListener("change", async (event) => {
//   const file = event.target.files[0];
//   try {
//     const publicUrl = await uploadToSupabase(file);
//     console.log("File uploaded successfully. Public URL:", publicUrl);
//   } catch (error) {
//     console.error("Error uploading file:", error);
//   }
// });