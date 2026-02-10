import { supabase } from "../supabase-client";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Blog.css";
import Loader from "../components/Loading";

function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [tags, setTags] = useState([])

  useEffect(() => {
    loadTags()
  }, [])

  async function loadTags() {
    const { data, error } = await supabase
      .from("tags")
      .select("id, tag, icon, color")
      .order("tag")

    if (error) {
      console.error(error)
      return
    }
    setTags(data || [])

  }


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


  const [selectedTagIds, setSelectedTagIds] = useState([])



  useEffect(() => {
    loadTags()
  }, [])

  useEffect(() => {
    fetchPosts(selectedTagIds);
  }, [selectedTagIds]);

  async function loadTags() {
    const { data, error } = await supabase
      .from("tags")
      .select("id, tag, icon, color")
      .order("tag")

    if (error) {
      console.error(error)
      return
    }

    setTags(data || [])
    return(tags)
  }

  // ---- FETCH POSTS ----

  async function fetchPosts(selectedTags) {
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
    } else {
      setPosts(data);
    }

    setLoading(false);
  }


  // Helper function to get first text content from blocks
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
  function getFirstImageUrl(content) {
    if (!content || !Array.isArray(content)) return null;
    const firstImageBlock = content.find(block => block.type === "image" && block.src);
    return firstImageBlock ? firstImageBlock.src : null;
  }

  if (loading) {
    return (
      <div className="container" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <Loader />
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


function renderTagPills(allTags, postTagIds) {
  if (!Array.isArray(allTags) || !Array.isArray(postTagIds)) return null

  return postTagIds
    .map(id => {
      const tag = allTags.find(t => t.id === Number(id))
      if (!tag) return null

      return (
        <span
          key={tag.id}
          className="tag-pill"
          style={{
            "--tag-bg": tag.color,
            color: isColorDark(tag.color) ? "#fff" : "#111"
          }}
        >
          {tag.icon && <ion-icon name={tag.icon} />}
          {tag.tag}
        </span>
      )
    })
    .filter(Boolean)
}


function TagDropdown({ tags, selectedTagIds, setSelectedTagIds, createTag }) {

  const TAG_COLORS = [
    "#0a8dffff", // Blue
    "#00ff40ff", // Green
    "#FF9F0A", // Orange
    "#ff0d00ff", // Red
    "#aa00ffff",  // Purple
    "#ffdd00ff"
  ]

  const [isOpen, setIsOpen] = useState(false)

  function selectTag(id) {
    setSelectedTagIds(prev =>
      prev.includes(id) ? prev : [...prev, id]
    )
    setIsOpen(false) // ⬅️ close menu on select
  }

  function removeTag(id) {
    setSelectedTagIds(prev =>
      prev.filter(t => t !== id)
    )
  }

  return (
    <div className="tag-select">
      {/* Selected pills */}
      <div className="tag-pills">
        {selectedTagIds.map(id => {
          const tag = tags.find(t => t.id === id)
          if (!tag) return null

          return (
            <span
              key={id}
              className="tag-pill"
              style={{ "--tag-bg": tag.color, color: isColorDark(tag.color) ? "#fff" : "#111" }}
              onClick={() => removeTag(id)}
            >
              {tag.icon && <ion-icon name={tag.icon} />}
              {tag.tag}
              <ion-icon name="close" />
            </span>
          )
        })}
      </div>

      {/* Toggle */}
      <button
        type="button"
        className="tag-toggle"
        onClick={() => setIsOpen(o => !o)}
      >
        {isOpen ? "Close tags" : "Add tags"}
      </button>

      {/* Floating dropdown */}


      {isOpen && (
        <div className="tag-dropdown floating">
            <>
              {tags
                .filter(tag => !selectedTagIds.includes(tag.id))
                .map(tag => (
                  <div
                    key={tag.id}
                    className="tag-option"
                    onClick={() => selectTag(tag.id)}
                    style={{ "--tag-bg": tag.color,
                      color: isColorDark(tag.color) ? "#fff" : "#111"
                     }}
                  >
                    {tag.icon && <ion-icon name={tag.icon} />}
                    <span>{tag.tag}</span>
                  </div>
                ))}
            </>
        </div>
      )}

    </div>
  )
}



function isColorDark(hex) {
  if (!hex) return true

  hex = hex.replace("#", "")

  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq < 140
}
