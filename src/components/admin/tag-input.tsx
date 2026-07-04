"use client";

import { useState } from "react";
import { X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type TagInputProps = {
  name: string;
  defaultValue?: string[];
  suggestions: string[];
};

export function TagInput({ name, defaultValue = [], suggestions }: TagInputProps) {
  const [tags, setTags] = useState<string[]>(defaultValue);
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = suggestions
    .filter(
      (s) =>
        !tags.some((t) => t.toLowerCase() === s.toLowerCase()) &&
        s.toLowerCase().includes(inputValue.toLowerCase()),
    )
    .slice(0, 8);

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (!trimmed || tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setInputValue("");
      return;
    }
    setTags((prev) => [...prev, trimmed]);
    setInputValue("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }

  return (
    <div className="relative">
      <input type="hidden" name={name} value={tags.join(",")} />
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent px-2.5 py-1.5 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag} tag`}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
          placeholder={tags.length === 0 ? "Add tags — press Enter" : ""}
          className="min-w-[100px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-md">
          {filteredSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => addTag(s)}
              className={cn(
                "block w-full px-3 py-1.5 text-left text-sm text-popover-foreground transition hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
