export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}


// Export the slugify function for use in other parts of the application
// import { slugify } from "../utils/slugify";
// Example usage:
// const title = "Hello World! This is a Test.";
// const slug = slugify(title);
// console.log(slug); // Output: "hello-world-this-is-a-test"