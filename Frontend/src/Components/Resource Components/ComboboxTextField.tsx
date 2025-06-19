import React, { useState, useEffect, useRef } from "react";
import api from "../../utils/api.ts";

type Item = {
  id: number | string;
  name: string;
};

type Props = {
  label: string;
  placeholder?: string;
  fetchUrl: string;
  value: Item | null;
  onChange: (val: Item | null) => void;
  options?: Item[]; // Optional preload
  mapResponse?: (data: any[]) => Item[];
};

const ComboboxTextField: React.FC<Props> = ({
  label,
  placeholder = "Search...",
  fetchUrl,
  value,
  onChange,
  options,
    mapResponse,
}) => {
  const [items, setItems] = useState<Item[]>(options || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [hasFetched, setHasFetched] = useState(!!options);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch items when dropdown opens (lazy or filtered)
  useEffect(() => {
          const fetchItems = async () => {
            try {
              const res = await api.get(fetchUrl, {
                params: searchTerm ? { search: searchTerm } : {},
              });
              let data = Array.isArray(res.data) ? res.data : [];
              if (mapResponse) {
                data = mapResponse(data);
              }
              setItems(data);
              setHasFetched(true);
            } catch (err) {
              console.error("Fetch error:", err);
              setItems([]);
            }
          };

    if (!hasFetched && fetchUrl && isOpen) {
      fetchItems();
    } else if (fetchUrl && isOpen && searchTerm) {
      fetchItems(); // support live filtering
    }
  }, [fetchUrl, isOpen, searchTerm, hasFetched]);

  // Close dropdown on outside click
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

  const filteredItems = items.filter(
  (item) =>
    typeof item.name === "string" &&
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (item: Item) => {
    setSearchTerm(item.name);
    onChange(item);
    setIsOpen(false);
  };

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
          onChange(null); // Clear selected value when typing
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full bg-white border border-gray-200 rounded mt-1 max-h-60 overflow-y-auto shadow-md"
        >
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelect(item)}
              >
                {item.name}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500">No results found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComboboxTextField;
