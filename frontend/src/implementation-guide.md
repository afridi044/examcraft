# Steps to Implement Reusable Form Components to Quiz Creation Page

Here's how to update the quiz creation page with the new form components:

1. Update imports at the top of the file:
   ```tsx
   import { 
     FormCard, 
     FormSection, 
     FormHeader, 
     TipsCard, 
     FormButton 
   } from "@/components/ui/form-components";
   ```

2. Replace the main form layout structure:
   ```tsx
   <DashboardLayout>
     <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-10 space-y-4 sm:space-y-6">
       <FormHeader 
         title="AI Quiz Generator"
         description="Create personalized multiple-choice quizzes with AI. Provide your topic and content, and our AI will generate engaging MCQ questions tailored to your needs."
         icon={<Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
         iconBgClass="from-purple-500 to-pink-500"
         titleGradient="from-purple-400 to-pink-400"
       />

       <FormCard>
         <FormSection 
           title="Basic Information" 
           icon={<BookOpen className="h-4 w-4 text-white" />}
           iconColor="from-blue-500 to-blue-600"
         >
           {/* Quiz Title and Description inputs */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
             {/* Keep existing input fields */}
           </div>
           
           {/* Topic Selection */}
           <div className="space-y-4 mt-4">
             {/* Keep existing topic selection */}
           </div>
         </FormSection>

         <FormSection 
           title="Quiz Configuration" 
           icon={<Target className="h-4 w-4 text-white" />}
           iconColor="from-green-500 to-green-600"
         >
           {/* Keep existing difficulty and questions config */}
         </FormSection>

         <FormSection 
           title="Content & Instructions" 
           icon={<FileText className="h-4 w-4 text-white" />}
           iconColor="from-orange-500 to-orange-600"
         >
           {/* Keep existing content fields */}
         </FormSection>

         {/* Generate Button */}
         <div className="pt-4 sm:pt-6 border-t border-gray-700">
           <FormButton
             onClick={handleGenerateQuiz}
             isLoading={isGenerating}
             disabled={!user}
             loadingIcon={<Loader2 className="h-5 w-5 animate-spin" />}
             loadingText="Generating Quiz..."
             icon={<Sparkles className="h-5 w-5" />}
             text="Generate AI Quiz"
             gradientFrom="purple-500"
             gradientTo="pink-500"
           />
         </div>
       </FormCard>

       <TipsCard
         icon={<Zap className="h-4 w-4 text-white" />}
         title="Pro Tips"
         gradientFrom="blue-500"
         gradientTo="purple-500"
         textColor="text-blue-300"
         tips={[
           "Provide detailed content for more accurate questions",
           "Mix question types for better learning experience",
           "Use specific additional instructions for targeted results",
           "Start with 10-15 questions for optimal quiz length"
         ]}
       />
     </div>
   </DashboardLayout>
   ```

3. Update the success screen:
   ```tsx
   <DashboardLayout>
     <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-10 space-y-4 sm:space-y-6">
       <FormHeader
         title="Quiz Generated Successfully!"
         description="Your AI-powered quiz has been created and is ready to take."
         icon={<Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-white" />}
         iconBgClass="from-green-500 to-emerald-500"
         titleGradient="from-green-400 to-emerald-400"
       />
       
       <FormCard className="max-w-2xl mx-auto">
         {/* Keep existing success card content */}
       </FormCard>
     </div>
   </DashboardLayout>
   ```

4. Use the same components in the flashcard creation page as well, following a similar pattern.
