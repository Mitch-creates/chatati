"use client";

import * as React from "react";
import { X, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectComboboxProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  "aria-invalid"?: boolean;
}

export function MultiSelectCombobox({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  className,
  disabled = false,
  id,
  "aria-invalid": ariaInvalid,
}: MultiSelectComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selectedOptions = options.filter((option) => value.includes(option.value));

  // Clear search when popover closes
  React.useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  const handleUnselect = (optionValue: string, e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  const handleSelect = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          id={id}
          className={cn(
            "min-h-12 h-auto w-full rounded-md border-2 border-black bg-white px-3 py-2 text-base shadow-xs",
            "flex items-center gap-2 flex-wrap cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "data-[invalid=true]:border-red-500",
            className
          )}
          data-invalid={ariaInvalid}
          tabIndex={disabled ? -1 : 0}
          role="button"
        >
          {selectedOptions.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {selectedOptions.map((option) => (
                <span
                  key={option.value}
                  className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-sm border border-black"
                >
                  {option.label}
                  <button
                    type="button"
                    onClick={(e) => handleUnselect(option.value, e)}
                    className="ml-1 rounded-full hover:bg-gray-200 p-0.5 transition-colors"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUnselect(option.value, e);
                      }
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w---radix-popover-trigger-width) p-0 border-2 border-black shadow-[4px_4px_0_0_black] bg-white"
        align="start"
      >
        <Command className="rounded-lg border-0" shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
            className="mx-2 mt-2 mb-2"
          />
          <CommandList>
            <CommandGroup>
              {filteredOptions.length === 0 ? (
                <CommandEmpty>{emptyMessage}</CommandEmpty>
              ) : (
                filteredOptions.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className={cn(
                      "cursor-pointer border-2 border-transparent hover:border-black transition-colors rounded-md mx-2",
                      isSelected && "bg-accent-color2 border-black"
                    )}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded border-2 border-black",
                          isSelected
                            ? "bg-black text-white"
                            : "bg-white"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <span>{option.label}</span>
                    </div>
                  </CommandItem>
                );
              })
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
