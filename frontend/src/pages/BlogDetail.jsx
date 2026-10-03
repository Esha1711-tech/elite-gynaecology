import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Eye, Tag, User } from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api";
import DOMPurify from "dompurify";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:5000";

const getImageUrl = (image) => {
  if (!image) return null;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return `${API_ORIGIN}${image.startsWith("/") ? image : `/${image}`}`;
};


const upsertMeta = (selector, attributes = {}) => {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
};

const upsertLink = (rel, href) => {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
  return element;
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

  useEffect(() => {
    if (!blog) return undefined;

    const seo = blog.seo || {};
    const fallbackDescription = blog.excerpt || "Read the latest women's health article from Elite Gynaecology.";
    const pageTitle = seo.seoTitle || blog.title || "Elite Gynaecology";
    const description = seo.metaDescription || fallbackDescription;
    const canonicalUrl = seo.canonicalUrl || window.location.href;
    const socialTitle = seo.ogTitle || pageTitle;
    const socialDescription = seo.ogDescription || description;
    const socialImage = getImageUrl(seo.ogImage || blog.featuredImage);

    const previousTitle = document.title;
    document.title = pageTitle;

    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: seo.indexPage === false ? "noindex, nofollow" : "index, follow",
    });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: "article" });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: socialTitle });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: socialDescription });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
    if (socialImage) {
      upsertMeta('meta[property="og:image"]', { property: "og:image", content: socialImage });
    }
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: socialImage ? "summary_large_image" : "summary" });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: socialTitle });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: socialDescription });
    if (socialImage) {
      upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: socialImage });
    }
    upsertLink("canonical", canonicalUrl);

    const schemaId = "blog-seo-jsonld";
    let schemaScript = document.getElementById(schemaId);
    if (!schemaScript) {
      schemaScript = document.createElement("script");
      schemaScript.id = schemaId;
      schemaScript.type = "application/ld+json";
      document.head.appendChild(schemaScript);
    }

    schemaScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": seo.schemaType || "Article",
      headline: pageTitle,
      description,
      image: socialImage || undefined,
      datePublished: blog.createdAt || undefined,
      dateModified: blog.updatedAt || blog.createdAt || undefined,
      author: {
        "@type": "Person",
        name: blog.authorId?.name || blog.authorName || "Dr. Elite Gynaecologist",
      },
      mainEntityOfPage: canonicalUrl,
    });

    return () => {
      document.title = previousTitle;
      document.getElementById(schemaId)?.remove();
    };
  }, [blog]);

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

           <div
  className="
    text-text-dark
    leading-8
    break-words

    [&_h1]:text-3xl
    [&_h1]:font-bold
    [&_h1]:text-accent-navy
    [&_h1]:mt-8
    [&_h1]:mb-4

    [&_h2]:text-2xl
    [&_h2]:font-bold
    [&_h2]:text-accent-navy
    [&_h2]:mt-7
    [&_h2]:mb-3

    [&_h3]:text-xl
    [&_h3]:font-semibold
    [&_h3]:text-accent-navy
    [&_h3]:mt-6
    [&_h3]:mb-3

    [&_p]:mb-4

    [&_ul]:list-disc
    [&_ul]:pl-6
    [&_ul]:mb-4

    [&_ol]:list-decimal
    [&_ol]:pl-6
    [&_ol]:mb-4

    [&_li]:mb-2

    [&_blockquote]:border-l-4
    [&_blockquote]:border-[#CF3650]
    [&_blockquote]:pl-4
    [&_blockquote]:italic

    [&_a]:text-[#CF3650]
    [&_a]:underline

    [&_strong]:font-bold
  "
  dangerouslySetInnerHTML={{
    __html:
      DOMPurify.sanitize(
        blog.content || ""
      ),
  }}
/>
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogDetail;
