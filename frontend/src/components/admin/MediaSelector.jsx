import React, { useState, useEffect, useRef } from "react";
import { Upload, Trash2, X, Search, Loader2, RefreshCw, Sliders } from "lucide-react";
import { api, formatApiError, getMediaUrl } from "@/lib/api";
import { toast } from "sonner";
import axios from "axios";

export default function MediaSelector({ value, onChange, folder = "content" }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [rawUrlMode, setRawUrlMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Crop settings
  const [cropOpen, setCropOpen] = useState(false);
  const [cropScale, setCropScale] = useState(1);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [aspectRatio, setAspectRatio] = useState("aspect-video"); // aspect-square, aspect-video, etc.

  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const abortControllerRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Load items from Media Library
  const loadMediaLibrary = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/media", { params: { limit: 30, q: searchQuery } });
      setItems(res.data.items || []);
    } catch (err) {
      toast.error("Failed to load Media Library");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (modalOpen) {
      loadMediaLibrary();
    }
  }, [modalOpen, searchQuery]);

  // Handle upload
  const handleUpload = async (file) => {
    if (!file) return;
    setSelectedFile(file);
    setErrorMsg("");
    setUploading(true);
    setProgress(0);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await api.post(`/admin/media/upload?folder=${folder}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        signal: controller.signal,
        onUploadProgress: (progressEvent) => {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(pct);
        },
      });
      toast.success("Image uploaded successfully");
      onChange(res.data.url);
      setSelectedFile(null);
    } catch (err) {
      if (axios.isCancel(err)) {
        toast.info("Upload cancelled");
      } else {
        setErrorMsg(formatApiError(err.response?.data?.detail) || "Upload failed. Please try again.");
        toast.error("Upload failed");
      }
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add("border-[#FF5A1F]", "bg-[#FF5A1F]/5");
    }
  };

  const handleDragLeave = () => {
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove("border-[#FF5A1F]", "bg-[#FF5A1F]/5");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleDragLeave();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleUpload(file);
    } else {
      toast.error("Please drop an image file");
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Current Preview or Selector */}
      {value ? (
        <div className="relative border border-[#2A2A2A] rounded-xl bg-[#121212] overflow-hidden group">
          {/* Main Preview */}
          <div className="flex items-center justify-center p-6 min-h-[220px]">
            <div className={`relative ${aspectRatio} w-full max-w-[320px] overflow-hidden bg-black/40 border border-[#1A1A1A] rounded-lg`}>
              <img
                src={getMediaUrl(value)}
                alt="Selected asset"
                style={{
                  transform: `scale(${cropScale}) translate(${cropX}px, ${cropY}px)`,
                  transition: "transform 0.1s ease-out",
                }}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Action Overlay */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-[#181818]/95 backdrop-blur-sm border border-[#2A2A2A] p-1.5 rounded-lg shadow-xl">
            <button
              type="button"
              onClick={() => setCropOpen(!cropOpen)}
              className="p-1.5 hover:bg-[#FF5A1F]/10 hover:text-[#FF5A1F] text-gray-400 rounded-md transition-colors"
              title="Crop Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 hover:bg-[#FF5A1F]/10 hover:text-[#FF5A1F] text-gray-400 rounded-md transition-colors"
              title="Replace Image"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-1.5 hover:bg-red-500/10 hover:text-red-500 text-gray-400 rounded-md transition-colors"
              title="Delete / Remove"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Crop Control Panel */}
          {cropOpen && (
            <div className="border-t border-[#2A2A2A] bg-[#181818] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-300">Visual Crop Adjustments</span>
                <button
                  type="button"
                  onClick={() => setCropOpen(false)}
                  className="text-gray-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                {/* Scale Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-gray-400">
                    <span>Scale / Zoom</span>
                    <span>{Math.round(cropScale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="2.5"
                    step="0.05"
                    value={cropScale}
                    onChange={(e) => setCropScale(parseFloat(e.target.value))}
                    className="w-full accent-[#FF5A1F] bg-[#2A2A2A]"
                  />
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-1.5">
                  <span className="text-gray-400">Aspect Ratio</span>
                  <div className="flex gap-1">
                    {["aspect-square", "aspect-video", "aspect-[4/5]"].map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setAspectRatio(ratio)}
                        className={`flex-1 py-1 rounded border text-[10px] uppercase font-semibold tracking-wider ${
                          aspectRatio === ratio
                            ? "bg-[#FF5A1F] border-[#FF5A1F] text-white"
                            : "bg-[#121212] border-[#2A2A2A] text-gray-400"
                        }`}
                      >
                        {ratio.replace("aspect-", "").replace("[", "").replace("]", "")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Translate X */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-gray-400">
                    <span>Horizontal Offset</span>
                    <span>{cropX}px</span>
                  </div>
                  <input
                    type="range"
                    min="-80"
                    max="80"
                    step="1"
                    value={cropX}
                    onChange={(e) => setCropX(parseInt(e.target.value))}
                    className="w-full accent-[#FF5A1F] bg-[#2A2A2A]"
                  />
                </div>

                {/* Translate Y */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-gray-400">
                    <span>Vertical Offset</span>
                    <span>{cropY}px</span>
                  </div>
                  <input
                    type="range"
                    min="-80"
                    max="80"
                    step="1"
                    value={cropY}
                    onChange={(e) => setCropY(parseInt(e.target.value))}
                    className="w-full accent-[#FF5A1F] bg-[#2A2A2A]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Selector / Dropzone */
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="border-2 border-dashed border-[#2A2A2A] rounded-xl p-8 bg-[#121212] hover:border-[#FF5A1F]/60 text-center transition-all flex flex-col items-center justify-center min-h-[220px]"
        >
          {uploading ? (
            <div className="space-y-3 w-full max-w-[240px]">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#FF5A1F]" />
              <div className="text-sm font-semibold text-gray-300">Uploading to Cloudinary...</div>
              {/* Progress Bar */}
              <div className="w-full bg-[#2A2A2A] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#FF5A1F] h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span>{progress}%</span>
                <button
                  type="button"
                  onClick={cancelUpload}
                  className="text-red-500 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 rounded-full flex items-center justify-center text-[#FF5A1F] mx-auto">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-200">
                  Drag & Drop image here, or{" "}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[#FF5A1F] hover:underline"
                  >
                    browse
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-1">Supports JPEG, PNG, WEBP</div>
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="bg-[#1C1C1C] border border-[#2A2A2A] hover:bg-[#222] text-[#CFCFCF] text-xs font-semibold px-4 py-2 rounded-lg transition-all"
                >
                  Browse Media Library
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mt-4 text-xs text-red-500 flex items-center gap-1.5 justify-center">
              <span>{errorMsg}</span>
              <button
                type="button"
                onClick={() => handleUpload(selectedFile)}
                className="text-[#FF5A1F] hover:underline font-semibold flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={(e) => handleUpload(e.target.files?.[0])}
        className="hidden"
      />

      {/* Collapsible Advanced Paste URL */}
      <div>
        <button
          type="button"
          onClick={() => setRawUrlMode(!rawUrlMode)}
          className="text-[10px] uppercase font-bold text-gray-500 hover:text-gray-300 tracking-wider flex items-center gap-1 transition-colors"
        >
          {rawUrlMode ? "Hide Paste Option" : "Paste Image URL Directly"}
        </button>
        {rawUrlMode && (
          <div className="mt-2">
            <input
              type="text"
              placeholder="Paste absolute URL (e.g. https://images.unsplash.com/...)"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg px-3 py-2 text-xs text-[#CFCFCF] focus:outline-none focus:border-[#FF5A1F] transition-all"
            />
          </div>
        )}
      </div>

      {/* Media Library Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#2A2A2A] rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2A2A2A] px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-white">Select from Media Library</h3>
                <p className="text-xs text-gray-400">Choose one of the previously uploaded assets.</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-500 hover:text-white p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Search */}
            <div className="px-6 py-3 border-b border-[#1C1C1C] flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search images by original filename..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm outline-none text-white w-full placeholder-gray-600"
              />
            </div>

            {/* Grid Area */}
            <div className="flex-1 overflow-y-auto p-6 min-h-[250px]">
              {loading ? (
                <div className="flex items-center justify-center h-full py-16 text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin text-[#FF5A1F] mr-2" /> Loading assets...
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  No images found.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {items.map((it) => (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => {
                        onChange(it.url);
                        setModalOpen(false);
                      }}
                      className="group relative bg-[#171717] border border-[#2A2A2A] hover:border-[#FF5A1F]/60 transition-all rounded-lg overflow-hidden flex flex-col text-left focus:outline-none"
                    >
                      <img
                        src={getMediaUrl(it.url)}
                        alt={it.original_filename}
                        className="w-full aspect-square object-cover"
                      />
                      <div className="p-2 border-t border-[#1C1C1C] bg-[#121212]">
                        <span className="text-[10px] text-gray-400 truncate block">
                          {it.original_filename}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-[#2A2A2A] px-6 py-4 bg-[#141414] flex justify-end">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="bg-[#1C1C1C] border border-[#2A2A2A] text-xs font-semibold px-4 py-2 hover:bg-[#222] transition-all text-white rounded-lg"
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
