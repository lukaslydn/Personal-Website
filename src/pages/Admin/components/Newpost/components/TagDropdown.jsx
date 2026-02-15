
import { useState, useEffect } from "react";

import { supabase } from "../../../../../supabase-client";
import { isHexDark } from "../utils/isHexDark";
import { loadTags } from "../api/loadTags"

function TagDropdown({ selectedTagIds, setSelectedTagIds }) {

  // ===================== States ====================
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
  const [tags, setTags] = useState([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    handleLoadTags()
  }, [])


  // ===================== Handlers ====================
  // This function loads all tags from the database and sets the tags state. It's called when the component mounts and after creating or deleting a tag to refresh the list.
  const handleLoadTags = async () => {
    const result = await loadTags()
    if (result.error) {
      alert(result.error)
      return
    }

    setTags(result)
  }
  // This function creates a new tag in the database using the values from the newTag, newIcon, and newColor states. After creating the tag, it reloads the tags to update the list.
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

    await handleLoadTags()
    return true
  }


  async function deleteTag(id) {
    if (!window.confirm("Are you sure you want to delete this tag? Will remove from all posts permently")) return

    const { error } = await supabase.from("tags").delete().eq("id", id) // Deletes the tag with the given id from the "tags" table in the database using Supabase
    if (error) {
      alert(error.message)
    } else {
      setSelectedTagIds(prev => prev.filter(t => t !== id)) // If the deleted tag was selected, we also remove it from the selectedTagIds state to update the UI
      handleLoadTags()
   }
  }


  // Adds the selected tag to the selectedTagIds state if it's not already there, and then closes the dropdown menu. This function is called when the user clicks on a tag in the dropdown to select it.
  function selectTag(id) {
    setSelectedTagIds(prev =>
      prev.includes(id) ? prev : [...prev, id]
    )
    setIsOpen(false) // ⬅️ close menu on select
  }

  // Removes the tag from the selectedTags
  function removeTag(id) {
    setSelectedTagIds(prev =>
      prev.filter(t => t !== id)
    )
  }



  return (
    <div className="tag-select">
      {/* Selected pills */}
      <div className="tag-pills">
        {selectedTagIds.map(id => { // For each selected tag id, we find the corresponding tag object from the tags state to display its name and color in the UI
          const tag = tags.find(t => t.id === id)
          if (!tag) return null

          return ( // Each selected tag is displayed as a pill with its name and a close icon to remove it from the selection. The background color of the pill is set to the tag's color, and the text color is determined based on whether the color is dark or light for better readability.
            <span
              key={id}
              className="tag-pill"
              style={{ "--tag-bg": tag.color, color: isHexDark(tag.color) ? "#fff" : "#111" }}
              onClick={() => removeTag(id)}
            >
              {tag.icon && <ion-icon name={tag.icon} />}
              {tag.tag}
              <ion-icon name="close" />
            </span>
          )
        })}
      </div>

      {/* Toggle button to open/close the tag dropdown */}
      <button
        type="button"
        className="tag-toggle"
        onClick={() => setIsOpen(o => !o)}
      >
        {isOpen ? "Close tags" : "Add tags"}
      </button>

      {/* Floating dropdown for tag selection and creation */}
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
                    style={{ "--tag-bg": tag.color, color: isHexDark(tag.color) ? "#fff" : "#111" }}
                  >
                    {tag.icon && <ion-icon name={tag.icon} />}
                    <span>{tag.tag}</span>
                    <button className="delete-tag" onClick={(e) => { e.stopPropagation(); deleteTag(tag.id); }}>
                      <ion-icon name="trash-outline" />
                    </button>
                  </div>
                ))}

              {/* Button to switch to create mode */}
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
              {/* Input for new tag name */}
              <input
                placeholder="Tag name"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
              />

              {/* Input for new icon name */}
              <input
                placeholder="Ionicon name"
                value={newIcon}
                onChange={e => setNewIcon(e.target.value)}
              />
              <a href="https://ionic.io/ionicons" target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.8rem", marginLeft: "10px", color: "#007bff", textDecoration: "underline" }}>
                Browse icons
              </a>

              {/* Color picker for selecting tag color */}
              <div className="color-picker">
                {TAG_COLORS.map(color => (
                  <button
                    key={color}
                    style={{ background: color }}
                    className={color === newColor ? "color selected" : "color"}
                    onClick={() => setNewColor(color)}
                  />
                ))}
              </div>

              {/* Actions for creating or canceling the new tag */}
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
};

export default TagDropdown;


