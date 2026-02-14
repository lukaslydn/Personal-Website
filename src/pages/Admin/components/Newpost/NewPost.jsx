import { useState, useRef, useEffect } from "react";

import Loader from "../../../../components/Loading";

import TagDropdown from "./components/TagDropdown"
import FloatingToolbar from "./components/FloatingToolBar"
import PostEditor from "./components/PostEditor"

import { wordCount } from "./utils/wordcount"
import { publishPost } from "./api/publishPost"
import { handlePreviewImageUpload } from "./utils/handlePreviewImageUpload"

function NewPost() {

      const [title, setTitle] = useState("");
      const [previewText, setPreviewText] = useState("");
      const [previewImageUrl, setPreviewImageUrl] = useState(null);
      const [content, setContent] = useState(null);
      const [isUploading, setIsUploading] = useState(false);
      const [resetTrigger, setResetTrigger] = useState(0);
    
      const [tags, setTags] = useState([])
      const [selectedTagIds, setSelectedTagIds] = useState([])
    
    
      const [publishErrorText, setPublishErrorText] = useState()

      async function handlePublishClick() {
        setPublishErrorText(""); 

        const result = await publishPost({
          title,
          previewText,
          previewImageUrl,
          content,
          selectedTagIds,
        });

        if (result.error) {
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

      async function ImageUpload(file) {
        setIsUploading(true);


      const ImageUrl = await handlePreviewImageUpload(file);
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
          <TagDropdown
            tags={tags}
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
                    onChange={(e) => setTitle(e.target.value)}
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
                      }
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
              <PostEditor onChange={setContent}  resetTrigger={resetTrigger}/>
            {/* <p style={{maxWidth: '600px'}}>{JSON.stringify(content)}</p> */}
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



