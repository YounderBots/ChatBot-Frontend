import DOMPurify from "dompurify";
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

import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code2,
  Heading2, Heading3, Heading4, List, ListOrdered, Link as LinkIcon,
  Image as ImageIcon, Quote, Table as TableIcon, Code, Minus,
  Undo2, Redo2,
} from "lucide-react";

import "./ArticleContentSection.css";

/* Toolbar button — keeps editor focus (onMouseDown preventDefault) and shows an
   active state so writers can see which formatting is applied. */
const TbBtn = ({ onClick, active, disabled, title, children }) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    className={active ? "active" : ""}
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
  >
    {children}
  </button>
);

const TbDivider = () => <span className="tb-divider" aria-hidden="true" />;

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
          {/* Inline formatting */}
          <TbBtn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={15} /></TbBtn>
          <TbBtn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={15} /></TbBtn>
          <TbBtn title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={15} /></TbBtn>
          <TbBtn title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={15} /></TbBtn>
          <TbBtn title="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}><Code2 size={15} /></TbBtn>

          <TbDivider />

          {/* Headings */}
          <TbBtn title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={15} /></TbBtn>
          <TbBtn title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={15} /></TbBtn>
          <TbBtn title="Heading 4" active={editor.isActive("heading", { level: 4 })} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}><Heading4 size={15} /></TbBtn>

          <TbDivider />

          {/* Blocks */}
          <TbBtn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={15} /></TbBtn>
          <TbBtn title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={15} /></TbBtn>
          <TbBtn title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={15} /></TbBtn>
          <TbBtn title="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code size={15} /></TbBtn>
          <TbBtn title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={15} /></TbBtn>

          <TbDivider />

          {/* Insert */}
          <TbBtn
            title="Link"
            active={editor.isActive("link")}
            onClick={() => {
              const prev = editor.getAttributes("link")?.href || "";
              const url = prompt("Enter link URL", prev);
              if (url === null) return;
              if (url === "") editor.chain().focus().unsetLink().run();
              else editor.chain().focus().setLink({ href: url }).run();
            }}
          ><LinkIcon size={15} /></TbBtn>
          <TbBtn
            title="Image"
            onClick={() => {
              const url = prompt("Enter image URL");
              if (url) editor.chain().focus().setImage({ src: url }).run();
            }}
          ><ImageIcon size={15} /></TbBtn>
          <TbBtn
            title="Insert table"
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          ><TableIcon size={15} /></TbBtn>

          <TbDivider />

          {/* History */}
          <TbBtn title="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}><Undo2 size={15} /></TbBtn>
          <TbBtn title="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}><Redo2 size={15} /></TbBtn>
        </div>
      )}

      {/* EDITOR / PREVIEW */}
      {!preview ? (
        <EditorContent editor={editor} className="tiptap-editor" />
      ) : (
        <div
          className="content-preview"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(form.content || "<p>No content</p>"),
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
