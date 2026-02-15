

import { isHexDark } from "../../Admin/components/Newpost/utils/isHexDark"


export function renderTagPills(allTags, postTagIds) {
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
            color: isHexDark(tag.color) ? "#fff" : "#111"
          }}
        >
          {tag.icon && <ion-icon name={tag.icon} />}
          {tag.tag}
        </span>
      )
    })
    .filter(Boolean)
}

