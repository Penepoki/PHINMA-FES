import React, { useState, useEffect, useRef } from "react";
import api from "../../utils/api.ts";

type Item = {
  id: number | string;
  name: string;
};

type Props<T = Item> = {
  label: string;
  placeholder?: string;
  fetchUrl: string;
  value: T | null;
  options?: T[];
  mapResponse?: (data: any[]) => T[];
  onChange?: (value: T | null) => void;
  /** Number of skeleton rows to show while loading */
  skeletonCount?: number;
};

function ComboboxTextField<T extends Item = Item>({
  label,
  placeholder = "Search...",
  fetchUrl,
  value,
  onChange,
  options,
  mapResponse,
  skeletonCount = 5,
}: Props<T>) {
  const [items, setItems] = useState<T[]>(options || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch data on searchTerm change
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(fetchUrl, {
          params: searchTerm ? { search: searchTerm } : {},
        });
        let data = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
        if (mapResponse) data = mapResponse(data);
        setItems(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && fetchUrl) {
      const delay = setTimeout(fetchItems, 300); // debounce
      return () => clearTimeout(delay);
    }
  }, [searchTerm, isOpen, fetchUrl, mapResponse]);

  // Close on outside click
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

  const handleSelect = (item: T) => {
    setSearchTerm(item.name);
    onChange?.(item);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onChange?.(null); // Clear selection on typing
    setIsOpen(true);
  };

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      <label className="text-left text-lg font-bold md:w-1/4">{label}:</label>

      <div className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          className="input input-bordered w-full"
          placeholder={placeholder}
          value={value && value.name !== undefined ? value.name : searchTerm || ""}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
        />

        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded border border-gray-200 bg-white shadow-md"
          >
            {/* Loading skeletons */}
            {isLoading ? (
              <div className="p-2">
                {Array.from({ length: skeletonCount }).map((_, i) => (
                  <div key={i} className="mb-2 rounded-md last:mb-0">
                    <div className="skeleton h-8 w-full" />
                  </div>
                ))}
              </div>
            ) : items.length > 0 ? (
              items.map((item) => (
                <div
                  key={item.id}
                  className="cursor-pointer px-3 py-2 hover:bg-gray-100"
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
    </div>
  );
}

export default ComboboxTextField;
