import { uploadFileToSupabase } from "../api/uploadFileToSupabase"


export async function handlePreviewImageUpload(file) {
    try {
    const url = await uploadFileToSupabase(file);
      return { url };
    } catch (err) {
      console.error(err);
      return { error: "Image upload failed" };
    }
}