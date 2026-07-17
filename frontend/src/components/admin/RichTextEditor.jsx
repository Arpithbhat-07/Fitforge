import React, { useRef, useEffect } from "react";
import { Bold, Italic, List, ListOrdered, Link, Image, Heading1, Heading2, Heading3 } from "lucide-react";

export default function RichTextEditor({ label, value, onChange }) {
  const editorRef = useRef(null);

  // Synchronize editor innerHTML with external value only when they differ
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const exec = (command, arg = null) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const addLink = () => {
    const url = prompt("Enter hyperlink URL:");
    if (url) exec("createLink", url);
  };

  const addImage = () => {
    const url = prompt("Enter image URL:");
    if (url) exec("insertImage", url);
  };

  return (
    <div className="flex flex-col border border-[#2A2A2A] rounded-md overflow-hidden bg-[#171717] md:col-span-2">
      <label className="text-xs uppercase tracking-widest text-[#8A8A8A] px-4 pt-3 font-semibold block">{label}</label>
      <div className="flex flex-wrap items-center gap-1 border-b border-[#2A2A2A] p-2 bg-[#0B0B0B]">
        <button
          type="button"
          onClick={() => exec("bold")}
          className="p-1.5 hover:bg-[#171717] rounded text-white transition-colors"
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => exec("italic")}
          className="p-1.5 hover:bg-[#171717] rounded text-white transition-colors"
          title="Italic"
        >
          <Italic size={16} />
        </button>
        
        <div className="w-px h-5 bg-[#2A2A2A] mx-1" />
        
        <button
          type="button"
          onClick={() => exec("formatBlock", "<h1>")}
          className="p-1.5 hover:bg-[#171717] rounded text-white transition-colors font-bold"
          title="Heading 1"
        >
          <Heading1 size={16} />
        </button>
        <button
          type="button"
          onClick={() => exec("formatBlock", "<h2>")}
          className="p-1.5 hover:bg-[#171717] rounded text-white transition-colors font-semibold"
          title="Heading 2"
        >
          <Heading2 size={16} />
        </button>
        <button
          type="button"
          onClick={() => exec("formatBlock", "<h3>")}
          className="p-1.5 hover:bg-[#171717] rounded text-white transition-colors"
          title="Heading 3"
        >
          <Heading3 size={16} />
        </button>
        
        <div className="w-px h-5 bg-[#2A2A2A] mx-1" />
        
        <button
          type="button"
          onClick={() => exec("insertUnorderedList")}
          className="p-1.5 hover:bg-[#171717] rounded text-white transition-colors"
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => exec("insertOrderedList")}
          className="p-1.5 hover:bg-[#171717] rounded text-white transition-colors"
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>
        
        <div className="w-px h-5 bg-[#2A2A2A] mx-1" />
        
        <button
          type="button"
          onClick={addLink}
          className="p-1.5 hover:bg-[#171717] rounded text-white transition-colors"
          title="Insert Link"
        >
          <Link size={16} />
        </button>
        <button
          type="button"
          onClick={addImage}
          className="p-1.5 hover:bg-[#171717] rounded text-white transition-colors"
          title="Insert Image URL"
        >
          <Image size={16} />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={() => onChange(editorRef.current.innerHTML)}
        className="min-h-[220px] p-4 outline-none text-[#CFCFCF] text-sm overflow-y-auto prose prose-invert max-w-none bg-[#121212] focus:bg-[#141414] transition-colors"
        style={{ minHeight: "220px" }}
      />
    </div>
  );
}
