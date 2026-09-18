import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Extension } from "@tiptap/core";

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
// RICH TEXT EDITOR
// =====================================================

const RichTextEditor = ({ value, onChange }) => {
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

      Image.configure({
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
    const url = window.prompt(
      "Enter image URL:"
    );

    if (!url || !url.trim()) {
      return;
    }

    editor
      .chain()
      .focus()
      .setImage({
        src: url.trim(),
      })
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

        {/* H1 */}

        <button
          type="button"
          title="Heading 1"
          className={btn(
            editor.isActive("heading", {
              level: 1,
            })
          )}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 1,
              })
              .run()
          }
        >
          H1
        </button>

        {/* H2 */}

        <button
          type="button"
          title="Heading 2"
          className={btn(
            editor.isActive("heading", {
              level: 2,
            })
          )}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 2,
              })
              .run()
          }
        >
          H2
        </button>

        {/* H3 */}

        <button
          type="button"
          title="Heading 3"
          className={btn(
            editor.isActive("heading", {
              level: 3,
            })
          )}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 3,
              })
              .run()
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

        <button
          type="button"
          title="Add Image"
          className={btn()}
          onClick={addImage}
        >
          Image
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