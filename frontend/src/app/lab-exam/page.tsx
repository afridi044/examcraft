'use client';

import React, { useState } from 'react';
import { useFlashcardSearch } from '@/hooks/useFlashcardSearch';


interface FlashcardData {
    flashcard_id: string;
    question: string;
    answer: string;
    topic_id: string | null;
    topic?: {
        name: string;
        description: string | null;
    };
    mastery_status: string;
    created_at: string;
    updated_at: string;
}

interface TableColumn {
    key: string;
    label: string;
    width?: string;
    format?: (value: unknown) => string;
}

interface SimpleTableProps {
    title: string;
    columns: TableColumn[];
    data: FlashcardData[];
    emptyMessage: string;
}

//table

const SimpleTable: React.FC<SimpleTableProps> = ({
    title,
    columns,
    data,
    emptyMessage
}) => {
    const formatValue = (column: TableColumn, value: any) => {
        if (column.format) {
            return column.format(value);
        }

        // Default formatting
        if (value === null || value === undefined) {
            return 'N/A';
        }

        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }

        if (typeof value === 'number' && column.key === 'price') {
            return `$${value}`;
        }

        if (typeof value === 'string' && column.key === 'created_at') {
            return new Date(value).toLocaleDateString();
        }

        return value.toString();
    };

    return (
        <div className="border border-gray-300 rounded-md">
            <h2 className="text-lg font-bold p-4 m-0 border-b border-gray-300">
                {title}
            </h2>

            {!data || data.length === 0 ? (
                <div className="p-5 text-center text-gray-600">
                    {emptyMessage}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50">
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        className="text-left p-3 border-b border-gray-300 font-bold"
                                        style={{ width: column.width || 'auto' }}
                                    >
                                        {column.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={item.flashcard_id || `item-${index}`}>
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className="p-3 border-b border-gray-200 text-sm"
                                            style={{
                                                maxWidth: column.width || 'auto',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {formatValue(column, (item as Record<string, unknown>)[column.key])}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {data && data.length > 0 && (
                <div className="p-3 border-t border-gray-300 bg-gray-50 text-sm text-gray-600">
                    Total records: {data.length}
                </div>
            )}
        </div>
    );
};

//search box
interface SearchBoxProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    isLoading?: boolean;
}

const SearchBox: React.FC<SearchBoxProps> = ({
    value,
    onChange,
    placeholder = "Search flashcards...",
    isLoading = false
}) => {
    return (
        <div className="mb-5">
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full p-3 pl-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    ) : (
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    )}
                </div>
            </div>
            {value && (
                <p className="mt-2 text-sm text-gray-600">
                    {isLoading ? 'Searching...' : `Searching for: "${value}"`}
                </p>
            )}
        </div>
    );
};



export default function LabExamPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        query: '',
        limit: 50,
    });

    const { data, isLoading, error } = useFlashcardSearch(filters);

   
    React.useEffect(() => {
        setFilters(prev => ({ ...prev, query: searchQuery }));
    }, [searchQuery]);

    if (error) {
        return (
            <div className="p-5 font-sans">
                <h1 className="text-2xl font-bold mb-5">Flashcard Search</h1>
                <p className="text-red-500">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="p-5 font-sans bg-white text-black">
            <h1 className="text-2xl font-bold mb-5">Flashcard Search</h1>

            
            <SearchBox
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Enter keywords to search flashcards..."
                isLoading={isLoading}
            />

            
            <SimpleTable
                title={searchQuery ? `Search Results for "${searchQuery}"` : "Flashcard Search Results"}
                columns={[
                    { key: 'question', label: 'Question', width: '300px' },
                    { key: 'answer', label: 'Answer', width: '300px' },
                    { 
                        key: 'topic', 
                        label: 'Topic', 
                        width: '150px',
                        format: (value) => value?.name || 'N/A'
                    },
                    { 
                        key: 'mastery_status', 
                        label: 'Status', 
                        width: '100px',
                        format: (value) => {
                            const statusMap: Record<string, string> = {
                                'learning': 'Learning',
                                'under_review': 'Review',
                                'mastered': 'Mastered'
                            };
                            return statusMap[value] || value;
                        }
                    },
                    { 
                        key: 'created_at', 
                        label: 'Created', 
                        width: '120px',
                        format: (value) => new Date(value).toLocaleDateString()
                    },
                ]}
                data={data || []}
                emptyMessage={searchQuery ? `No flashcards found matching "${searchQuery}"` : "Enter a search query to find flashcards"}
            />
        </div>
    );
} 