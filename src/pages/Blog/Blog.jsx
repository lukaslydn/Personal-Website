import { supabase } from "../../supabase-client";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Blog.css";
import Loader from "../../components/Loading";

import { loadTags } from "./components/api/loadTags";
import { fetchPosts } from "./components/api/fetchposts";
import { TagDropdown } from "./components/tagDropdown";
import { renderTagPills } from "./components/renderTagPills";

function Blog() {
  // ---- SESSION MANAGEMENT ----
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [tags, setTags] = useState([])
  const [selectedTagIds, setSelectedTagIds] = useState([])




  useEffect(() => {
    handleLoadTags()
  }, [])

  useEffect(() => {
    handlefetchPosts(selectedTagIds);
  }, [selectedTagIds]);



  const handleLoadTags = async () => {
    const result = await loadTags()
    if (result.error) {
      console.error(result.error)
      return
    }

    setTags(result)
  }

  async function handlefetchPosts(selectedTags) {
    setLoading(true);
    const result = await fetchPosts(selectedTags)
    if (result) {
      setPosts(result)
    } else {
      setPosts([])
    } 
    setLoading(false);
  }




  // Helper function to get first text content from blocks
  // Use this when there is no preview text, to generate a short preview with the first 50 words of the content.
  function getFirstTextContent(content, wordLimit = 50) {
    if (!content || !Array.isArray(content)) return "";

    // Find first text block
    const firstTextBlock = content.find(block => block.type === "text" && block.content);
    
    if (!firstTextBlock) return "";

    // Strip HTML tags and get plain text
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = firstTextBlock.content;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";

    // Truncate to word limit
    const words = plainText.trim().split(/\s+/);
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "…";
    }
    return plainText;
  }



  // Helper function to get first image from content
  // If no banner image is provided we use the first image in the content as it
  function getFirstImageUrl(content) {
    if (!content || !Array.isArray(content)) return null;
    const firstImageBlock = content.find(block => block.type === "image" && block.src);
    return firstImageBlock ? firstImageBlock.src : null;
  }



  if (loading) {
    return (
      <div className="container">
        <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>Blog</h1>
        <TagDropdown
          tags={tags}
          selectedTagIds={selectedTagIds}
          setSelectedTagIds={setSelectedTagIds}
        />
        <div className="container" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>Blog</h1>
      <TagDropdown
        tags={tags}
        selectedTagIds={selectedTagIds}
        setSelectedTagIds={setSelectedTagIds}
      />
      {posts.length === 0 && <p style={{ textAlign: "center" }}>No posts yet.</p>}

      {posts.map((post) => {
        // Use preview image if available, otherwise get first image from content
        const displayImage = post.previewimagebanner || getFirstImageUrl(post.content);
        // Use preview text if available, otherwise generate from content
        const displayText = post.previewtext || getFirstTextContent(post.content, 50);

        return (
          <div key={post.id} className="post">


            {session && (
              <div className="post-admin-actions">
                <button
                  onClick={async () => {
                    if (window.confirm("Are you sure you want to delete this post?")) {
                      const { error } = await supabase.from("posts").delete().eq("id", post.id);
                      if (!error) {
                        setPosts(posts.filter((p) => p.id !== post.id));
                      } else {
                        console.error("Error deleting post:", error);
                      }
                    }
                  }}
                  title="Delete"
                > 
                {/* Admins can delete posts directly from the blog page. This button triggers a confirmation dialog, and if confirmed, it sends a request to delete the post from the database. If the deletion is successful, the post is also removed from the local state to update the UI immediately. */}
                  <ion-icon name="trash-outline" style={{ color: "red" }} />
                </button>
              </div>
            )}

            <Link to={`/posts/${post.slug}`} className="post-link">
              {/* Display preview image if available */}
              {displayImage && (
                <div className="post-image-frame">
                  <img src={displayImage} alt={post.title} className="post-image" />
                </div>
              )}

              <div className="post-content">
                <h2>{post.title}</h2>
                <div className="post-tags">
                     {renderTagPills(tags, post.tags)}
                </div>


                {/* Display preview text */}
                {displayText && <p className="post-preview-text">{displayText}</p>}

                {/* Show "Read more" if there's more content */}
                {displayText && (
                  <span className="read-more">Read more →</span>
                )}

                <p className="post-date" style={{color: 'black'}}>
                  <time className="post-date"  style={{color: 'black'}}>
                    {new Date(post.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </p>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}

export default Blog;

