import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import api from "../../utils/api"; // Adjust the import path as necessary

interface Option {
  id: number;
  name: string;
}

interface ComboboxTextFieldProps {
  label: string;
  placeholder?: string;
  fetchUrl: string;
  value: Option | null;
  onChange: (option: Option | null) => void;
}

export function ComboboxTextField({
  label,
  placeholder,
  fetchUrl,
  value,
  onChange,
}: ComboboxTextFieldProps) {
  const [inputValue, setInputValue] = useState(value ? value.name : "");
  const [options, setOptions] = useState<Option[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
  if (inputValue.length === 0) {
    setOptions([]);
    return;
  }
  const fetchOptions = async () => {
  try {
    console.log("Fetching:", fetchUrl, "with input:", inputValue);
    const res = await api.get(fetchUrl, { params: { search: inputValue } });
    console.log("Response:", res.data);
    setOptions(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error("Error fetching options:", err);
    setOptions([]);
  }
};
  fetchOptions();
}, [inputValue, fetchUrl]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!inputRef.current?.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative w-full">
      <label className="block text-left text-lg font-bold mb-1">{label}</label>
      <input
        ref={inputRef}
        type="text"
        className="input input-bordered w-full"
        placeholder={placeholder}
        value={inputValue}
        onChange={e => {
          setInputValue(e.target.value);
          setShowDropdown(true);
          onChange(null); // Clear selection on typing
        }}
        onFocus={() => setShowDropdown(true)}
        autoComplete="off"
        required
      />
      {showDropdown && options.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded shadow max-h-48 overflow-y-auto mt-1">
          {options.map(option => (
            <li
              key={option.id}
              className="px-4 py-2 cursor-pointer hover:bg-gray-200"
              onClick={() => {
                setInputValue(option.name);
                setShowDropdown(false);
                onChange(option);
              }}
            >
              {option.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
