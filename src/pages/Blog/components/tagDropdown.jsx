import { useState } from "react"


import { isHexDark } from "../../Admin/components/Newpost/utils/isHexDark"


export function TagDropdown({ tags, selectedTagIds, setSelectedTagIds}) {

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
                      color: isHexDark(tag.color) ? "#fff" : "#111"
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
