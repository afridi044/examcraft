// Backend API Services - Centralized Exports
// Replace direct database operations with these service calls

export { healthService } from './health.service';
export { quizService } from './quiz.service';
export { flashcardService } from './flashcard.service';
export { dashboardService } from './dashboard.service';
export { authService } from './auth.service';
export { userService } from './user.service';
export { topicService } from './topic.service';
export { questionService } from './question.service';
export { examService } from './exam.service';

// Re-export API client for custom usage
export { apiClient, APIClient } from '../api-client';

// Export types
export type { HealthStatus } from './health.service';
export type { SignInInput, SignUpInput, AuthResponse } from './auth.service'; 