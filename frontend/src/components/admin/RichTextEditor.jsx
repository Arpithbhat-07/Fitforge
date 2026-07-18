import React, { useRef, useEffect, useState } from "react";
import {
  Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter,
  AlignRight, AlignJustify, Link, Image, Heading1, Heading2, Heading3,
  Undo, Redo, Quote, Table, Trash2, X, Sliders
} from "lucide-react";
import MediaSelector from "./MediaSelector";
import { getMediaUrl } from "@/lib/api";

export default function RichTextEditor({ label, value, onChange }) {
  const editorRef = useRef(null);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);
  
  // Image properties
  const [imgWidth, setImgWidth] = useState("100%");
  const [imgAlign, setImgAlign] = useState("center");
  const [imgScale, setImgScale] = useState(1);
  const [imgX, setImgX] = useState(0);
  const [imgY, setImgY] = useState(0);

  // Sync value
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

  const preventFocusLoss = (e) => {
    e.preventDefault();
  };

  const addLink = () => {
    const url = prompt("Enter hyperlink URL:");
    if (url) exec("createLink", url);
  };

  const addTable = () => {
    const rows = prompt("Number of rows:", "3");
    const cols = prompt("Number of columns:", "3");
    if (!rows || !cols) return;
    let html = '<table class="border-collapse border border-[#2A2A2A] w-full my-4"><tbody>';
    for (let r = 0; r < parseInt(rows); r++) {
      html += '<tr>';
      for (let c = 0; c < parseInt(cols); c++) {
        html += '<td class="border border-[#2A2A2A] p-2 text-sm min-w-[60px]">&nbsp;</td>';
      }
      html += '</tr>';
    }
    html += '</tbody></table>';
    exec("insertHTML", html);
  };

  const selectImage = (url) => {
    if (url) {
      const fullUrl = getMediaUrl(url);
      exec("insertHTML", `<img src="${fullUrl}" alt="" class="editor-img rounded-lg" style="width: 100%; display: block; margin: 1rem auto;" />`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey) {
      if (e.key === "b") {
        e.preventDefault();
        exec("bold");
      } else if (e.key === "i") {
        e.preventDefault();
        exec("italic");
      } else if (e.key === "u") {
        e.preventDefault();
        exec("underline");
      } else if (e.key === "z") {
        e.preventDefault();
        exec("undo");
      } else if (e.key === "y") {
        e.preventDefault();
        exec("redo");
      }
    }
  };

  const handleEditorClick = (e) => {
    if (e.target.tagName === "IMG") {
      setSelectedImg(e.target);
      setImgWidth(e.target.style.width || "100%");
      
      // Get alignment
      if (e.target.style.float === "left") setImgAlign("left");
      else if (e.target.style.float === "right") setImgAlign("right");
      else setImgAlign("center");

      // Extract transform scales/offsets if they exist
      const transform = e.target.style.transform || "";
      const scaleMatch = transform.match(/scale\(([^)]+)\)/);
      const translateMatch = transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
      setImgScale(scaleMatch ? parseFloat(scaleMatch[1]) : 1);
      setImgX(translateMatch ? parseInt(translateMatch[1]) : 0);
      setImgY(translateMatch ? parseInt(translateMatch[2]) : 0);
    } else {
      setSelectedImg(null);
    }
  };

  const updateImgStyle = (property, val) => {
    if (!selectedImg) return;
    if (property === "width") {
      selectedImg.style.width = val;
      setImgWidth(val);
    } else if (property === "align") {
      if (val === "left") {
        selectedImg.style.float = "left";
        selectedImg.style.display = "inline";
        selectedImg.style.margin = "0 1.5rem 1.5rem 0";
      } else if (val === "right") {
        selectedImg.style.float = "right";
        selectedImg.style.display = "inline";
        selectedImg.style.margin = "0 0 1.5rem 1.5rem";
      } else {
        selectedImg.style.float = "none";
        selectedImg.style.display = "block";
        selectedImg.style.margin = "1.5rem auto";
      }
      setImgAlign(val);
    } else if (property === "crop") {
      const scale = property === "scale" ? val : imgScale;
      const x = property === "x" ? val : imgX;
      const y = property === "y" ? val : imgY;
      selectedImg.style.transform = `scale(${scale}) translate(${x}px, ${y}px)`;
    }
    onChange(editorRef.current.innerHTML);
  };

  const deleteImg = () => {
    if (selectedImg) {
      selectedImg.remove();
      setSelectedImg(null);
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="flex flex-col border border-[#2A2A2A] rounded-md overflow-hidden bg-[#171717] md:col-span-2">
      <label className="text-xs uppercase tracking-widest text-[#8A8A8A] px-4 pt-3 font-semibold block">{label}</label>
      
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-[#2A2A2A] p-2 bg-[#0B0B0B]" onMouseDown={preventFocusLoss}>
        <button type="button" onClick={() => exec("bold")} className="p-1.5 hover:bg-[#171717] rounded text-white transition-colors" title="Bold"><Bold size={15} /></button>
        <button type="button" onClick={() => exec("italic")} className="p-1.5 hover:bg-[#171717] rounded text-white transition-colors" title="Italic"><Italic size={15} /></button>
        <button type="button" onClick={() => exec("underline")} className="p-1.5 hover:bg-[#171717] rounded text-white transition-colors" title="Underline"><Underline size={15} /></button>
        
        <div className="w-px h-5 bg-[#2A2A2A] mx-1" />
        
        <button type="button" onClick={() => exec("formatBlock", "<h1>")} className="p-1.5 hover:bg-[#171717] rounded text-white transition-colors font-bold text-xs" title="Heading 1"><Heading1 size={15} /></button>
        <button type="button" onClick={() => exec("formatBlock", "<h2>")} className="p-1.5 hover:bg-[#171717] rounded text-white transition-colors font-semibold text-xs" title="Heading 2"><Heading2 size={15} /></button>
        <button type="button" onClick={() => exec("formatBlock", "<h3>")} className="p-1.5 hover:bg-[#171717] rounded text-white transition-colors text-xs" title="Heading 3"><Heading3 size={15} /></button>
        <button type="button" onClick={() => exec("formatBlock", "<blockquote>")} className="p-1.5 hover:bg-[#171717] rounded text-white transition-colors" title="Blockquote"><Quote size={15} /></button>
        
        <div className="w-px h-5 bg-[#2A2A2A] mx-1" />
        
        <button type="button" onClick={() => exec("justifyLeft")} className="p-1.5 hover:bg-[#171717] rounded text-white transition-colors" title="Align Left"><AlignLeft size={15} /></button>
        <button type="button" onClick={() => exec("justifyCenter")} className="p-1.5 hover:bg-[#171717] rounded text-white transition-colors" title="Align Center"><AlignCenter size={15} /></button>
        <button type="button" onClick={() => exec("justifyRight")} className="p-1.5 hover:bg-[#171717] rounded text-white transition-colors" title="Align Right"><AlignRight size={15} /></button>
        <button type="button" onClick={() => exec("justifyFull")} className="p-1.5 hover:bg-[#171717] rounded text-white transition-colors" title="Justify"><AlignJustify size={15} /></button>

        <div className="w-px h-5 bg-[#2A2A2A] mx-1" />

        <button type="button" onClick={() => exec("insertUnorderedList")} className="p-1.5 hover:bg-[#171717] rounded text-white transition-colors" title="Bullet List"><List size={15} /></button>
        <button type="button" onClick={() => exec("insertOrderedList")} className="p-1.5 hover:bg-[#171717] rounded text-white transition-colors" title="Numbered List"><ListOrdered size={15} /></button>
        
        <div className="w-px h-5 bg-[#2A2A2A] mx-1" />
        
        <button type="button" onClick={addLink} className="p-1.5 hover:bg-[#171717] rounded text-white transition-colors" title="Insert Link"><Link size={15} /></button>
        <button type="button" onClick={addTable} className="p-1.5 hover:bg-[#171717] rounded text-white transition-colors" title="Insert Table"><Table size={15} /></button>
        <button type="button" onClick={() => setMediaModalOpen(true)} className="p-1.5 hover:bg-[#171717] rounded text-white transition-colors" title="Insert Media"><Image size={15} /></button>

        <div className="w-px h-5 bg-[#2A2A2A] mx-1" />

        <button type="button" onClick={() => exec("undo")} className="p-1.5 hover:bg-[#171717] rounded text-white transition-colors" title="Undo"><Undo size={15} /></button>
        <button type="button" onClick={() => exec("redo")} className="p-1.5 hover:bg-[#171717] rounded text-white transition-colors" title="Redo"><Redo size={15} /></button>
      </div>

      {/* Editor Content Area */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={() => onChange(editorRef.current.innerHTML)}
          onKeyDown={handleKeyDown}
          onClick={handleEditorClick}
          className="min-h-[260px] p-4 outline-none text-[#CFCFCF] text-sm overflow-y-auto prose prose-invert max-w-none bg-[#121212] focus:bg-[#141414] transition-colors"
          style={{ minHeight: "260px" }}
        />

        {/* Inline Image Control Panel */}
        {selectedImg && (
          <div className="absolute bottom-4 left-4 right-4 bg-[#181818] border border-[#2A2A2A] rounded-xl p-4 shadow-2xl flex flex-col gap-3 z-50 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-2">
              <span className="text-xs font-bold text-gray-300">Inline Image Options</span>
              <button type="button" onClick={() => setSelectedImg(null)} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-xs">
              {/* Width Selector */}
              <div className="space-y-1">
                <span className="text-gray-400">Width</span>
                <div className="flex gap-1">
                  {["25%", "50%", "75%", "100%"].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => updateImgStyle("width", w)}
                      className={`flex-1 py-1 rounded text-[10px] border font-bold ${
                        imgWidth === w ? "bg-[#FF5A1F] border-[#FF5A1F] text-white" : "bg-[#121212] border-[#2A2A2A] text-gray-400"
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              {/* Align Option */}
              <div className="space-y-1">
                <span className="text-gray-400">Alignment</span>
                <div className="flex gap-1">
                  {["left", "center", "right"].map((al) => (
                    <button
                      key={al}
                      type="button"
                      onClick={() => updateImgStyle("align", al)}
                      className={`flex-1 py-1 rounded text-[10px] uppercase border font-bold ${
                        imgAlign === al ? "bg-[#FF5A1F] border-[#FF5A1F] text-white" : "bg-[#121212] border-[#2A2A2A] text-gray-400"
                      }`}
                    >
                      {al}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delete / crop settings */}
              <div className="flex items-end justify-end gap-2">
                <div className="flex items-center gap-2 text-[10px] text-gray-400 bg-[#121212] px-2.5 py-1 rounded border border-[#2A2A2A]">
                  <span>Crop:</span>
                  <input
                    type="range"
                    min="1"
                    max="2"
                    step="0.1"
                    value={imgScale}
                    onChange={(e) => {
                      const s = parseFloat(e.target.value);
                      setImgScale(s);
                      selectedImg.style.transform = `scale(${s}) translate(${imgX}px, ${imgY}px)`;
                      onChange(editorRef.current.innerHTML);
                    }}
                    className="w-16 accent-[#FF5A1F]"
                  />
                </div>
                <button
                  type="button"
                  onClick={deleteImg}
                  className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-3 py-1.5 rounded-lg border border-red-500/20 text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Integrated upload modal */}
      {mediaModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[99999] flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#2A2A2A] rounded-2xl w-full max-w-xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Select Editor Media</h3>
                <p className="text-xs text-gray-400 mt-1">Upload an image to inject directly at your editor cursor.</p>
              </div>
              <button type="button" onClick={() => setMediaModalOpen(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            
            <MediaSelector
              onChange={(url) => {
                selectImage(url);
                setMediaModalOpen(false);
              }}
              folder="content"
            />
            
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => setMediaModalOpen(false)}
                className="bg-[#1C1C1C] border border-[#2A2A2A] px-4 py-2 text-xs text-white rounded-lg hover:bg-[#222] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
