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
      <section className="bg-white py-14 md:py-20 border-b border-secondary-sage">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <span className="section-label"><BookOpen className="w-4 h-4" /> Women's Health Journal</span>
          <h1 className="mt-5 text-4xl md:text-5xl font-bold text-accent-navy">Expert Women's Health Insights</h1>
          <p className="mt-4 max-w-2xl mx-auto text-text-light leading-7">
            Helpful, easy-to-understand articles from our single-doctor gynaecology practice.
          </p>
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
              <article key={blog._id} className="bg-white rounded-2xl overflow-hidden shadow-card border border-slate-100 flex flex-col">
                {blog.featuredImage && (
                  <img src={blog.featuredImage} alt={blog.title} className="w-full h-52 object-cover" />
                )}
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-xs font-semibold text-accent-sage">{blog.category}</span>
                  <h2 className="mt-2 text-xl font-bold text-accent-navy leading-7">{blog.title}</h2>
                  <p className="mt-3 text-sm text-text-light leading-6 flex-1">{blog.excerpt}</p>
                  <div className="mt-5 flex items-center justify-between text-xs text-text-light">
                    {/* <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(blog.createdAt).toLocaleDateString()}</span> */}
                    <span className="flex items-center gap-1">
  <BookOpen className="w-4 h-4" />
  {blog.authorName || "Dr. Elite Gynaecologist"}
</span>
                    <Link to={`/blog/${blog.slug}`} className="inline-flex items-center gap-1 text-accent-navy font-semibold hover:text-accent-sage">
                      Read <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Blog;
