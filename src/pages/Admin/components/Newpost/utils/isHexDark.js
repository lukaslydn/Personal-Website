export function isHexDark(hex) {
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
};

// Export the isHexDark function for use in other parts of the application
// import { isHexDark } from "../utils/isHexDark";
// Example usage:
// const color = "#ff0000";
// const isDark = isHexDark(color);
// console.log(isDark); // Output: false (red is not dark)