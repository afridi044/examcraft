// Books Service - Mock Data
import type { Book } from '@/types';

// Mock books data with real accessible books
const mockBooks: Book[] = [
  {
    id: "book-1",
    title: "Introduction to Psychology",
    description: "Comprehensive guide covering fundamental psychological concepts, theories, and research methods. Perfect for students beginning their psychology journey.",
    subject: "Psychology",
    pageCount: 450,
    chapterCount: 12,
    dateAdded: "2024-01-15T10:30:00Z",
    coverColor: "from-blue-500 to-indigo-600",
    isDigital: true,
    format: "textbook",
    url: "https://openstax.org/details/books/psychology-2e"
  },
  {
    id: "book-2",
    title: "College Physics",
    description: "Essential physics formulas, equations, and conceptual explanations. Covers mechanics, thermodynamics, electromagnetism, and modern physics.",
    subject: "Physics",
    pageCount: 280,
    chapterCount: 8,
    dateAdded: "2024-01-20T14:15:00Z",
    coverColor: "from-purple-500 to-pink-600",
    isDigital: true,
    format: "study-guide",
    url: "https://openstax.org/details/books/college-physics-2e"
  },
  {
    id: "book-3",
    title: "SAT Math Practice",
    description: "Comprehensive SAT mathematics preparation with practice problems, strategies, and detailed explanations for all math topics covered in the exam.",
    subject: "Mathematics",
    pageCount: 320,
    chapterCount: 10,
    dateAdded: "2024-02-05T09:45:00Z",
    coverColor: "from-green-500 to-emerald-600",
    isDigital: true,
    format: "study-guide",
    url: "https://www.khanacademy.org/sat"
  },
  {
    id: "book-4",
    title: "Organic Chemistry",
    description: "Advanced organic chemistry concepts including reaction mechanisms, stereochemistry, and synthesis strategies with detailed molecular structures.",
    subject: "Chemistry",
    pageCount: 520,
    chapterCount: 15,
    dateAdded: "2024-02-10T16:20:00Z",
    coverColor: "from-orange-500 to-red-600",
    isDigital: true,
    format: "textbook",
    url: "https://openstax.org/details/books/organic-chemistry"
  },
  {
    id: "book-5",
    title: "Calculus Volume 1",
    description: "Comprehensive calculus textbook covering limits, derivatives, and integrals. Includes detailed examples and practice problems.",
    subject: "Mathematics",
    pageCount: 380,
    chapterCount: 11,
    dateAdded: "2024-02-15T11:10:00Z",
    coverColor: "from-teal-500 to-cyan-600",
    isDigital: true,
    format: "textbook",
    url: "https://openstax.org/details/books/calculus-volume-1"
  },
  {
    id: "book-6",
    title: "Biology 2e",
    description: "Comprehensive biology textbook covering cell biology, genetics, evolution, and ecology. Perfect for college-level biology courses.",
    subject: "Biology",
    pageCount: 420,
    chapterCount: 14,
    dateAdded: "2024-02-20T13:25:00Z",
    coverColor: "from-indigo-500 to-purple-600",
    isDigital: true,
    format: "textbook",
    url: "https://openstax.org/details/books/biology-2e"
  },
  {
    id: "book-7",
    title: "U.S. History",
    description: "Comprehensive U.S. history textbook covering from pre-colonial times to modern era. Includes primary sources and historical analysis.",
    subject: "History",
    pageCount: 350,
    chapterCount: 9,
    dateAdded: "2024-02-25T15:40:00Z",
    coverColor: "from-amber-500 to-yellow-600",
    isDigital: true,
    format: "textbook",
    url: "https://openstax.org/details/books/us-history"
  },
  {
    id: "book-8",
    title: "Microeconomics",
    description: "Introduction to microeconomic principles including supply and demand, market structures, and economic decision-making.",
    subject: "Economics",
    pageCount: 290,
    chapterCount: 7,
    dateAdded: "2024-03-01T12:30:00Z",
    coverColor: "from-lime-500 to-green-600",
    isDigital: true,
    format: "textbook",
    url: "https://openstax.org/details/books/principles-microeconomics-3e"
  }
];

export const booksService = {
  /**
   * Get all books (mock data)
   */
  async getBooks(): Promise<Book[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockBooks;
  },

  /**
   * Get book by ID (mock data)
   */
  async getBookById(bookId: string): Promise<Book | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockBooks.find(book => book.id === bookId) || null;
  },

  /**
   * Search books by title, description, or subject (mock data)
   */
  async searchBooks(query: string): Promise<Book[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const lowercaseQuery = query.toLowerCase();
    return mockBooks.filter(book => 
      book.title.toLowerCase().includes(lowercaseQuery) ||
      book.description.toLowerCase().includes(lowercaseQuery) ||
      book.subject.toLowerCase().includes(lowercaseQuery)
    );
  },

  /**
   * Get books by subject (mock data)
   */
  async getBooksBySubject(subject: string): Promise<Book[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockBooks.filter(book => 
      book.subject.toLowerCase() === subject.toLowerCase()
    );
  }
}; 