import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Eye, Tag, User } from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:5000";

const getImageUrl = (image) => {
  if (!image) return null;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return `${API_ORIGIN}${image.startsWith("/") ? image : `/${image}`}`;
};

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/blog/${encodeURIComponent(slug)}`);
        setBlog(res.data?.blog || null);
      } catch (err) {
        console.error("Blog detail error:", err);
        toast.error(err.response?.data?.message || "Unable to load blog.");
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchBlog();
  }, [slug]);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center">Loading article...</div>;

  if (!blog) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-2xl font-bold text-accent-navy">Blog not found</h1>
        <Link to="/blog" className="btn-primary">Back to Blog</Link>
      </div>
    );
  }

  const author = blog.authorId?.name || blog.authorName || "Dr. Elite Gynaecologist";
  const imageUrl = getImageUrl(blog.featuredImage);

  return (
    <div className="min-h-screen bg-primary-light py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/blog" className="inline-flex items-center gap-2 text-accent-navy mb-8 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>

        <article className="bg-white rounded-2xl shadow-card overflow-hidden">
          {imageUrl && (
            <img src={imageUrl} alt={blog.title} className="w-full h-64 md:h-96 object-cover" />
          )}

          <div className="p-6 md:p-10">
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-light mb-5">
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : ""}</span>
              <span className="flex items-center gap-1"><User className="h-4 w-4" /> {author}</span>
              <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {blog.views || 0} views</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-accent-navy mb-6">{blog.title}</h1>

            <div className="flex flex-wrap gap-2 mb-8">
              {blog.category && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-sage text-accent-navy text-sm rounded-full">
                  <Tag className="h-3 w-3" /> {blog.category}
                </span>
              )}
              {Array.isArray(blog.tags) && blog.tags.map((tag, idx) => (
                <span key={`${tag}-${idx}`} className="px-3 py-1 bg-secondary-pink text-accent-navy text-sm rounded-full">{tag}</span>
              ))}
            </div>

            {blog.excerpt && <p className="text-lg text-text-light leading-8 mb-8">{blog.excerpt}</p>}

            <div className="text-text-dark leading-8 whitespace-pre-wrap break-words">{blog.content}</div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogDetail;
