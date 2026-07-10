import { useEffect, useRef } from "react";
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
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  Link as LinkIcon, Image as ImageIcon, Table as TableIcon, Quote,
} from "lucide-react";
import APICall from "../../../../../APICalls/APICall";
import "./RichResponseEditor.css";

const VARIABLES = ["{user_name}", "{product_name}", "{current_time}", "{balance}"];

const ToolBtn = ({ onClick, active, title, children }) => (
  <button
    type="button"
    title={title}
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className={`btn btn-sm ${active ? "btn-primary" : "btn-light"}`}
  >
    {children}
  </button>
);

/**
 * Rich response editor for intent responses. Produces sanitizable HTML
 * (response_format = "html") supporting bold/italic/underline, headings, lists,
 * links, tables and uploaded images. Images are uploaded to the backend and
 * embedded by URL (not base64) via POST /intents/response-image.
 */
const RichResponseEditor = ({ value, onChange }) => {
  const fileRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Keep the editor in sync when the parent swaps responses (e.g. edit mode).
  useEffect(() => {
    if (editor && value !== undefined && editor.getHTML() !== value) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) return null;

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await APICall.postfileT("/intents/response-image", fd);
      if (res?.url) editor.chain().focus().setImage({ src: res.url }).run();
    } catch (err) {
      alert(err.message || "Image upload failed");
    }
  };

  return (
    <div className="border rounded mb-2">
      {/* TOOLBAR */}
      <div className="d-flex flex-wrap gap-1 p-1 border-bottom bg-light">
        <ToolBtn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={14} /></ToolBtn>
        <ToolBtn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={14} /></ToolBtn>
        <ToolBtn title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={14} /></ToolBtn>
        <ToolBtn title="Heading" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H</ToolBtn>
        <ToolBtn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={14} /></ToolBtn>
        <ToolBtn title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={14} /></ToolBtn>
        <ToolBtn title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={14} /></ToolBtn>
        <ToolBtn
          title="Link"
          active={editor.isActive("link")}
          onClick={() => {
            const url = prompt("Enter link URL");
            if (url) editor.chain().focus().setLink({ href: url }).run();
            else editor.chain().focus().unsetLink().run();
          }}
        ><LinkIcon size={14} /></ToolBtn>
        <ToolBtn title="Insert image" onClick={() => fileRef.current?.click()}><ImageIcon size={14} /></ToolBtn>
        <ToolBtn title="Insert table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><TableIcon size={14} /></ToolBtn>

        <select
          className="form-select form-select-sm w-auto ms-auto"
          value=""
          onChange={(e) => {
            if (e.target.value) editor.chain().focus().insertContent(e.target.value).run();
            e.target.value = "";
          }}
        >
          <option value="">Insert Variable</option>
          {VARIABLES.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>

        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          hidden
          onChange={uploadImage}
        />
      </div>

      {/* EDITOR */}
      <EditorContent editor={editor} className="tiptap-editor p-2" />
    </div>
  );
};

export default RichResponseEditor;
