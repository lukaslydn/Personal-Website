import { Routes, Route, Link } from "react-router-dom"
import Home from "./pages/Home"
import Blog from "./pages/Blog"
import Projects from "./pages/Projects.jsx"
import Admin from "./pages/Admin.jsx"
import PostPage from "./pages/postPage.jsx"

import NavBar from "./components/NavBar.jsx"

export default function App() {
  return (
    <>
      <NavBar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/posts/:slug" element={<PostPage />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </>
  )
}
