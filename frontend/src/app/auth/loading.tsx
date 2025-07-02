import { BookOpen } from "lucide-react";

export default function AuthLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(59,130,246,0.1),transparent_70%)]" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">
              ExamCraft
            </span>
          </div>
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
        
        <div className="bg-gray-800/80 rounded-2xl border border-gray-700 shadow-xl p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded animate-pulse" />
              <div className="h-10 bg-gray-700/50 rounded-xl animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded animate-pulse" />
              <div className="h-10 bg-gray-700/50 rounded-xl animate-pulse" />
            </div>
            <div className="h-12 bg-blue-600/50 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
