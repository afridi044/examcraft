# AI Quiz Generation Prompt Design

## Overview

This document outlines the comprehensive AI prompt design for generating consistent, high-quality quiz questions in the ExamCraft application. The prompt is designed to work seamlessly with the quiz creation form and ensure educational value.

## Form Parameters Integration

The AI prompt takes into account all form parameters from the quiz creation interface:

### 1. **Basic Information**
- **Title**: Used to provide context about the quiz focus
- **Description**: Provides additional context for question generation
- **Topic**: Primary subject area for question focus
- **Subtopic**: Specific area within the main topic for targeted questions

### 2. **Quiz Configuration**
- **Difficulty Level (1-5)**: Mapped to specific cognitive levels and complexity
- **Number of Questions**: Determines the scope and variety needed
- **Question Types**: Currently supports multiple-choice questions

### 3. **Content & Instructions**
- **Content Source**: Study material, notes, or specific content to base questions on
- **Additional Instructions**: Custom requirements for question generation

## Difficulty Level Mapping

The prompt includes detailed difficulty descriptions to ensure consistent question quality:

| Level | Description | Cognitive Skills |
|-------|-------------|------------------|
| 1 (Beginner) | Basic concepts, definitions, fundamental knowledge | Recall, basic understanding |
| 2 (Easy) | Simple applications, straightforward concepts | Comprehension, basic application |
| 3 (Medium) | Moderate complexity, some analysis required | Understanding, moderate application |
| 4 (Hard) | Complex scenarios, analysis and synthesis | Higher-order thinking, analysis |
| 5 (Expert) | Advanced concepts, deep understanding required | Mastery, expert-level application |

## Quality Requirements

The prompt enforces strict quality standards:

### Question Structure
- Exactly 4 options (A, B, C, D) for each question
- Only ONE correct answer per question
- All incorrect options must be plausible and educational
- Avoid "all of the above" or "none of the above" options
- Clear, unambiguous question stems

### Educational Value
- Each question tests a distinct concept or skill
- Avoid repetitive question patterns
- Questions should progress from basic to complex within difficulty level
- Explanations should be educational and help learners understand concepts

### Content Integration
- Prioritize provided content source when available
- Supplement with general topic knowledge when needed
- Ensure relevance to the specified topic/subtopic
- Follow any additional instructions provided by the user

## Technical Implementation

### Prompt Structure
1. **System Role**: Defines the AI as an expert educational content creator
2. **Task Definition**: Clear specification of what needs to be generated
3. **Quality Requirements**: Detailed guidelines for question creation
4. **Format Specification**: Exact JSON structure required
5. **Content Context**: Integration of user-provided content and instructions

### API Configuration
- **Model**: `deepseek/deepseek-chat-v3-0324:free`
- **Temperature**: 0.3 (reduced from 0.7 for more consistent results)
- **Max Tokens**: 4000 (sufficient for multiple questions)
- **Response Format**: Strict JSON-only responses

### Error Handling
- JSON parsing validation
- Question count verification
- Fallback handling for AI failures
- Cleanup of failed quiz attempts

## Benefits of This Design

### 1. **Consistency**
- Detailed difficulty descriptions ensure consistent question complexity
- Structured format requirements prevent variations in output
- Lower temperature setting reduces randomness

### 2. **Educational Quality**
- Focus on distinct concepts and skills
- Educational explanations for each question
- Plausible distractors that promote learning
- Progressive difficulty within each level

### 3. **User Experience**
- Seamless integration with form parameters
- Respect for user-provided content and instructions
- Clear feedback on generation success/failure
- Educational value in explanations

### 4. **Scalability**
- Template-based approach allows easy modifications
- Parameterized difficulty descriptions
- Flexible content integration
- Extensible for additional question types

## Future Enhancements

### Potential Improvements
1. **Question Type Expansion**: Support for true/false, fill-in-blank, matching
2. **Cognitive Level Mapping**: More detailed Bloom's taxonomy integration
3. **Subject-Specific Prompts**: Tailored prompts for different academic subjects
4. **Quality Metrics**: Automated assessment of question quality
5. **User Feedback Integration**: Learning from user corrections and feedback

### Advanced Features
1. **Adaptive Difficulty**: Dynamic difficulty adjustment based on user performance
2. **Content Analysis**: AI-powered analysis of provided content for better question generation
3. **Question Bank Integration**: Reuse and modification of existing high-quality questions
4. **Multilingual Support**: Question generation in multiple languages

## Testing and Validation

### Quality Assurance
- Automated JSON validation
- Question count verification
- Difficulty level consistency checks
- Content relevance validation

### User Testing
- Feedback collection on question quality
- Difficulty level accuracy assessment
- Content integration effectiveness
- Overall user satisfaction metrics

## Conclusion

This comprehensive prompt design ensures that the AI generates consistent, high-quality quiz questions that align with the user's specifications and educational goals. The integration with the quiz creation form provides a seamless user experience while maintaining strict quality standards for educational content. 