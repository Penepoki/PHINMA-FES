import React, { useState, useEffect, useRef } from "react";
import api from "../../utils/api"; // Adjust the import path as necessary

type Item = {
  id: number | string;
  name: string;
};

type Props = {
  label: string;
  placeholder?: string;
  fetchUrl?: string;
  options?: Item[]; // If preloaded from parent
  value: Item | null;
  onChange: (val: Item | null) => void;
};

const ComboboxTextField: React.FC<Props> = ({
  label,
  placeholder = "Search...",
  fetchUrl,
  options,
  value,
  onChange,
}) => {
  const [items, setItems] = useState<Item[]>(options || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [hasFetched, setHasFetched] = useState(!!options);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch data lazily if no options are provided
  useEffect(() => {
    if (!hasFetched && fetchUrl && isOpen) {
      fetch(fetchUrl)
        .then((res) => res.json())
        .then((data) => {
          setItems(data);
          setHasFetched(true);
        })
        .catch((err) => console.error("Fetch error:", err));
    }
  }, [isOpen, fetchUrl, hasFetched]);

  // Filtered list based on search term
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full mb-4">
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        ref={inputRef}
        type="text"
        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
        value={value?.name || searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          onChange(null); // reset value if user starts typing
        }}
        onFocus={() => setIsOpen(true)}
      />

      {isOpen && filteredItems.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full bg-white border border-gray-200 rounded mt-1 max-h-60 overflow-y-auto shadow-md"
        >
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onChange(item);
                setSearchTerm(item.name);
                setIsOpen(false);
              }}
            >
              {item.name}
            </div>
          ))}
        </div>
      )}

      {isOpen && filteredItems.length === 0 && (
        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded mt-1 shadow-md px-3 py-2 text-gray-500">
          No results found.
        </div>
      )}
    </div>
  );
};

export default ComboboxTextField;