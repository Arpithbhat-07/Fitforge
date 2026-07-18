import React, { useState } from "react";
import * as Icons from "lucide-react";
import { FITNESS_ICONS } from "@/constants/icons";

export default function IconPicker({ value, onChange }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...Object.keys(FITNESS_ICONS)];

  // Flatten all icons for search / "All" view
  const allIcons = Object.values(FITNESS_ICONS).flat();

  // Filter icons by category and search term
  const getFilteredIcons = () => {
    let list = activeCategory === "All" ? allIcons : FITNESS_ICONS[activeCategory] || [];
    if (searchTerm.trim()) {
      list = list.filter((name) => name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return list;
  };

  const filteredIcons = getFilteredIcons();
  const SelectedIconComponent = Icons[value] || Icons.Dumbbell;

  return (
    <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-4 w-full text-white">
      {/* Selected Icon Status */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[#2A2A2A]">
        <div className="w-12 h-12 bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 rounded-lg flex items-center justify-center text-[#FF5A1F]">
          <SelectedIconComponent className="w-6 h-6" />
        </div>
        <div>
          <div className="text-xs text-gray-400">Selected Icon</div>
          <div className="text-sm font-semibold text-gray-200">{value || "Dumbbell"}</div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Icons.Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search icons..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg pl-9 pr-4 py-2 text-sm text-[#CFCFCF] placeholder-gray-600 focus:outline-none focus:border-[#FF5A1F] transition-all"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 mb-4 bg-[#121212] p-1 rounded-lg border border-[#222]">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`flex-1 text-center py-1.5 rounded-md text-xs font-medium transition-all ${
              activeCategory === cat
                ? "bg-[#FF5A1F] text-white"
                : "text-gray-400 hover:text-white hover:bg-[#1C1C1C]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Icons Grid */}
      <div className="grid grid-cols-5 gap-2 max-h-[160px] overflow-y-auto pr-1">
        {filteredIcons.map((name) => {
          const Icon = Icons[name];
          if (!Icon) return null;
          const isSelected = value === name;

          return (
            <button
              key={name}
              type="button"
              onClick={() => onChange(name)}
              title={name}
              className={`p-2.5 rounded-lg flex flex-col items-center justify-center border transition-all ${
                isSelected
                  ? "bg-[#FF5A1F] border-[#FF5A1F] text-white"
                  : "bg-[#121212] border-[#2A2A2A] text-gray-400 hover:text-white hover:border-[#444] hover:bg-[#1A1A1A]"
              }`}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
        {filteredIcons.length === 0 && (
          <div className="col-span-5 py-6 text-center text-xs text-gray-500">
            No icons found.
          </div>
        )}
      </div>
    </div>
  );
}
