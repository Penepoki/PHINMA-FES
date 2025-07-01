import React, {useState, useEffect, useRef} from "react";
import api from "../../utils/api.ts";
import {Schedule} from "framer-motion";

type Item = {
    id: number | string;
    name: string;
};

type Props = {
    label: string,
    placeholder?: string,
    fetchUrl: string,
    value: Item | null,

    options?: Item[],
    mapResponse?: (data: any[]) => Item[],
    onChange?: (value: (((prevState: (Schedule | null)) => (Schedule | null)) | Schedule | null)) => void
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
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch data on searchTerm change
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await api.get(fetchUrl, {
                    params: searchTerm ? {search: searchTerm} : {},
                });
                let data = Array.isArray(res.data) ? res.data : res.data.results ?? [];
                if (mapResponse) {
                    data = mapResponse(data);
                }
                setItems(data);
            } catch (err) {
                console.error("Fetch error:", err);
                setItems([]);
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

    const handleSelect = (item: Item) => {
        setSearchTerm(item.name);
        onChange(item);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>

            <input
                ref={inputRef}
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={placeholder}
                value={value && value.name !== undefined ? value.name : searchTerm || ""}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    onChange(null); // Clear selection on typing
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
            />

            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute z-10 w-full bg-white border border-gray-200 rounded mt-1 max-h-60 overflow-y-auto shadow-md"
                >
                    {items.length > 0 ? (
                        items.map((item) => (
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
