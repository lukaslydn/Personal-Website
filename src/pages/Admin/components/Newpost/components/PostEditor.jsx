import { useState, useRef, useEffect } from "react";

import FloatingToolbar from "./FloatingToolBar";
import { uploadFileToSupabase } from "../api/uploadFileToSupabase";

import Loader from "../../../../../components/Loading";

// Utility functions to create new blocks
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

  // ===================== States & Refs =====================
  const [toolbarPos, setToolbarPos] = useState(null);
  const [blocks, setBlocks] = useState([createBlock()]);
  const refs = useRef({}); // Refs for each block to manage focus and content
  const wrapperRef = useRef(null); // Ref for the editor wrapper to check if selection is inside the editor
  const fileInputRef = useRef(null); // Ref for the hidden file input to trigger it programmatically

  useEffect(() => {
    if (resetTrigger > 0) {
      setBlocks([createBlock()]);
      setToolbarPos(null);
    }
  }, [resetTrigger]); // Resets the editor to a single empty block when resetTrigger changes, which is triggered from the parent component when a new post is created or after publishing to clear the editor for the next post.


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
    const container = range.commonAncestorContainer;

    // Convert text node to element node if needed
    const elementNode =
      container.nodeType === 1 ? container : container.parentNode;

    // 🚨 Important check
    if (!wrapperRef.current?.contains(elementNode)) { // If the selection is outside the editor, we hide the toolbar and exit the function early to prevent it from showing up in the wrong place.
      setToolbarPos(null);
      return;
    }

    const rect = range.getBoundingClientRect();

    setToolbarPos({
      top: rect.top + window.scrollY - 40,
      left: rect.left + rect.width / 2,
    });
  };


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

  // Insert plain text at cursor (no styles)
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



  // Insert image block (helper function)
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
      const imageUrl = await uploadFileToSupabase(file);

      setBlocks(prev =>
        prev.map(b =>
          b.id === imageBlock.id
            ? { ...b, src: imageUrl, loading: false }
            : b
        )
      );

      addBlock(); // add empty block after image
    } catch (error) {
      console.error("Image upload failed:", error.message || error);
      setBlocks(prev => prev.filter(b => b.id !== imageBlock.id));
      alert("Image upload failed");
    }
  };

  // Handle file upload button / direct paste
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

      <div className="editor-wrapper" ref={wrapperRef}>
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

export default PostEditor;


