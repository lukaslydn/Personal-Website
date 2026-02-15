import { Routes, Route, Link } from "react-router-dom"
import Home from "./pages/Home"
import Blog from "./pages/Blog/Blog.jsx"
import Projects from "./pages/Projects.jsx"
import Admin from "./pages/Admin/Admin.jsx"
import PostPage from "./pages/postPage.jsx"
import BottomModal from "./components/bottomModal.jsx"
import NotFoundPage from "./components/notfoundpage.jsx"
import NavBar from "./components/NavBar.jsx"


export default function App() {
  return (
    <div className="app-layout">
      <NavBar />

      <main className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/posts/:slug" element={<PostPage />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <BottomModal />
    </div>
  )
}

