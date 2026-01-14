import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";

import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";


const ArticleContentSection = ({ form, setForm }) => {
  const [preview, setPreview] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: form.content || "",
    onUpdate: ({ editor }) => {
      setForm((prev) => ({
        ...prev,
        content: editor.getHTML(),
      }));
    },
  });

  /* Sync editor when editing existing article */
  useEffect(() => {
    if (editor && form.content && editor.getHTML() !== form.content) {
      editor.commands.setContent(form.content);
    }
  }, [form.content, editor]);

  if (!editor) return null;

  const wordCount = editor
    .getText()
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <section className="content-section">
      {/* HEADER */}
      <div className="content-header">
        <h4>Content</h4>

        <div className="content-toggle">
          <button
            type="button"
            className={!preview ? "active" : ""}
            onClick={() => setPreview(false)}
          >
            Edit
          </button>
          <button
            type="button"
            className={preview ? "active" : ""}
            onClick={() => setPreview(true)}
          >
            Preview
          </button>
        </div>
      </div>

      {/* TOOLBAR */}
      {!preview && (
        <div className="editor-toolbar">
          <button onClick={() => editor.chain().focus().toggleBold().run()}>
            B
          </button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()}>
            I
          </button>
          <button onClick={() => editor.chain().focus().toggleUnderline().run()}>
            U
          </button>

          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            H2
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            H3
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 4 }).run()
            }
          >
            H4
          </button>

          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            • List
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            1. List
          </button>

          <button
            onClick={() => {
              const url = prompt("Enter link URL");
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
          >
            Link
          </button>

          <button
            onClick={() => {
              const url = prompt("Enter image URL");
              if (url) {
                editor.chain().focus().setImage({ src: url }).run();
              }
            }}
          >
            Image
          </button>

          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            Code
          </button>

          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            Quote
          </button>

          <button
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
          >
            Table
          </button>
        </div>
      )}

      {/* EDITOR / PREVIEW */}
      {!preview ? (
        <EditorContent editor={editor} className="tiptap-editor" />
      ) : (
        <div
          className="content-preview"
          dangerouslySetInnerHTML={{
            __html: form.content || "<p>No content</p>",
          }}
        />
      )}

      {/* FOOTER */}
      <div className="content-footer">
        Word count: {wordCount}
      </div>
    </section>
  );
};

export default ArticleContentSection;
