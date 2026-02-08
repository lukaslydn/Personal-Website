import { useEffect, useState, useRef } from "react";
import { supabase } from "../supabase-client";
import Loader from "../components/Loading";


import "./Admin.css";

function Admin() {

  // Auth States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState(null);
  const [errorText, setErrorText] = useState("");


  const [title, setTitle] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [content, setContent] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);

  const [tags, setTags] = useState([])
  const [selectedTagIds, setSelectedTagIds] = useState([])


  const [publishErrorText, setPublishErrorText] = useState()

  function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
  }
  function wordCount(text) {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }


  async function handlePreviewImageUpload(file) {
    setIsUploading(true);
    try {
      const url = await uploadToSupabase(file);
      setPreviewImageUrl(url);
    } catch (err) {
      console.error(err);
      alert("Image upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  async function handlePublish() {
    if (!title || !content) {
      setPublishErrorText("Missing required fields");
      return;
    }

    const postData = {
      title,
      previewtext: previewText ? previewText : null,
      previewimagebanner: previewImageUrl ? previewImageUrl : null,
      slug: slugify(title),
      content,
      tags: selectedTagIds,
      published: true
    };

    console.log("READY TO UPLOAD:", postData);

    const { error } = await supabase.from("posts").insert(postData);
    
    if (error) {
      setPublishErrorText(`Error: ${error.message}`);
      console.error("Upload error:", error);
    } else {
      // ✅ Success!
      alert("Post published successfully!");

      setTitle("");
      setPreviewText("");
      setPreviewImageUrl(null);
      setTags([])
      setContent(null);
      setResetTrigger(prev => prev + 1);
    }
  }

async function createTag({ tag, icon, color }) {
  const { error } = await supabase.from("tags").insert({
    tag,
    icon,
    color
  })

  if (error) {
    alert(error.message)
    return false
  }

  await loadTags()
  return true
}


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
  return(tags)
}



// ==================== SESSION MANAGEMENT ====================
  useEffect(() => {

    // Runs once when the component mounts (because of the empty dependency array at the bottom).
    // This is where you set up global authentication awareness.

    //Asks Supabase: “Do I already have a logged-in user?”
    //This checks local storage / cookies, not the network.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      //Stores the current session in React state
      // If the user is already logged in → session is an object
    });

    const {
      data: { subscription }, // Sets up a listener for auth changes
    } = supabase.auth.onAuthStateChange((_event, session) => { // Sets up a listener for auth changes (login, logout, etc)
      setSession(session); // Keeps React state perfectly in sync with Supabase auth
    });

    return () => subscription.unsubscribe();
    // Removes the auth listener when the component unmounts
  }, []);


// ==================== LOGIN ====================
  async function handleLogin(e) {
    e.preventDefault(); // Stops the browser from: Reloading the page
    setErrorText("");

    // Asks Supabase to log in with email & password
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email,
      password,
    });

    
    // If there was an error, show it
    if (error) {
      setErrorText(error.message);
    } else {
      setSession(data.session); // If successful, save the session in React state
    }
  }
 

// ==================== LOGIN SCREEN ====================
  if (!session) {
    return (
      <div className="admin-container">
        <div className="admin-content">
          <AdminLogin email={email} setEmail={setEmail} password={password} setPassword={setPassword} handleLogin={handleLogin} errorText={errorText}/>
        </div>
      </div>
    );
  }

  else if (session) {
  // ==================== DASHBOARD ====================
    return (
      <div className="admin-container">
        <div className="admin-content">
          
          <AdminAccountDashboard />

          <h1>New post</h1>
          <TagDropdown
            tags={tags}
            selectedTagIds={selectedTagIds}
            setSelectedTagIds={setSelectedTagIds}
            createTag={createTag}
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
                {isUploading && (
                  <Loader />
                )}
                {previewImageUrl && (
                  <div className="preview-image-wrapper">
                    <img src={previewImageUrl} alt="Preview banner" />
                  </div>
                )}
                <div className="form-group">
                  <label className="image-upload">
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handlePreviewImageUpload(file);
                        }
                      }}
                    />
                    <ion-icon
                      name="cloud-upload-outline"
                      style={{ fontSize: "1.2rem", color: "black" }}
                    />
                  </label>
                </div>


              </div>


              {/* CONTENT EDITOR */}
              <p>Content</p>
              <PostEditor onChange={setContent}  resetTrigger={resetTrigger}/>
            {/* <p style={{maxWidth: '600px'}}>{JSON.stringify(content)}</p> */}

            <button onClick={handlePublish} className="publish-button">
              <ion-icon
                name="send-outline"
                style={{ fontSize: "1.2rem", color: "black" }}
              />
              Publish
              </button>
            {publishErrorText && (
              <p className="error-text">{publishErrorText}</p>
            )}
          </div>
        </div>
        </div>
    );
  }
}

export default Admin;

function AdminLogin({ email, setEmail, password, setPassword, handleLogin, errorText }) {
  return (
    <div>
     <h1 style={{ textAlign: "center" }}>Login</h1>
          <div className="login-form">
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <input
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input type="password" placeholder="Password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required />
              </div>
              {errorText && <p className="error-text">{errorText}</p>}
              <button className="login-button" type="submit">Login</button>
            </form>
        </div>
    </div>
  )
}
function AdminAccountDashboard() {
  return (
  <div className="admin-account-header">
    <h1>Account</h1>
    <button type="button" className="logout-button"  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
    onClick={async () => { await supabase.auth.signOut();}}
    >
      <ion-icon name="log-out-outline" style={{ fontSize: "1.2rem" }}></ion-icon>
      Logout
    </button>
  </div>
  );
}

async function uploadToSupabase(file) {
  const filePath = `${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("blog-images")
    .upload(filePath, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("blog-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

const createBlock = () => ({
  id: crypto.randomUUID(),
  type: "text"
});

const createImageBlock = (src = null, loading = false) => ({
  id: crypto.randomUUID(),
  type: "image",
  src,
  loading,
});

const PostEditor = ({ onChange, resetTrigger }) => {
  const [toolbarPos, setToolbarPos] = useState(null);
  const [blocks, setBlocks] = useState([createBlock()]);
  const refs = useRef({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (resetTrigger > 0) {
      setBlocks([createBlock()]);
      setToolbarPos(null);
    }
  }, [resetTrigger]);

  // Handle content changes while typing
  const handleInput = (blockId) => {
    setBlocks(prev => 
      prev.map(b => 
        b.id === blockId && b.type === "text"
          ? { ...b, content: refs.current[blockId]?.innerHTML || "" }
          : b
      )
    );
  };

  // Floating toolbar position update
  const updateToolbarPosition = () => {
    const selection = window.getSelection();

    if (!selection || selection.isCollapsed) {
      setToolbarPos(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setToolbarPos({
      top: rect.top + window.scrollY - 40,
      left: rect.left + rect.width / 2,
    });
  };

  // Listen for text selections
  useEffect(() => {
    document.addEventListener("selectionchange", updateToolbarPosition);
    return () =>
      document.removeEventListener("selectionchange", updateToolbarPosition);
  }, []);

  // Sync blocks to parent component
  useEffect(() => {
    const data = blocks.map(b => {
      if (b.type === "text") {
        return {
          id: b.id,
          type: b.type,
          content: b.content || refs.current[b.id]?.innerHTML || "",
        };
      }

      if (b.type === "image") {
        return {
          id: b.id,
          type: b.type,
          src: b.src,
        };
      }
      return b;
    });

    onChange(data);
  }, [blocks, onChange]);

  // Add new text block
  const addBlock = () => {
    const block = createBlock();
    setBlocks(prev => [...prev, block]);
    requestAnimationFrame(() => {
      refs.current[block.id]?.focus();
    });
  };

  // Delete block
  const deleteBlock = (id) => {
    setBlocks(prev => {
      if (prev.length === 1) return prev;

      const index = prev.findIndex(b => b.id === id);
      const focusTarget = prev[index - 1];

      requestAnimationFrame(() => {
        if (focusTarget) refs.current[focusTarget.id]?.focus();
      });

      return prev.filter(b => b.id !== id);
    });
  };

  // Handle backspace on empty block
  const handleKeyDown = (e, block) => {
    if (
      e.key === "Backspace" &&
      refs.current[block.id].innerText.trim() === ""
    ) {
      e.preventDefault();
      deleteBlock(block.id);
    }
  };

  // Extract image from clipboard
  const getImageFromClipboard = async (e) => {
    const items = Array.from(e.clipboardData.items);

    // Real image file (screenshots, drag)
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        return item.getAsFile();
      }
    }

    // HTML image (Google Docs, web)
    const html = e.clipboardData.getData("text/html");
    if (html) {
      const match = html.match(/<img[^>]+src="(data:image\/[^"]+)"/i);
      if (match) {
        const res = await fetch(match[1]);
        const blob = await res.blob();
        return new File([blob], "pasted-image.png", { type: blob.type });
      }
    }

    return null;
  };

  // Insert plain text at cursor
  const insertPlainText = (text) => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const fragment = document.createDocumentFragment();
    const lines = text.split("\n");

    lines.forEach((line, i) => {
      fragment.appendChild(document.createTextNode(line));
      if (i < lines.length - 1) {
        fragment.appendChild(document.createElement("br"));
      }
    });

    range.insertNode(fragment);
    range.collapse(false);
  };

  // Insert image block
  const insertImageBlock = async (file, blockId) => {
    const imageBlock = createImageBlock(null, true);

    setBlocks(prev => {
      const index = prev.findIndex(b => b.id === blockId);
      return [
        ...prev.slice(0, index + 1),
        imageBlock,
        ...prev.slice(index + 1),
      ];
    });

    try {
      const url = await uploadToSupabase(file);

      setBlocks(prev =>
        prev.map(b =>
          b.id === imageBlock.id
            ? { ...b, src: url, loading: false }
            : b
        )
      );

      addBlock(); // add empty block after image
    } catch (error) {
      console.error("Image upload failed:", error);
      // Remove the failed image block
      setBlocks(prev => prev.filter(b => b.id !== imageBlock.id));
      alert("Image upload failed");
    }
  };

  // Handle file upload button
  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lastBlockId = blocks[blocks.length - 1].id;
    await insertImageBlock(file, lastBlockId);

    e.target.value = "";
  };

  // Handle paste events
  const handlePaste = async (e, blockId) => {
    e.preventDefault();

    // Handle image if present
    const imageFile = await getImageFromClipboard(e);
    if (imageFile) {
      await insertImageBlock(imageFile, blockId);
      return;
    }

    // Handle text (always plain text)
    const text = e.clipboardData.getData("text/plain");
    if (text) {
      insertPlainText(text);
    }
  };

  // Open links in new tab
  const handleClick = (e) => {
    if (e.target.tagName === "A") {
      e.preventDefault();
      window.open(e.target.href, "_blank");
    }
  };

  // Render editor
  return (
    <div>
      <FloatingToolbar position={toolbarPos} />

      <div className="editor-wrapper">
        {blocks.map(block => (
          <div key={block.id} className="block-row">
            {block.type === "text" && (
              <div
                ref={el => (refs.current[block.id] = el)}
                className="editor"
                contentEditable
                onClick={handleClick}
                suppressContentEditableWarning
                onPaste={e => handlePaste(e, block.id)}
                onKeyDown={e => handleKeyDown(e, block)}
                onInput={() => handleInput(block.id)}
              />
            )}

            {block.type === "image" && (
              <div className="image-block">
                {block.loading ? (
                  <Loader />
                ) : (
                  <img
                    src={block.src}
                    className="editor-image"
                    alt=""
                  />
                )}
              </div>
            )}

            {blocks.length > 1 && (
              <button
                className="delete"
                onClick={() => deleteBlock(block.id)}
                aria-label="Delete block"
              >
                <ion-icon
                  name="close-outline"
                  style={{ fontSize: "1.3rem", color: "red" }}
                />
              </button>
            )}
          </div>
        ))}
      </div>

      <div>
        <button className="add" onClick={addBlock}>
          <ion-icon
            name="add"
            style={{ fontSize: "2rem", color: "white" }}
          />
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleImageSelect}
        />
        <button
          className="add"
          onClick={() => fileInputRef.current?.click()}
        >
          <ion-icon
            name="image-outline"
            style={{ fontSize: "2rem", color: "white" }}
          />
        </button>
      </div>
    </div>
  );
};

const FloatingToolbar = ({ position }) => {
  if (!position) return null;

  const cmd = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  
  const toggleHighlight = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    const getHighlightSpan = (node) => {
      while (node && node !== document) {
        if (
          node.nodeType === 1 &&
          node.tagName === "SPAN" &&
          node.style.backgroundColor === "yellow"
        ) {
          return node;
        }
        node = node.parentNode;
      }
      return null;
    };

    const highlightSpan =
      getHighlightSpan(selection.anchorNode) ||
      getHighlightSpan(selection.focusNode);


    // 🟡 REMOVE highlight
    if (highlightSpan) {
      const parent = highlightSpan.parentNode;

      while (highlightSpan.firstChild) {
        parent.insertBefore(highlightSpan.firstChild, highlightSpan);
      }

      parent.removeChild(highlightSpan);
      return;
    }

    // 🟡 ADD highlight
    try {
      const span = document.createElement("span");
      span.style.backgroundColor = "yellow";
      range.surroundContents(span);
    } catch {
      // fallback for complex selections
      document.execCommand("backColor", false, "yellow");
    }
  };


  return (
    <div
      className="floating-toolbar"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <button onMouseDown={e => { e.preventDefault(); cmd("bold"); }}>
        B
      </button>
      
      <button onMouseDown={e => { e.preventDefault(); cmd("italic"); }}>
        <i>Italic</i>
      </button>
      <button
        onMouseDown={e => {
          e.preventDefault();
           toggleHighlight();
        }}
      >
        🟨
      </button>


      <button onMouseDown={e => { e.preventDefault(); cmd("insertUnorderedList"); }}>
         <ion-icon
              name="list"
              style={{ fontSize: "1.3rem", color: "black" }}
            />
      </button>

      <button
        onMouseDown={e => {
          e.preventDefault();
          const url = prompt("Enter link");
          if (url) cmd("createLink", url);
        }}
      >
        🔗
      </button>
    </div>
  );
};



function TagDropdown({ tags, selectedTagIds, setSelectedTagIds, createTag }) {

  const TAG_COLORS = [
    "#0a8dffff", // Blue
    "#00ff40ff", // Green
    "#FF9F0A", // Orange
    "#ff0d00ff", // Red
    "#aa00ffff",  // Purple
    "#ffdd00ff"
  ]

  const [mode, setMode] = useState("select") // select | create
  const [newTag, setNewTag] = useState("")
  const [newIcon, setNewIcon] = useState("")
  const [newColor, setNewColor] = useState(TAG_COLORS[0])


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

          {/* SELECT MODE */}
          {mode === "select" && (
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

              <button
                className="create-tag"
                onClick={() => setMode("create")}
              >
                + Create tag
              </button>
            </>
          )}

          {/* CREATE MODE */}
          {mode === "create" && (
            <div className="tag-create">
              <input
                placeholder="Tag name"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
              />

              <input
                placeholder="Ionicon name"
                value={newIcon}
                onChange={e => setNewIcon(e.target.value)}
              />

              {/* Color picker */}
              <div className="color-picker">
                {TAG_COLORS.map(color => (
                  <button
                    key={color}
                    style={{ background: color }}
                    className={
                      color === newColor ? "color selected" : "color"
                    }
                    onClick={() => setNewColor(color)}
                  />
                ))}
              </div>

              <div className="create-actions">
                <button onClick={() => setMode("select")}>
                  Cancel
                </button>
                <button
                  className="primary"
                  onClick={async () => {
                    if (!newTag.trim()) return

                    const success = await createTag({
                      tag: newTag,
                      icon: newIcon,
                      color: newColor
                    })

                    if (success) {
                      setNewTag("")
                      setMode("select")
                    }
                  }}
                >
                  Create
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}


function isColorDark(hex) {
  if (!hex) return true

  // Remove #
  hex = hex.replace("#", "")

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Perceived brightness (YIQ)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000

  return yiq < 140 // threshold
}
