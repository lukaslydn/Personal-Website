export function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Export the wordCount function for use in other parts of the application
// import { wordCount } from "../utils/wordcount";
// Example usage:
// const content = "Hello world! This is a test.";
// const count = wordCount(content);
// console.log(count); // Output: 6