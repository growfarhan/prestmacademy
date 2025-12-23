
import React, { useState, useRef } from 'react';
import { Plus, Trash2, Edit3, X, Sparkles, Youtube, Image as ImageIcon, Filter, Link as LinkIcon, ExternalLink, FileText, Music, Type, MessageSquareText, BookOpen, Paperclip, Upload, Loader2 } from 'lucide-react';
import { Course, Lesson, MaterialType } from '../types';
import { geminiService } from '../services/geminiService';

interface AdminDashboardProps {
  courses: Course[];
  onUpdateCourses: (courses: Course[]) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ courses, onUpdateCourses }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [processingFile, setProcessingFile] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [courseForm, setCourseForm] = useState<Partial<Course>>({
    title: '',
    instructor: '',
    category: 'Teknologi',
    thumbnail: '',
    lessons: []
  });

  const categories = ['Semua Kategori', ...Array.from(new Set(courses.map(c => c.category)))];

  const filteredCourses = selectedCategory === 'Semua Kategori' 
    ? courses 
    : courses.filter(c => c.category === selectedCategory);

  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const cleanUrl = url.trim();
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  };

  const handleOpenAddForm = () => {
    setEditingId(null);
    setCourseForm({ title: '', instructor: '', category: 'Teknologi', thumbnail: '', lessons: [] });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (course: Course) => {
    setEditingId(course.id);
    setCourseForm({
      title: course.title,
      instructor: course.instructor,
      category: course.category,
      thumbnail: course.thumbnail,
      lessons: [...course.lessons.map(l => ({ ...l }))]
    });
    setIsFormOpen(true);
  };

  const handleSaveCourse = () => {
    if (!courseForm.title) {
      alert("Harap isi judul kursus.");
      return;
    }

    let finalThumbnail = courseForm.thumbnail;
    if (!finalThumbnail && courseForm.lessons && courseForm.lessons.length > 0) {
      const firstLesson = courseForm.lessons[0];
      if (firstLesson.type === 'link') {
        const vidId = getYouTubeId(firstLesson.content);
        if (vidId) finalThumbnail = `https://img.youtube.com/vi/${vidId}/maxresdefault.jpg`;
      } else if (firstLesson.type === 'image') {
        finalThumbnail = firstLesson.content;
      }
    }

    if (!finalThumbnail) finalThumbnail = `https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=800&auto=format&fit=crop`;

    if (editingId) {
      const updatedCourses = courses.map(c => 
        c.id === editingId 
          ? { ...c, ...courseForm as Course, thumbnail: finalThumbnail } 
          : c
      );
      onUpdateCourses(updatedCourses);
    } else {
      const courseToAdd: Course = {
        id: Date.now().toString(),
        title: courseForm.title!,
        instructor: courseForm.instructor || 'Instructor',
        category: courseForm.category || 'Pendidikan',
        thumbnail: finalThumbnail,
        createdAt: Date.now(),
        lessons: courseForm.lessons || []
      };
      onUpdateCourses([courseToAdd, ...courses]);
    }

    setIsFormOpen(false);
    setEditingId(null);
  };

  const updateLesson = (index: number, field: keyof Lesson, value: any) => {
    const updatedLessons = [...(courseForm.lessons || [])];
    updatedLessons[index] = { ...updatedLessons[index], [field]: value };
    setCourseForm({ ...courseForm, lessons: updatedLessons });
  };

  const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Batasi ukuran file (LocalStorage biasanya punya limit 5MB-10MB total)
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file terlalu besar. Maksimal 2MB untuk menjaga performa.");
      return;
    }

    setProcessingFile(index);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      updateLesson(index, 'content', base64);
      setProcessingFile(null);
      // Reset input agar bisa upload file yang sama lagi jika perlu
      if (e.target) e.target.value = '';
    };
    reader.onerror = () => {
      alert("Gagal membaca file.");
      setProcessingFile(null);
    };
    reader.readAsDataURL(file);
  };

  const generateAIContent = async () => {
    if (!courseForm.title) return;
    setLoadingAI(true);
    try {
      const plan = await geminiService.generateLessonPlan(courseForm.title);
      setCourseForm({
        ...courseForm,
        lessons: plan.map((p: any, i: number) => ({
          id: `ai-${i}-${Date.now()}`,
          title: p.title,
          description: p.description,
          type: 'text',
          content: 'Konten sedang disiapkan oleh AI...',
          duration: '10:00'
        }))
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAI(false);
    }
  };

  const getIconForType = (type: MaterialType) => {
    switch(type) {
      case 'text': return <Type size={18} className="text-emerald-500" />;
      case 'image': return <ImageIcon size={18} className="text-orange-500" />;
      case 'audio': return <Music size={18} className="text-pink-500" />;
      case 'document': return <FileText size={18} className="text-blue-500" />;
      default: return <LinkIcon size={18} className="text-indigo-500" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">Panel Kontrol Instructor</h1>
          <p className="text-slate-500 font-medium">Kelola kurikulum dengan upload file (PDF, Gambar, Audio) atau tautan luar.</p>
        </div>
        
        {!isFormOpen && (
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative min-w-[200px]">
              <Filter className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-indigo-100 outline-none cursor-pointer hover:border-indigo-200 transition-all shadow-sm"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenAddForm}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95"
            >
              <Plus size={20} /> Buat Kursus Baru
            </button>
          </div>
        )}
      </header>

      {isFormOpen && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Judul Kursus</label>
                <input
                  type="text"
                  placeholder="Misal: Teknik Desain Produk Digital"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all text-xl font-bold"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nama Instruktur</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none font-bold"
                    value={courseForm.instructor}
                    onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Kategori</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none font-bold bg-slate-50"
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                  >
                    <option value="Teknologi">Teknologi</option>
                    <option value="Desain">Desain</option>
                    <option value="Bisnis">Bisnis</option>
                    <option value="Pengembangan Diri">Pengembangan Diri</option>
                    <option value="Seni">Seni</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Thumbnail (URL)</label>
              <div className="aspect-video rounded-2xl border-2 border-slate-100 bg-slate-50 overflow-hidden relative group">
                {courseForm.thumbnail ? (
                  <img src={courseForm.thumbnail} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                    <ImageIcon size={48} />
                    <p className="text-[10px] font-bold mt-2">PREVIEW IMAGE</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                   <button onClick={() => setCourseForm({...courseForm, thumbnail: ''})} className="bg-white/20 backdrop-blur-md p-2 rounded-xl text-white hover:bg-red-500 transition-colors">
                     <Trash2 size={20} />
                   </button>
                </div>
              </div>
              <input 
                type="text"
                placeholder="https://images.unsplash.com/..."
                className="w-full mt-2 px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium"
                value={courseForm.thumbnail}
                onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                Kurikulum & Materi <span className="text-indigo-600">({courseForm.lessons?.length || 0})</span>
              </h3>
              <div className="flex gap-2">
                <button onClick={generateAIContent} disabled={loadingAI || !courseForm.title} className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-indigo-100 transition-all disabled:opacity-50">
                   <Sparkles size={14} /> {loadingAI ? 'AI Bekerja...' : 'Generate AI'}
                </button>
                <button onClick={() => setCourseForm({ ...courseForm, lessons: [...(courseForm.lessons || []), { id: Date.now().toString(), title: '', type: 'link', content: '', duration: '10:00', description: '' }] })} className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-black transition-all">
                  <Plus size={14} /> Tambah Materi
                </button>
              </div>
            </div>

            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-3 custom-scrollbar">
              {courseForm.lessons?.map((lesson, idx) => (
                <div key={lesson.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-200 relative group/lesson hover:border-indigo-300 transition-all space-y-4">
                  <div className="grid md:grid-cols-12 gap-6">
                    <div className="md:col-span-5 space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Judul Materi</label>
                      <input type="text" className="w-full px-4 py-2 rounded-xl border border-slate-200 font-bold text-sm" value={lesson.title} onChange={e => updateLesson(idx, 'title', e.target.value)} placeholder="Contoh: Pengenalan Dasar" />
                    </div>
                    
                    <div className="md:col-span-4 space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipe Materi</label>
                      <div className="flex items-center gap-2">
                         <div className="flex-1 grid grid-cols-5 gap-1 bg-white p-1 rounded-xl border border-slate-200">
                           {(['link', 'text', 'image', 'audio', 'document'] as MaterialType[]).map(t => (
                             <button
                               key={t}
                               onClick={() => updateLesson(idx, 'type', t)}
                               className={`p-2 rounded-lg flex justify-center transition-all ${lesson.type === t ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100'}`}
                               title={t.toUpperCase()}
                             >
                               {t === 'link' && <LinkIcon size={14} />}
                               {t === 'text' && <MessageSquareText size={14} />}
                               {t === 'image' && <ImageIcon size={14} />}
                               {t === 'audio' && <Music size={14} />}
                               {t === 'document' && <FileText size={14} />}
                             </button>
                           ))}
                         </div>
                      </div>
                    </div>

                    <div className="md:col-span-3 space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimasi Durasi</label>
                       <input type="text" className="w-full px-4 py-2 rounded-xl border border-slate-200 font-bold text-sm" value={lesson.duration} onChange={e => updateLesson(idx, 'duration', e.target.value)} placeholder="00:00" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                         {getIconForType(lesson.type)} {lesson.type === 'text' ? 'Isi Materi Artikel' : 'Tautan / File Materi' }
                      </label>
                      {lesson.type !== 'text' && lesson.type !== 'link' && (
                        <div className="relative">
                          <input 
                            type="file" 
                            className="hidden" 
                            id={`file-upload-${idx}`} 
                            accept={lesson.type === 'image' ? 'image/*' : lesson.type === 'audio' ? 'audio/*' : '.pdf,.doc,.docx'} 
                            onChange={(e) => handleFileUpload(idx, e)}
                          />
                          <label 
                            htmlFor={`file-upload-${idx}`}
                            className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-lg cursor-pointer transition-all border border-indigo-100"
                          >
                            {processingFile === idx ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                            UPLOAD FILE
                          </label>
                        </div>
                      )}
                    </div>
                    
                    {lesson.type === 'text' ? (
                      <textarea 
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-medium text-sm min-h-[120px] focus:ring-2 focus:ring-indigo-100 outline-none"
                        value={lesson.content}
                        onChange={e => updateLesson(idx, 'content', e.target.value)}
                        placeholder="Tuliskan materi teks di sini..."
                      />
                    ) : (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input 
                            type="text" 
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none pr-24" 
                            placeholder={lesson.content.startsWith('data:') ? 'File Terunggah (Base64)' : `Tempel link ${lesson.type} di sini...`}
                            value={lesson.content.startsWith('data:') ? 'LOKAL: ' + (lesson.type.toUpperCase() + ' FILE') : lesson.content} 
                            onChange={e => updateLesson(idx, 'content', e.target.value)} 
                          />
                          {lesson.content.startsWith('data:') && (
                            <span className="absolute right-3 top-2.5 bg-green-100 text-green-600 text-[9px] font-black px-2 py-1 rounded-md border border-green-200 flex items-center gap-1">
                              <Paperclip size={10} /> TERUNGGAH
                            </span>
                          )}
                        </div>
                        <button onClick={() => window.open(lesson.content, '_blank')} disabled={!lesson.content} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 disabled:opacity-20 transition-all shadow-sm">
                          <ExternalLink size={20} />
                        </button>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => { const l = [...(courseForm.lessons || [])]; l.splice(idx, 1); setCourseForm({...courseForm, lessons: l}) }} 
                    className="absolute -right-3 -top-3 bg-white text-red-400 border border-slate-200 p-2 rounded-full opacity-0 group-hover/lesson:opacity-100 hover:bg-red-500 hover:text-white transition-all shadow-lg z-10"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <button onClick={() => setIsFormOpen(false)} className="px-8 py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors">Batal</button>
            <button onClick={handleSaveCourse} className="bg-indigo-600 text-white px-12 py-3 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all">
              {editingId ? 'Simpan Perubahan' : 'Terbitkan Kursus'}
            </button>
          </div>
        </div>
      )}

      {filteredCourses.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map(course => (
            <div key={course.id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all group/card shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4">
              <div className="h-56 relative overflow-hidden bg-slate-100">
                <img src={course.thumbnail} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/card:opacity-100 flex items-center justify-center transition-all gap-4 backdrop-blur-[2px]">
                  <button onClick={() => handleOpenEditForm(course)} className="bg-white p-4 rounded-2xl text-slate-900 hover:bg-indigo-600 hover:text-white transition-all shadow-xl font-bold"><Edit3 size={24} /></button>
                  <button onClick={() => { if(confirm('Hapus kursus ini?')) onUpdateCourses(courses.filter(c => c.id !== course.id)) }} className="bg-red-500 p-4 rounded-2xl text-white hover:bg-red-600 transition-all shadow-xl"><Trash2 size={24} /></button>
                </div>
                <div className="absolute top-5 left-5">
                  <span className="text-[10px] font-black text-white px-4 py-1.5 bg-indigo-600 rounded-full uppercase tracking-widest shadow-xl">{course.category}</span>
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-xl text-slate-800 line-clamp-2 leading-tight mb-2 group-hover/card:text-indigo-600 transition-colors">{course.title}</h3>
                  <p className="text-slate-400 text-sm font-bold">{course.instructor}</p>
                </div>
                <div className="flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest pt-6 border-t border-slate-50 mt-6">
                   <div className="flex items-center gap-2"><BookOpen size={14} className="text-indigo-600" /> {course.lessons.length} Materi</div>
                   <div className="text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">{new Date(course.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 flex flex-col items-center justify-center text-slate-300 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
           <div className="bg-slate-50 p-6 rounded-full mb-6">
             <Filter size={64} className="opacity-20" />
           </div>
           <p className="font-black text-xl text-slate-400">Belum ada kursus yang dibuat</p>
           <button onClick={handleOpenAddForm} className="mt-6 text-indigo-600 text-sm font-black uppercase tracking-widest hover:bg-indigo-50 px-6 py-3 rounded-xl transition-all">Mulai Buat Kursus Pertama</button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
