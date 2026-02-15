import { useState } from "react";

import Loader from "../../../../components/Loading";

import TagDropdown from "./components/TagDropdown"
import PostEditor from "./components/PostEditor"

import { wordCount } from "./utils/wordcount"
import { publishPost } from "./api/publishPost"
import { handlePreviewImageUpload } from "./utils/handlePreviewImageUpload"

function NewPost() {

  // ==================== States ====================
  const [title, setTitle] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [content, setContent] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [selectedTagIds, setSelectedTagIds] = useState([])
  const [publishErrorText, setPublishErrorText] = useState()

  // ==================== Handlers ====================
  // This function is called when the user clicks the "Publish" button. It gathers all the post data and sends it to the server.
  async function handlePublishClick() {
    setPublishErrorText(""); 

    const result = await publishPost({
      title,
      previewText,
      previewImageUrl,
      content,
      selectedTagIds,
    }); // Calls the publishPost function (defined in api/publishPost.js) to send the post data to the server

    if (result.error) { // If there was an error, show it to the user
      setPublishErrorText(result.error);
      return;
    }

    // Success
    alert("Post published successfully!");

    setTitle("");
    setPreviewText("");
    setSelectedTagIds([]);
    setPreviewImageUrl(null);
    setContent(null);
    setResetTrigger(prev => prev + 1); 
  }

  // This function is called when the user selects an image file for the preview banner. It uploads the image and sets the previewImageUrl state.
  async function ImageUpload(file) {
    setIsUploading(true);


    const ImageUrl = await handlePreviewImageUpload(file); // Calls the handlePreviewImageUpload function (defined in utils/handlePreviewImageUpload.js) to upload the image and get its URL
      if (ImageUrl.error) {
        alert("Image upload failed");
        setIsUploading(false);
        return;
      }
      setPreviewImageUrl(ImageUrl.url);
      setIsUploading(false);
    }

    
    return ( 
      <div>
        <h1>New post</h1>
        <TagDropdown // Allows users to add tags to the post
          selectedTagIds={selectedTagIds}
          setSelectedTagIds={setSelectedTagIds} 
        />

        <div className="post-editor">
          <div className="preview-section">

            {/* TITLE */}
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                placeholder="Post title"
                value={title}
                onChange={(e) => setTitle(e.target.value)} // Updates the title state when the user types in the title input field
              />
            </div>


            {/* PREVIEW TEXT */}
            <div className="form-group">
              <label>Preview text</label>
              <textarea
                placeholder="Preview text (max 50 words)"
                value={previewText}
                onChange={(e) => {
                  const text = e.target.value;
                  if (wordCount(text) <= 50) {
                    setPreviewText(text);
                  } // Updates the previewText state when the user types in the preview text textarea, but only if it's 50 words or less
                }}
              />
              <div className="preview-meta">
                <span>{wordCount(previewText)} / 50 words</span>
              </div>
            </div>



            {/* PREVIEW BANNER */}

            {previewImageUrl && (
              <div className="preview-image-wrapper">
                <img src={previewImageUrl} alt="Preview banner" />
              </div>
            )}
            <div className="form-group">
              <label className="image-upload">
                {isUploading ? (
                  <Loader />
                ) : (
                  <ion-icon
                    name="cloud-upload-outline"
                    style={{ fontSize: "1.2rem", color: "black" }}
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      ImageUpload(file);
                    }
                  }}
                />
              </label>
            </div>

          </div>


          {/* CONTENT EDITOR */}
          <p>Content</p>


          {/* The PostEditor component is a rich text editor where the user can write the content of the post. It takes the content state and the resetTrigger state as props. */}
          <PostEditor onChange={setContent} resetTrigger={resetTrigger} />

          
          {publishErrorText && (
            <p className="error-text">{publishErrorText}</p>
          )}
          <button onClick={handlePublishClick} className="publish-button">
            <ion-icon
              name="send-outline"
              style={{ fontSize: "1.2rem", color: "black" }}
            />
            Publish
          </button>
        </div>
      </div>
    );
}

export default NewPost;



