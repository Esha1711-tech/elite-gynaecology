import { useEffect, useRef, useState } from "react";
import { EditorContent, NodeViewWrapper, ReactNodeViewRenderer, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Extension } from "@tiptap/core";
import api from "../utils/api";

// =====================================================
// CUSTOM FONT SIZE EXTENSION
// =====================================================

const FontSize = Extension.create({
  name: "fontSize",

  addOptions() {
    return {
      types: ["textStyle"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,

        attributes: {
          fontSize: {
            default: null,

            parseHTML: (element) =>
              element.style.fontSize || null,

            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }

              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) => {
          return chain()
            .setMark("textStyle", { fontSize })
            .run();
        },

      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain()
            .setMark("textStyle", {
              fontSize: null,
            })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});

// =====================================================
// IMAGE NODE VIEW WITH REMOVE BUTTON
// =====================================================

const ImageWithRemove = ({ node, deleteNode, selected }) => {
  return (
    <NodeViewWrapper className="my-5">
      <div
        className={`relative inline-block max-w-full rounded-xl ${
          selected ? "ring-2 ring-accent-navy ring-offset-2" : ""
        }`}
      >
        <img
          src={node.attrs.src}
          alt={node.attrs.alt || ""}
          title={node.attrs.title || ""}
          className="block max-w-full h-auto rounded-xl"
          draggable="false"
        />

        <button
          type="button"
          title="Remove image"
          aria-label="Remove image"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            deleteNode();
          }}
          className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-lg font-bold leading-none text-white shadow-md transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          ×
        </button>
      </div>
    </NodeViewWrapper>
  );
};

const RemovableImage = Image.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ImageWithRemove);
  },
});

// =====================================================
// RICH TEXT EDITOR
// =====================================================

const RichTextEditor = ({ value, onChange }) => {
  const imageInputRef = useRef(null);
  const imageInsertPositionRef = useRef(null);
  const [imageUploading, setImageUploading] = useState(false);

  const getMediaUrl = (url) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;

    const apiBase =
      api.defaults.baseURL ||
      import.meta.env.VITE_API_URL ||
      "http://localhost:5000/api";

    const backendOrigin = apiBase.replace(/\/api\/?$/, "");
    return `${backendOrigin}${url.startsWith("/") ? url : `/${url}`}`;
  };

  const editor = useEditor({
    extensions: [
      // Disable these here because we add/configure them separately below
      StarterKit.configure({
        link: false,
        underline: false,
      }),

      Underline,

      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),

      TextStyle,

      FontSize,

      RemovableImage.configure({
        inline: false,
        allowBase64: true,
      }),

      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],

    content: value || "",

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },

    editorProps: {
      attributes: {
        // Keep this as ONE LINE.
        // Multiline class strings can cause DOMTokenList errors in Tiptap.
        class:
          "min-h-[300px] p-4 outline-none bg-white text-slate-700 leading-7 [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:text-accent-navy [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:leading-tight [&_h2]:text-accent-navy [&_h2]:mt-5 [&_h2]:mb-3 [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:text-accent-navy [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:my-2 [&_strong]:font-bold [&_ul]:list-disc [&_ul]:pl-8 [&_ul]:my-4 [&_ol]:list-decimal [&_ol]:pl-8 [&_ol]:my-4 [&_li]:my-1 [&_li_p]:my-0 [&_blockquote]:border-l-4 [&_blockquote]:border-secondary-sage [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_a]:text-blue-600 [&_a]:underline [&_a]:cursor-pointer [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_img]:my-5",
      },
    },
  });

  // =====================================================
  // SYNC VALUE WHEN EDITING EXISTING BLOG
  // =====================================================

  useEffect(() => {
    if (!editor) return;

    const currentContent = editor.getHTML();
    const newContent = value || "";

    if (newContent !== currentContent) {
      editor.commands.setContent(newContent);
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="min-h-[300px] p-4 border border-slate-200 rounded-xl bg-white text-text-light">
        Loading editor...
      </div>
    );
  }

  // =====================================================
  // ADD IMAGE
  // =====================================================

  const addImage = () => {
    imageInsertPositionRef.current =
      editor.state.selection.from;

    imageInputRef.current?.click();
  };

  const addImageByUrl = () => {
    const url = window.prompt("Enter image URL:");

    if (url === null) return;

    const cleanUrl = url.trim();

    if (!cleanUrl) {
      window.alert("Please enter an image URL.");
      return;
    }

    editor
      .chain()
      .focus()
      .setImage({ src: cleanUrl })
      .run();
  };

  const handleEditorImageUpload = async (e) => {
    const input = e.target;
    const file = input.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      window.alert(
        "Please select a JPG, PNG or WEBP image."
      );
      input.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      window.alert(
        "Image size must not exceed 5 MB."
      );
      input.value = "";
      return;
    }

    setImageUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await api.post(
        "/blog/upload-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const imageUrl = res.data?.imageUrl;

      if (!imageUrl) {
        throw new Error(
          "Image URL was not returned by the server."
        );
      }

      const position =
        imageInsertPositionRef.current ??
        editor.state.selection.from;

      editor
        .chain()
        .focus()
        .insertContentAt(position, {
          type: "image",
          attrs: {
            src: getMediaUrl(imageUrl),
          },
        })
        .run();
    } catch (error) {
      console.error(
        "Rich text image upload error:",
        error
      );

      window.alert(
        error.response?.data?.message ||
          error.message ||
          "Unable to upload image."
      );
    } finally {
      setImageUploading(false);
      imageInsertPositionRef.current = null;
      input.value = "";
    }
  };

  const applyInlineHeading = (fontSize) => {
    editor
      .chain()
      .focus()
      .setFontSize(fontSize)
      .setBold()
      .run();
  };

  // =====================================================
  // ADD / REMOVE LINK
  // =====================================================

  const addLink = () => {
    const previousUrl =
      editor.getAttributes("link").href || "";

    const url = window.prompt(
      "Enter link URL:",
      previousUrl
    );

    if (url === null) {
      return;
    }

    // Empty URL removes existing link
    if (url.trim() === "") {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .unsetLink()
        .run();

      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: url.trim(),
      })
      .run();
  };

  // =====================================================
  // TOOLBAR BUTTON STYLE
  // =====================================================

  const btn = (active = false) => {
    return `min-w-[42px] px-3 py-2 rounded-lg text-sm font-semibold border transition ${
      active
        ? "bg-accent-navy text-white border-accent-navy"
        : "bg-white text-accent-navy border-slate-200 hover:bg-slate-100"
    }`;
  };

  // =====================================================
  // EDITOR UI
  // =====================================================

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">

      {/* =================================================
          TOOLBAR
      ================================================= */}

      <div className="flex flex-wrap items-center gap-2 p-3 border-b border-slate-200 bg-slate-50">

        {/* BOLD */}

        <button
          type="button"
          title="Bold"
          className={btn(
            editor.isActive("bold")
          )}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBold()
              .run()
          }
        >
          <strong>B</strong>
        </button>

        {/* ITALIC */}

        <button
          type="button"
          title="Italic"
          className={btn(
            editor.isActive("italic")
          )}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleItalic()
              .run()
          }
        >
          <em>I</em>
        </button>

        {/* UNDERLINE */}

        <button
          type="button"
          title="Underline"
          className={btn(
            editor.isActive("underline")
          )}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleUnderline()
              .run()
          }
        >
          <u>U</u>
        </button>

        {/* H1 - selected text only */}

        <button
          type="button"
          title="Heading 1 (selected text)"
          className={btn(
            editor.isActive("textStyle", {
              fontSize: "36px",
            }) && editor.isActive("bold")
          )}
          onClick={() =>
            applyInlineHeading("36px")
          }
        >
          H1
        </button>

        {/* H2 - selected text only */}

        <button
          type="button"
          title="Heading 2 (selected text)"
          className={btn(
            editor.isActive("textStyle", {
              fontSize: "28px",
            }) && editor.isActive("bold")
          )}
          onClick={() =>
            applyInlineHeading("28px")
          }
        >
          H2
        </button>

        {/* H3 - selected text only */}

        <button
          type="button"
          title="Heading 3 (selected text)"
          className={btn(
            editor.isActive("textStyle", {
              fontSize: "22px",
            }) && editor.isActive("bold")
          )}
          onClick={() =>
            applyInlineHeading("22px")
          }
        >
          H3
        </button>

        {/* =================================================
            FONT SIZE
        ================================================= */}

        <select
          className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-accent-navy outline-none"
          defaultValue=""
          onChange={(e) => {
            const size = e.target.value;

            if (!size) {
              editor
                .chain()
                .focus()
                .unsetFontSize()
                .run();

              return;
            }

            editor
              .chain()
              .focus()
              .setFontSize(size)
              .run();
          }}
        >
          <option value="">
            Font Size
          </option>

          <option value="14px">
            Small
          </option>

          <option value="16px">
            Normal
          </option>

          <option value="18px">
            Medium
          </option>

          <option value="22px">
            Large
          </option>

          <option value="28px">
            Extra Large
          </option>

          <option value="36px">
            Heading Large
          </option>
        </select>

        {/* =================================================
            LISTS
        ================================================= */}

        <button
          type="button"
          title="Bullet List"
          className={btn(
            editor.isActive("bulletList")
          )}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBulletList()
              .run()
          }
        >
          • List
        </button>

        <button
          type="button"
          title="Numbered List"
          className={btn(
            editor.isActive("orderedList")
          )}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleOrderedList()
              .run()
          }
        >
          1. List
        </button>

        {/* =================================================
            ALIGNMENT
        ================================================= */}

        <button
          type="button"
          title="Align Left"
          className={btn(
            editor.isActive({
              textAlign: "left",
            })
          )}
          onClick={() =>
            editor
              .chain()
              .focus()
              .setTextAlign("left")
              .run()
          }
        >
          Left
        </button>

        <button
          type="button"
          title="Align Center"
          className={btn(
            editor.isActive({
              textAlign: "center",
            })
          )}
          onClick={() =>
            editor
              .chain()
              .focus()
              .setTextAlign("center")
              .run()
          }
        >
          Center
        </button>

        <button
          type="button"
          title="Align Right"
          className={btn(
            editor.isActive({
              textAlign: "right",
            })
          )}
          onClick={() =>
            editor
              .chain()
              .focus()
              .setTextAlign("right")
              .run()
          }
        >
          Right
        </button>

        {/* =================================================
            LINK
        ================================================= */}

        <button
          type="button"
          title="Add Link"
          className={btn(
            editor.isActive("link")
          )}
          onClick={addLink}
        >
          Link
        </button>

        {/* =================================================
            IMAGE
        ================================================= */}

        <input
          ref={imageInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          onChange={handleEditorImageUpload}
          className="hidden"
        />

        <button
          type="button"
          title="Upload Image from Device"
          className={`${btn()} disabled:opacity-50 disabled:cursor-not-allowed`}
          onClick={addImage}
          disabled={imageUploading}
        >
          {imageUploading ? "Uploading..." : "Upload Image"}
        </button>

        <button
          type="button"
          title="Add Image by URL"
          className={btn()}
          onClick={addImageByUrl}
          disabled={imageUploading}
        >
          Image URL
        </button>

        {/* =================================================
            UNDO / REDO
        ================================================= */}

        <button
          type="button"
          title="Undo"
          disabled={!editor.can().undo()}
          className={`${btn()} disabled:opacity-40 disabled:cursor-not-allowed`}
          onClick={() =>
            editor
              .chain()
              .focus()
              .undo()
              .run()
          }
        >
          ↶
        </button>

        <button
          type="button"
          title="Redo"
          disabled={!editor.can().redo()}
          className={`${btn()} disabled:opacity-40 disabled:cursor-not-allowed`}
          onClick={() =>
            editor
              .chain()
              .focus()
              .redo()
              .run()
          }
        >
          ↷
        </button>

      </div>

      {/* =================================================
          EDITOR CONTENT
      ================================================= */}

      <EditorContent editor={editor} />

    </div>
  );
};

export default RichTextEditor;