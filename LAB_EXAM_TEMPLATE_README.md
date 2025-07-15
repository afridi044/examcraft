# Lab Exam Template - Quick Start Guide

This template provides a complete, reusable solution for lab exam tasks that involve fetching data from the database and displaying it in the frontend.

## 🚀 Quick Start

1. **Visit the demo page**: Navigate to `/lab-exam` in your frontend
2. **Test the functionality**: The page shows quiz attempts with filters
3. **Modify for your task**: Follow the instructions below

## 📁 Files Created/Modified

### Backend Files
- `backend/src/database/services/analytics-database.service.ts` - Added `getLabExamData()` function
- `backend/src/dashboard/dashboard.controller.ts` - Added `GET /dashboard/lab-exam` endpoint
- `backend/src/dashboard/dashboard.service.ts` - Added `getLabExamData()` service method

### Frontend Files
- `frontend/src/lib/services/dashboard.service.ts` - Added `getLabExamData()` service method
- `frontend/src/components/features/dashboard/LabExamCard.tsx` - New reusable component
- `frontend/src/hooks/useLabExamData.ts` - New data fetching hook
- `frontend/src/app/lab-exam/page.tsx` - Demo page

## 🔧 How to Modify for Your Lab Exam Task

### Step 1: Modify the Database Query

**File**: `backend/src/database/services/analytics-database.service.ts`

**Function**: `getLabExamData()`

**Current Query** (fetches user quiz attempts):
```typescript
let query = this.supabase
  .from(TABLE_NAMES.USER_ANSWERS)
  .select(`
    answer_id,
    is_correct,
    created_at,
    quiz_id,
    questions(
      content,
      question_type,
      topics(name)
    )
  `)
  .eq('user_id', userId)
  .not('quiz_id', 'is', null);
```

**Example Modifications**:

1. **Fetch flashcards instead**:
```typescript
let query = this.supabase
  .from(TABLE_NAMES.FLASHCARDS)
  .select(`
    flashcard_id,
    question,
    answer,
    mastery_status,
    created_at,
    topic:topics(name)
  `)
  .eq('user_id', userId);
```

2. **Fetch questions by topic**:
```typescript
let query = this.supabase
  .from(TABLE_NAMES.QUESTIONS)
  .select(`
    question_id,
    content,
    question_type,
    difficulty,
    topic:topics(name)
  `)
  .eq('topic_id', filters.topicId);
```

3. **Fetch exam sessions**:
```typescript
let query = this.supabase
  .from(TABLE_NAMES.EXAM_SESSIONS)
  .select(`
    session_id,
    start_time,
    end_time,
    status,
    total_score,
    exam:exams(title, duration_minutes)
  `)
  .eq('user_id', userId);
```

### Step 2: Update the Frontend Data Types

**File**: `frontend/src/hooks/useLabExamData.ts`

**Update the interface** to match your data structure:

```typescript
interface LabExamData {
  // Update this to match your database query result
  flashcard_id: string;
  question: string;
  answer: string;
  mastery_status: string;
  created_at: string;
  topic: { name: string };
}
```

### Step 3: Update the Display Component

**File**: `frontend/src/components/features/dashboard/LabExamCard.tsx`

**Modify the display logic** to show your data:

```typescript
// Update the statistics calculation
const totalFlashcards = data.length;
const masteredFlashcards = data.filter(item => item.mastery_status === 'mastered').length;
const masteryPercentage = totalFlashcards > 0 ? Math.round((masteredFlashcards / totalFlashcards) * 100) : 0;

// Update the table columns
<thead>
  <tr className="border-b">
    <th className="text-left py-2">Question</th>
    <th className="text-left py-2">Answer</th>
    <th className="text-left py-2">Status</th>
    <th className="text-left py-2">Topic</th>
  </tr>
</thead>
```

### Step 4: Update Filters (Optional)

**File**: `frontend/src/app/lab-exam/page.tsx`

**Add/remove filter fields** as needed:

```typescript
const [filters, setFilters] = useState({
  topicId: '',
  masteryStatus: 'all', // Add new filter
  limit: 20,
  dateFrom: '',
  dateTo: '',
});
```

## 🎯 Common Lab Exam Tasks

### Task 1: Show User's Flashcard Progress
- **Query**: `flashcards` table with `mastery_status`
- **Display**: Progress cards + table with question/answer pairs

### Task 2: Show Quiz Performance by Topic
- **Query**: `user_answers` joined with `questions` and `topics`
- **Display**: Topic-wise accuracy charts + detailed breakdown

### Task 3: Show Recent Exam Attempts
- **Query**: `exam_sessions` joined with `exams`
- **Display**: Exam history with scores and completion times

### Task 4: Show Question Bank Statistics
- **Query**: `questions` table with `question_options`
- **Display**: Question count by type/difficulty + sample questions

## 🔍 Available Database Tables

- `users` - User information
- `topics` - Subject topics
- `questions` - Question bank
- `question_options` - Multiple choice options
- `quizzes` - User-created quizzes
- `quiz_questions` - Quiz-question relationships
- `exams` - User-created exams
- `exam_questions` - Exam-question relationships
- `exam_sessions` - Exam attempt records
- `user_answers` - User's answer history
- `flashcards` - User's flashcards
- `explanations` - Question explanations

## 🚀 Testing Your Changes

1. **Start the backend**: `cd backend && npm run start:dev`
2. **Start the frontend**: `cd frontend && npm run dev`
3. **Visit**: `http://localhost:3000/lab-exam`
4. **Test filters**: Try different filter combinations
5. **Check console**: Look for API call logs

## 💡 Tips for Success

1. **Start simple**: Begin with a basic query, then add complexity
2. **Use existing patterns**: Follow the same structure as other services
3. **Test incrementally**: Test each layer (DB → API → Frontend) separately
4. **Check types**: Make sure TypeScript interfaces match your data
5. **Use the demo**: The demo page shows exactly how everything works together

## 🆘 Troubleshooting

### "No data found"
- Check if the user has data in the queried table
- Verify the `user_id` filter is correct
- Test the query directly in Supabase

### "API error"
- Check backend logs for detailed error messages
- Verify the endpoint URL is correct
- Ensure authentication is working

### "Component not rendering"
- Check browser console for JavaScript errors
- Verify the data structure matches the interface
- Test with hardcoded data first

## 📝 Example: Complete Task Modification

**Task**: "Show user's flashcard mastery progress"

1. **Update database query**:
```typescript
let query = this.supabase
  .from(TABLE_NAMES.FLASHCARDS)
  .select(`
    flashcard_id,
    question,
    answer,
    mastery_status,
    next_review_date,
    topic:topics(name)
  `)
  .eq('user_id', userId);
```

2. **Update frontend interface**:
```typescript
interface LabExamData {
  flashcard_id: string;
  question: string;
  answer: string;
  mastery_status: string;
  next_review_date: string;
  topic: { name: string };
}
```

3. **Update component display**:
```typescript
const masteredCount = data.filter(item => item.mastery_status === 'mastered').length;
const totalCount = data.length;
```

That's it! The template handles all the API calls, error handling, and UI state management automatically.

---

**Good luck with your lab exam! 🎓** 