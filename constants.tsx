
import { Course } from './types';

export const INITIAL_COURSES: Course[] = [
  {
    id: '1',
    title: 'Mastering React 18',
    instructor: 'Alex Rivera',
    category: 'Development',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop',
    createdAt: Date.now(),
    lessons: [
      {
        id: 'l1',
        title: 'Pengenalan React Hooks',
        type: 'link',
        content: 'https://www.youtube.com/watch?v=TNhaISOUy6Q',
        duration: '15:20',
        description: 'Pelajari dasar-dasar Hooks dalam React.'
      },
      {
        id: 'l2',
        title: 'Panduan Instalasi PDF',
        type: 'document',
        content: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        duration: '05:00',
        description: 'Dokumen panduan setting environment.'
      },
      {
        id: 'ltext',
        title: 'Catatan Teori Komponen',
        type: 'text',
        content: 'React adalah library JavaScript untuk membangun user interface. Komponen adalah bagian inti dari React yang memungkinkan kita membagi UI menjadi bagian-bagian yang independen dan dapat digunakan kembali.',
        duration: '10:00',
        description: 'Ringkasan materi dalam bentuk teks.'
      }
    ]
  },
  {
    id: '2',
    title: 'UI/UX Design Masterclass',
    instructor: 'Sarah Jenkins',
    category: 'Design',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=800&auto=format&fit=crop',
    createdAt: Date.now() - 86400000,
    lessons: [
      {
        id: 'limg',
        title: 'Infografis Psikologi Warna',
        type: 'image',
        content: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop',
        duration: '08:00',
        description: 'Referensi visual pemilihan warna desain.'
      },
      {
        id: 'laudio',
        title: 'Podcast: Masa Depan Desain',
        type: 'audio',
        content: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        duration: '12:45',
        description: 'Dengarkan diskusi mendalam tentang tren UI/UX.'
      }
    ]
  }
];
