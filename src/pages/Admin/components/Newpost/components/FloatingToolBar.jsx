
const FloatingToolbar = ({ position }) => {
  if (!position) return null;

  const cmd = (command, value = null) => {
    document.execCommand(command, false, value);
  }; // Helper function to execute formatting commands on the selected text using the deprecated execCommand API. This is a simple way to implement basic rich text formatting, but it has limitations and may not work perfectly in all cases, which is why we have some fallback logic in the toggleHighlight function.
  // FIX IN FUTURE: Consider replacing execCommand with a more robust solution for better formatting control and compatibility.
  // Better more reliable approach needed for complex editing features and to avoid issues and inconsistencies and messy output
  
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
      span.className = "highlight";
      range.surroundContents(span);
    } catch {
      // fallback for complex selections
      document.execCommand("backColor", false, "yellow");
    }
  }; // Dodgey


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

export default FloatingToolbar;


