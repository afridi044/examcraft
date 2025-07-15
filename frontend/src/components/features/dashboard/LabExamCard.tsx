import React from 'react';
import { StatCard } from './StatCard';
import { Card } from '@/components/ui/card';

// =============================================
// LAB EXAM TEMPLATE COMPONENT
// =============================================
// This component can be easily modified for any lab exam task
// Just change the data structure and display logic as needed

interface LabExamData {
    answer_id: string;
    is_correct: boolean;
    created_at: string;
    quiz_id: string;
    questions: {
        content: string;
        question_type: string;
        topics: { name: string } | { name: string }[] | null;
    };
}

interface LabExamCardProps {
    data: LabExamData[];
    isLoading?: boolean;
    error?: string | null;
}

export const LabExamCard: React.FC<LabExamCardProps> = ({
    data,
    isLoading = false,
    error = null,
}) => {
    if (isLoading) {
        return (
            <Card className="p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="p-6 border-red-200 bg-red-50">
                <div className="text-red-600">
                    <h3 className="font-semibold mb-2">Error Loading Data</h3>
                    <p className="text-sm">{error}</p>
                </div>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Card className="p-6">
                <div className="text-center text-gray-500">
                    <h3 className="font-semibold mb-2">No Data Available</h3>
                    <p className="text-sm">No lab exam data found.</p>
                </div>
            </Card>
        );
    }

    // Helper function to safely extract topic names
    const getTopicNames = (topics: { name: string } | { name: string }[] | null): string[] => {
        if (!topics) return [];
        if (Array.isArray(topics)) {
            return topics.map(t => t.name);
        }
        return [topics.name];
    };

    // Calculate summary statistics
    const totalAnswers = data.length;
    const correctAnswers = data.filter(item => item.is_correct).length;
    const accuracyPercentage = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

    // Safely extract unique topics
    const allTopicNames = data.flatMap(item =>
        getTopicNames(item.questions?.topics || null)
    );
    const uniqueTopics = new Set(allTopicNames);

    const uniqueQuizzes = new Set(data.map(item => item.quiz_id));

    return (
        <div className="space-y-6">
            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    value={totalAnswers}
                    label="Total Answers"
                    icon={<span className="text-lg">📝</span>}
                    iconBgClass="bg-blue-500/20"
                />
                <StatCard
                    value={`${accuracyPercentage}%`}
                    label="Accuracy"
                    icon={<span className="text-lg">🎯</span>}
                    iconBgClass="bg-green-500/20"
                />
                <StatCard
                    value={uniqueTopics.size}
                    label="Topics Covered"
                    icon={<span className="text-lg">📚</span>}
                    iconBgClass="bg-purple-500/20"
                />
                <StatCard
                    value={uniqueQuizzes.size}
                    label="Quizzes Taken"
                    icon={<span className="text-lg">📊</span>}
                    iconBgClass="bg-orange-500/20"
                />
            </div>

            {/* Detailed Data Table */}
            <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">Recent Quiz Attempts</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-2">Question</th>
                                <th className="text-left py-2">Topic</th>
                                <th className="text-left py-2">Result</th>
                                <th className="text-left py-2">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.slice(0, 10).map((item) => {
                                const topicNames = getTopicNames(item.questions?.topics || null);
                                const topicName = topicNames[0] || 'N/A';

                                return (
                                    <tr key={item.answer_id} className="border-b hover:bg-gray-50">
                                        <td className="py-2">
                                            <div className="max-w-xs truncate">
                                                {item.questions?.content || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="py-2">
                                            {topicName}
                                        </td>
                                        <td className="py-2">
                                            <span className={`px-2 py-1 rounded-full text-xs ${item.is_correct
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {item.is_correct ? 'Correct' : 'Incorrect'}
                                            </span>
                                        </td>
                                        <td className="py-2 text-gray-600">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {data.length > 10 && (
                    <p className="text-sm text-gray-500 mt-2">
                        Showing 10 of {data.length} records
                    </p>
                )}
            </Card>
        </div>
    );
}; 