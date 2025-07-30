"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "./input";
import { Label } from "./label";
import { topicService } from "@/lib/services";
import { ChevronDown, X } from "lucide-react";

interface SubtopicAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  parentTopicId: string;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function SubtopicAutocomplete({
  value,
  onChange,
  parentTopicId,
  placeholder = "e.g., React Hooks",
  label = "Subtopic (optional)",
  className = "",
}: SubtopicAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [subtopics, setSubtopics] = useState<Array<{ topic_id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredSubtopics, setFilteredSubtopics] = useState<Array<{ topic_id: string; name: string }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch subtopics when parent topic changes
  useEffect(() => {
    if (parentTopicId) {
      setIsLoading(true);
      topicService.getSubtopicsByParent(parentTopicId)
        .then(response => {
          if (response.success && response.data) {
            setSubtopics(response.data);
            setFilteredSubtopics(response.data);
          } else {
            setSubtopics([]);
            setFilteredSubtopics([]);
          }
        })
        .catch(() => {
          setSubtopics([]);
          setFilteredSubtopics([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setSubtopics([]);
      setFilteredSubtopics([]);
    }
  }, [parentTopicId]);

  // Filter subtopics based on input value
  useEffect(() => {
    if (!value.trim()) {
      setFilteredSubtopics(subtopics);
    } else {
      const filtered = subtopics.filter(subtopic =>
        subtopic.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSubtopics(filtered);
    }
  }, [value, subtopics]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
  };

  const handleSelectSubtopic = (subtopicName: string) => {
    onChange(subtopicName);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const showDropdown = isOpen && (filteredSubtopics.length > 0 || value.trim());

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="subtopic_name" className="text-gray-300">
        {label}
      </Label>
      <div className="relative" ref={containerRef}>
        <div className="relative">
          <Input
            id="subtopic_name"
            value={value}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 pr-10"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-600 rounded transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* Dropdown */}
        {showDropdown && (
                     <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-32 overflow-y-auto">
                         {isLoading ? (
               <div className="p-2 text-center text-gray-400 text-sm">
                 Loading subtopics...
               </div>
            ) : filteredSubtopics.length > 0 ? (
              <div className="py-1">
                                 {filteredSubtopics.map((subtopic) => (
                   <button
                     key={subtopic.topic_id}
                     type="button"
                     onClick={() => handleSelectSubtopic(subtopic.name)}
                     className="w-full px-2 py-1.5 text-left text-white hover:bg-gray-700 transition-colors flex items-center justify-between text-sm"
                   >
                     <span>{subtopic.name}</span>
                     <span className="text-xs text-gray-400">Existing</span>
                   </button>
                 ))}
                                 {value.trim() && !filteredSubtopics.some(s => s.name.toLowerCase() === value.toLowerCase()) && (
                   <button
                     type="button"
                     onClick={() => handleSelectSubtopic(value)}
                     className="w-full px-2 py-1.5 text-left text-blue-400 hover:bg-gray-700 transition-colors flex items-center justify-between text-sm"
                   >
                     <span>Create "{value}"</span>
                     <span className="text-xs text-blue-400">New</span>
                   </button>
                 )}
              </div>
                         ) : value.trim() ? (
               <div className="p-2 text-center text-gray-400 text-sm">
                 <div className="mb-1">No existing subtopics found</div>
                 <button
                   type="button"
                   onClick={() => handleSelectSubtopic(value)}
                   className="text-blue-400 hover:text-blue-300 transition-colors"
                 >
                   Create "{value}"
                 </button>
               </div>
             ) : (
               <div className="p-2 text-center text-gray-400 text-sm">
                 No subtopics available for this topic
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
} 