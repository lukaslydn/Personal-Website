import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabase-client";
import Loader from "../components/Loading";
import "./postpage.css";

function PostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
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


  useEffect(() => {
    async function fetchPost() {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("slug", slug)
        .single();

      if (!error) setPost(data);
      setLoading(false);
    }

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="container" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <Loader />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container">
        <div className="post-not-found">
          <h1>Post not found</h1>
          <p>The post you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <article className="post-page">
        {/* Post Header */}
        <header className="post-header">
          <h1 className="post-title">{post.title}</h1>
          
          <div className="post-meta">
            <time className="post-date">
              {new Date(post.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
          <div className="post-tags">
            {renderTagPills(tags, post.tags)}
          </div>

          {/* Preview/Banner Image */}
          {post.previewimagebanner && (
            <div className="post-banner">
              <img src={post.previewimagebanner} alt={post.title} />
            </div>
          )}
          {post.previewtext && (
            <p>{post.previewtext}</p>
          )}
        </header>

        <div
          style={{
            width: "100%",
            height: "2px",
            backgroundColor: "rgba(255, 255, 255, 1)",
            margin: "16px 0",
            borderRadius: "1px"
          }}
        />



        {/* Post Content */}
        <div className="post-body">
          {post.content && Array.isArray(post.content) && post.content.map((block, i) => {
            // Text block
            if (block.type === "text") {
              return (
                <div
                  key={block.id || i}
                  className="content-block text-block"
                  dangerouslySetInnerHTML={{
                    __html: addTargetBlank(block.content)
                  }}
                />

              );
            }

            // Image block
            if (block.type === "image") {
              return (
                <div key={block.id || i} className="content-block image-block">
                  <img src={block.src} alt="" />
                </div>
              );
            }

            return null;
          })}
        </div>
      </article>
    </div>
  );
}

export default PostPage;

function addTargetBlank(html) {
  if (!html) return ""

  return html.replace(
    /<a\s+(?![^>]*target=)/gi,
    '<a target="_blank"'
  )
}


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


function isColorDark(hex) {
  if (!hex) return true

  hex = hex.replace("#", "")

  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq < 140
}
