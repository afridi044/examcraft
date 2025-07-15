'use client';

import React, { useState } from 'react';
import { useLabExamData } from '@/hooks/useLabExamData';

// =============================================
// LAB EXAM TOPICS PAGE
// =============================================
// Page to view topics and create new topics

export default function LabExamPage() {
    const [filters, setFilters] = useState({
        limit: 50,
    });

    const [newTopic, setNewTopic] = useState({
        name: '',
        description: '',
    });

    const { data, isLoading, error, refetch, createTopic } = useLabExamData(filters);

    const handleFilterChange = (key: string, value: string | number) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleCreateTopic = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newTopic.name.trim()) {
            alert('Topic name is required');
            return;
        }

        const result = await createTopic({
            name: newTopic.name.trim(),
            description: newTopic.description.trim() || undefined,
        });

        if (result.success) {
            setNewTopic({ name: '', description: '' });
            alert('Topic created successfully!');
        } else {
            alert(`Failed to create topic: ${result.error}`);
        }
    };

    if (isLoading) {
        return (
            <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Topics Management</h1>
                <p>Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Topics Management</h1>
                <p style={{ color: 'red' }}>Error: {error}</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: 'white', color: 'black' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Topics Management</h1>

            {/* Create New Topic Form */}
            <div style={{ border: '1px solid #ccc', borderRadius: '4px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', padding: '15px', margin: '0', borderBottom: '1px solid #ccc' }}>Create New Topic</h2>

                <form onSubmit={handleCreateTopic} style={{ padding: '15px' }}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Topic Name: *
                        </label>
                        <input
                            type="text"
                            value={newTopic.name}
                            onChange={(e) => setNewTopic(prev => ({ ...prev, name: e.target.value }))}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '14px'
                            }}
                            placeholder="Enter topic name"
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Description:
                        </label>
                        <textarea
                            value={newTopic.description}
                            onChange={(e) => setNewTopic(prev => ({ ...prev, description: e.target.value }))}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '14px',
                                minHeight: '60px',
                                resize: 'vertical'
                            }}
                            placeholder="Enter topic description (optional)"
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            backgroundColor: '#007bff',
                            color: 'white',
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Create Topic
                    </button>
                </form>
            </div>

            {/* Topics Table */}
            <div style={{ border: '1px solid #ccc', borderRadius: '4px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', padding: '15px', margin: '0', borderBottom: '1px solid #ccc' }}>All Topics</h2>

                {!data || data.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                        No topics found
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa' }}>
                                    <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #ccc', fontWeight: 'bold' }}>Topic ID</th>
                                    <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #ccc', fontWeight: 'bold' }}>Name</th>
                                    <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #ccc', fontWeight: 'bold' }}>Description</th>
                                    <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #ccc', fontWeight: 'bold' }}>Parent Topic ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((topic, index) => (
                                    <tr key={topic.topic_id || `topic-${index}`}>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #eee', fontSize: '14px' }}>{topic.topic_id}</td>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #eee', fontSize: '14px', fontWeight: 'bold' }}>{topic.name}</td>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #eee', fontSize: '14px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {topic.description || 'No description'}
                                        </td>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #eee', fontSize: '14px' }}>
                                            {topic.parent_topic_id || 'None'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {data && data.length > 0 && (
                    <div style={{ padding: '12px', borderTop: '1px solid #ccc', backgroundColor: '#f8f9fa', fontSize: '14px', color: '#666' }}>
                        Total topics: {data.length}
                    </div>
                )}
            </div>
        </div>
    );
} 