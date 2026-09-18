import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// import { Calendar, ArrowRight, BookOpen } from "lucide-react";
import { ArrowRight, BookOpen } from "lucide-react";
import api from "../utils/api";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/blog")
      .then((res) => setBlogs(res.data.blogs || res.data || []))
      .catch((err) => console.error("Blog error:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-primary-light">
     <section className="w-full bg-white border-b border-secondary-sage">
  <div className="w-full">
    <img
      src="/blog_banner.png"
      alt="Women's Health Journal"
      className="block w-full h-auto object-cover"
    />
  </div>
</section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <p className="text-center py-16 text-text-light">Loading articles...</p>
        ) : blogs.length === 0 ? (
          <p className="text-center py-16 text-text-light">No published articles yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
  <Link
    key={blog._id}
    to={`/blog/${blog.slug}`}
    className="block h-full"
  >
    <article
      className="
        h-full
        bg-white
        rounded-2xl
        overflow-hidden
        border
        border-slate-100
        shadow-sm
        hover:shadow-lg
        hover:-translate-y-1
        transition-all
        duration-300
        cursor-pointer
      "
    >
      {blog.featuredImage && (
        <img
          src={blog.featuredImage}
          alt={blog.title}
          className="w-full h-52 object-cover"
        />
      )}

      <div className="p-5">
        <p className="text-sm text-[#CF3650] font-semibold mb-2">
          {blog.category}
        </p>

        <h2 className="text-xl font-bold text-accent-navy">
          {blog.title}
        </h2>

        {blog.excerpt && (
          <p className="mt-3 text-text-light line-clamp-3">
            {blog.excerpt}
          </p>
        )}

        <div className="mt-5 font-semibold text-[#CF3650]">
          Read Article →
        </div>
      </div>
    </article>
  </Link>
))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Blog;
