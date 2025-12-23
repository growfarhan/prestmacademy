
export type MaterialType = 'link' | 'text' | 'image' | 'audio' | 'document';

export interface Lesson {
  id: string;
  title: string;
  type: MaterialType;
  content: string; // Bisa berupa URL, Base64 (untuk file unggahan), atau teks mentah
  duration: string;
  description: string;
}

export interface Course {
  id: string;
  title: string;
  thumbnail: string;
  instructor: string;
  category: string;
  lessons: Lesson[];
  createdAt: number;
}

export type UserRole = 'admin' | 'student';

export interface UserState {
  role: UserRole;
}
