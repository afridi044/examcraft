'use client';

import React, { useState } from 'react';
import { useLabExamData } from '@/hooks/useLabExamData';

// =============================================
// SIMPLE REUSABLE TABLE COMPONENT
// =============================================
interface TableColumn {
    key: string;
    label: string;
    width?: string;
    format?: (value: any) => string;
}

interface SimpleTableProps {
    title: string;
    columns: TableColumn[];
    data: any[];
    emptyMessage: string;
}

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
                                <tr key={item.id || `item-${index}`}>
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
                                            {formatValue(column, item[column.key])}
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

// =============================================
// SIMPLE REUSABLE FORM COMPONENT
// =============================================
interface FormField {
    name: string;
    label: string;
    placeholder?: string;
    required?: boolean;
}

interface SimpleFormProps {
    title: string;
    fields: FormField[];
    onSubmit: (data: Record<string, string>) => Promise<void>;
    submitButtonText: string;
}

const SimpleForm: React.FC<SimpleFormProps> = ({
    title,
    fields,
    onSubmit,
    submitButtonText
}) => {
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await onSubmit(formData);
            setFormData({}); // Reset form
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (fieldName: string, value: string) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
    };

    return (
        <div className="border border-gray-300 rounded-md mb-5">
            <h2 className="text-lg font-bold p-4 m-0 border-b border-gray-300">
                {title}
            </h2>

            <form onSubmit={handleSubmit} className="p-4">
                {fields.map((field) => (
                    <div key={field.name} className="mb-4">
                        <label className="block mb-2 font-bold">
                            {field.label} {field.required && '*'}
                        </label>
                        <input
                            type="text"
                            value={formData[field.name] || ''}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                            placeholder={field.placeholder}
                            required={field.required}
                        />
                    </div>
                ))}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-500 text-white px-5 py-2 border-none rounded-md cursor-pointer text-sm disabled:opacity-70 disabled:cursor-not-allowed hover:bg-blue-600"
                >
                    {isSubmitting ? 'Creating...' : submitButtonText}
                </button>
            </form>
        </div>
    );
};

// =============================================
// LAB EXAM TEST PAGE
// =============================================
// Page to view test records and create new test records

export default function LabExamPage() {
    const [filters, setFilters] = useState({
        limit: 50,
    });

    const { data, isLoading, error, createTopic } = useLabExamData(filters);

    // Define your fields - just add/modify this array
    const formFields = [
        { name: 'name', label: 'Name', required: true, placeholder: 'Enter name' },
        { name: 'description', label: 'Description', placeholder: 'Enter description' },
        { name: 'age', label: 'Age', placeholder: 'Enter age' },
        { name: 'price', label: 'Price', placeholder: 'Enter price' },
        { name: 'category', label: 'Category', placeholder: 'Enter category' },
    ];

    const handleCreateTest = async (formData: Record<string, string>) => {
        if (!formData.name.trim()) {
            alert('Name is required');
            return;
        }

        const result = await createTopic({
            name: formData.name.trim(),
            description: formData.description?.trim() || undefined,
            age: formData.age ? parseInt(formData.age) : undefined,
            is_active: true, // default value
            price: formData.price ? parseFloat(formData.price) : undefined,
            category: formData.category?.trim() || undefined,
        });

        if (result.success) {
            alert('Test record created successfully!');
        } else {
            alert(`Failed to create test record: ${result.error}`);
        }
    };

    if (isLoading) {
        return (
            <div className="p-5 font-sans">
                <h1 className="text-2xl font-bold mb-5">Test Records Management</h1>
                <p>Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-5 font-sans">
                <h1 className="text-2xl font-bold mb-5">Test Records Management</h1>
                <p className="text-red-500">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="p-5 font-sans bg-white text-black">
            <h1 className="text-2xl font-bold mb-5">Test Records Management</h1>

            {/* Simple Reusable Form Component */}
            <SimpleForm
                title="Create New Test Record"
                fields={formFields}
                onSubmit={handleCreateTest}
                submitButtonText="Create Test Record"
            />

            {/* Test Records Table */}
            <SimpleTable
                title="All Test Records"
                columns={[
                    { key: 'name', label: 'Name', width: '200px' },
                    { key: 'description', label: 'Description', width: '300px' },
                    { key: 'age', label: 'Age', width: '100px' },
                    { key: 'is_active', label: 'Active', width: '100px' },
                    { key: 'price', label: 'Price', width: '100px' },
                    { key: 'category', label: 'Category', width: '150px' },
                    { key: 'created_at', label: 'Created', width: '150px' },
                ]}
                data={data || []}
                emptyMessage="No test records found"
            />
        </div>
    );
} 