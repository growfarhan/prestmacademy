
import React, { useState, useRef, useEffect } from 'react';
import { Search, CheckCircle2, Layout, User, CheckCircle, Trophy, Award, ExternalLink, ArrowLeft, BookOpen, Clock, PlayCircle, FileText, Image as ImageIcon, Music, Type, Download, Sparkles, X, PartyPopper } from 'lucide-react';
import { Course, Lesson } from '../types';

interface UserDashboardProps {
  courses: Course[];
  completedLessonIds: string[];
  onToggleComplete: (lessonId: string) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ courses, completedLessonIds, onToggleComplete }) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [studentName, setStudentName] = useState('');
  const [showCertModal, setShowCertModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Trigger celebration toast when progress reaches 100%
  useEffect(() => {
    if (selectedCourse) {
      const courseLessons = selectedCourse.lessons;
      const completedCount = courseLessons.filter(l => completedLessonIds.includes(l.id)).length;
      const isFinished = courseLessons.length > 0 && completedCount === courseLessons.length;
      
      if (isFinished && !showCelebration) {
        setShowCelebration(true);
        // Hide celebration after 5 seconds
        const timer = setTimeout(() => setShowCelebration(false), 5000);
        return () => clearTimeout(timer);
      } else if (!isFinished) {
        setShowCelebration(false);
      }
    }
  }, [completedLessonIds, selectedCourse]);

  const handleOpenMaterial = (lesson: Lesson) => {
    if (['link', 'document'].includes(lesson.type)) {
      window.open(lesson.content, '_blank', 'noopener,noreferrer');
    } else {
      setSelectedLesson(lesson);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const generateCertificate = () => {
    if (!selectedCourse) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions (A4 Landscape aspect ratio)
    canvas.width = 1123;
    canvas.height = 794;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative Border
    ctx.strokeStyle = '#4f46e5'; // indigo-600
    ctx.lineWidth = 30;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
    
    ctx.strokeStyle = '#e2e8f0'; // slate-200
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

    // Title
    ctx.fillStyle = '#1e293b'; // slate-800
    ctx.font = 'bold 60px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICATE OF COMPLETION', canvas.width / 2, 180);

    // Subtitle
    ctx.fillStyle = '#64748b'; // slate-500
    ctx.font = '24px Inter, sans-serif';
    ctx.fillText('This is to certify that', canvas.width / 2, 260);

    // Student Name
    ctx.fillStyle = '#4f46e5'; // indigo-600
    ctx.font = 'bold 70px "Inter", sans-serif';
    ctx.fillText(studentName || 'Learner', canvas.width / 2, 360);

    // Success Text
    ctx.fillStyle = '#64748b';
    ctx.font = '24px Inter, sans-serif';
    ctx.fillText('has successfully completed the course', canvas.width / 2, 440);

    // Course Title
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.font = 'bold 45px Inter, sans-serif';
    ctx.fillText(selectedCourse.title, canvas.width / 2, 510);

    // Date and Signature placeholders
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    ctx.fillStyle = '#94a3b8'; // slate-400
    ctx.font = '20px Inter, sans-serif';
    ctx.fillText(`Completed on: ${today}`, canvas.width / 2, 600);

    // Brand Label
    ctx.fillStyle = '#4f46e5';
    ctx.font = 'bold 30px Inter, sans-serif';
    ctx.fillText('PRESTMA ACADEMY', canvas.width / 2, 700);

    // Download the image
    const link = document.createElement('a');
    link.download = `Sertifikat-${selectedCourse.title.replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setShowCertModal(false);
  };

  // View Course/Lesson Detail
  if (selectedCourse) {
    const courseLessons = selectedCourse.lessons;
    const completedCount = courseLessons.filter(l => completedLessonIds.includes(l.id)).length;
    const progressPercent = courseLessons.length > 0 ? Math.round((completedCount / courseLessons.length) * 100) : 0;

    return (
      <div className="min-h-screen bg-slate-50 animate-in fade-in duration-500 pb-20 relative">
        {/* Celebration Toast */}
        {showCelebration && (
          <div className="fixed top-24 right-6 z-[100] animate-in slide-in-from-right-8 fade-in duration-500 pointer-events-none">
            <div className="bg-indigo-600 text-white p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 border border-white/20">
              <div className="bg-white/20 p-3 rounded-2xl animate-bounce">
                <PartyPopper size={24} className="text-yellow-300" />
              </div>
              <div>
                <h4 className="font-black text-sm uppercase tracking-widest">Pencapaian Baru!</h4>
                <p className="text-xs font-medium text-indigo-100">Kursus "{selectedCourse.title}" Selesai 100%</p>
              </div>
            </div>
          </div>
        )}

        {/* Certificate Modal */}
        {showCertModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6 animate-in zoom-in-95">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-800">Nama Sertifikat</h3>
                <button onClick={() => setShowCertModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              <p className="text-slate-500 font-medium">Masukkan nama lengkap Anda untuk dicetak pada sertifikat kelulusan.</p>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Lengkap</label>
                <input 
                  type="text" 
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none font-bold text-lg"
                  placeholder="Contoh: Budi Santoso"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  autoFocus
                />
              </div>
              <button 
                onClick={generateCertificate}
                disabled={!studentName.trim()}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
              >
                Unduh Sekarang
              </button>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>
        )}

        {/* Course Detail Header */}
        <div className={`pt-12 pb-24 px-6 transition-colors duration-500 ${selectedLesson ? 'bg-slate-900' : 'bg-indigo-900'} text-white`}>
          <div className="max-w-6xl mx-auto">
            <button
              onClick={() => {
                if (selectedLesson) setSelectedLesson(null);
                else setSelectedCourse(null);
              }}
              className="flex items-center gap-2 text-white/60 hover:text-white font-bold transition-all mb-8 group"
            >
              <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} /> 
              {selectedLesson ? 'Kembali ke Daftar Materi' : 'Kembali ke Katalog'}
            </button>
            
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
              <div className="space-y-4 flex-1">
                {!selectedLesson && (
                  <span className="bg-indigo-500/30 text-indigo-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                    {selectedCourse.category}
                  </span>
                )}
                <h1 className={`${selectedLesson ? 'text-3xl' : 'text-4xl md:text-5xl'} font-black leading-tight flex items-center gap-4 flex-wrap`}>
                  {selectedLesson ? selectedLesson.title : selectedCourse.title}
                  {progressPercent === 100 && !selectedLesson && (
                    <span className="inline-flex items-center gap-2 bg-green-500 text-white text-xs px-4 py-1.5 rounded-full animate-bounce shadow-2xl">
                      <Trophy size={14} /> LULUS
                    </span>
                  )}
                </h1>
                <div className="flex items-center gap-6 text-white/40 font-bold text-sm">
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-indigo-400" /> {selectedCourse.instructor}
                  </div>
                  {selectedLesson && (
                    <div className="flex items-center gap-2">
                       <Layout size={18} className="text-indigo-400" /> {selectedCourse.title}
                    </div>
                  )}
                </div>
              </div>

              {!selectedLesson && (
                <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 w-full lg:w-72 shadow-2xl">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Progress Belajar</span>
                    <span className="text-xl font-black">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-green-400 shadow-[0_0_20px_rgba(74,222,128,0.4)] transition-all duration-1000" 
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Viewer Mode */}
        <div className="max-w-6xl mx-auto px-6 -mt-12 space-y-8 animate-in slide-in-from-bottom-8 duration-500">
          {selectedLesson ? (
            <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200">
              <div className="p-10 md:p-14">
                {selectedLesson.type === 'text' && (
                  <div className="prose prose-slate max-w-none">
                    <div className="flex items-center gap-3 text-indigo-600 mb-8 pb-8 border-b border-slate-100">
                      <Type size={32} />
                      <span className="text-xs font-black uppercase tracking-widest">Materi Bacaan</span>
                    </div>
                    <div className="text-slate-700 leading-relaxed text-lg whitespace-pre-wrap font-medium">
                      {selectedLesson.content}
                    </div>
                  </div>
                )}

                {selectedLesson.type === 'image' && (
                  <div className="space-y-8">
                      <div className="flex items-center gap-3 text-orange-500">
                      <ImageIcon size={32} />
                      <span className="text-xs font-black uppercase tracking-widest">Materi Visual</span>
                    </div>
                    <div className="rounded-3xl overflow-hidden shadow-2xl border-8 border-slate-50">
                      <img src={selectedLesson.content} className="w-full h-auto object-contain" alt={selectedLesson.title} />
                    </div>
                  </div>
                )}

                {selectedLesson.type === 'audio' && (
                  <div className="space-y-12 py-10 flex flex-col items-center">
                      <div className="w-24 h-24 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center animate-pulse">
                        <Music size={48} />
                      </div>
                      <div className="text-center space-y-2">
                        <h3 className="font-black text-2xl text-slate-800">{selectedLesson.title}</h3>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Putar Podcast / Materi Suara</p>
                      </div>
                      <div className="w-full max-w-md bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-inner">
                        <audio controls className="w-full">
                          <source src={selectedLesson.content} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                  </div>
                )}

                <div className="mt-14 pt-10 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onToggleComplete(selectedLesson.id)}
                      className={`px-8 py-3.5 rounded-2xl font-black text-sm transition-all flex items-center gap-3 shadow-xl ${
                        completedLessonIds.includes(selectedLesson.id)
                          ? 'bg-green-100 text-green-600'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {completedLessonIds.includes(selectedLesson.id) ? <CheckCircle2 size={20} /> : <CheckCircle size={20} />}
                      {completedLessonIds.includes(selectedLesson.id) ? 'Selesai Dipelajari' : 'Tandai Selesai'}
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 font-bold text-xs">
                    <Clock size={16} /> Durasi Estimasi: {selectedLesson.duration}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Normal Curriculum List Mode */
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-indigo-900/10 border border-slate-200 overflow-hidden">
              <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h2 className="text-2xl font-black text-slate-800 flex items-center gap-4">
                    Struktur Kurikulum <Award className="text-indigo-600" size={32} />
                  </h2>
                  <p className="hidden md:block text-xs font-black text-slate-400 uppercase tracking-widest">Total {courseLessons.length} Materi</p>
              </div>
              
              <div className="divide-y divide-slate-100">
                {courseLessons.map((lesson, idx) => {
                  const isCompleted = completedLessonIds.includes(lesson.id);
                  const getLessonIcon = () => {
                    switch(lesson.type) {
                      case 'text': return <Type size={22} />;
                      case 'image': return <ImageIcon size={22} />;
                      case 'audio': return <Music size={22} />;
                      case 'document': return <FileText size={22} />;
                      default: return <PlayCircle size={22} />;
                    }
                  };
                  const getLessonColor = () => {
                    switch(lesson.type) {
                      case 'text': return 'text-emerald-500 bg-emerald-50';
                      case 'image': return 'text-orange-500 bg-orange-50';
                      case 'audio': return 'text-pink-500 bg-pink-50';
                      case 'document': return 'text-blue-500 bg-blue-50';
                      default: return 'text-indigo-600 bg-indigo-50';
                    }
                  };

                  return (
                    <div 
                      key={lesson.id} 
                      className={`group flex flex-col md:flex-row items-center gap-8 p-10 transition-all hover:bg-slate-50/80 ${isCompleted ? 'bg-green-50/20' : ''}`}
                    >
                      <div className={`w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-[1.5rem] text-xl font-black transition-all ${
                        isCompleted ? 'bg-green-500 text-white shadow-xl shadow-green-100' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {isCompleted ? <CheckCircle size={28} /> : idx + 1}
                      </div>

                      <div className="flex-1 text-center md:text-left space-y-1">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 ${getLessonColor()}`}>
                              {getLessonIcon()} {lesson.type}
                            </span>
                            {isCompleted && (
                              <span className="text-[10px] font-black text-green-600 flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                                <CheckCircle2 size={12} /> SELESAI
                              </span>
                            )}
                        </div>
                        <h3 
                          onClick={() => handleOpenMaterial(lesson)}
                          className="text-xl font-black text-slate-800 group-hover:text-indigo-600 cursor-pointer transition-colors"
                        >
                          {lesson.title}
                        </h3>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">{lesson.description}</p>
                      </div>

                      <div className="flex gap-4">
                        <button
                          onClick={() => handleOpenMaterial(lesson)}
                          className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:scale-105"
                        >
                          {lesson.type === 'link' ? 'Tonton' : lesson.type === 'text' ? 'Baca' : 'Buka'} <ExternalLink size={18} />
                        </button>
                        <button
                          onClick={() => onToggleComplete(lesson.id)}
                          className={`p-4 rounded-2xl border-2 transition-all ${
                            isCompleted 
                              ? 'bg-green-500 border-green-500 text-white shadow-lg' 
                              : 'border-slate-200 text-slate-300 hover:border-indigo-600 hover:text-indigo-600'
                          }`}
                        >
                          <CheckCircle2 size={24} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {progressPercent === 100 && (
                <div className="p-16 bg-gradient-to-br from-green-50 to-emerald-50 flex flex-col items-center text-center space-y-6">
                  <div className="w-28 h-28 bg-green-500 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl animate-bounce">
                    <Trophy size={56} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-green-900">Selamat! Course Selesai</h3>
                    <p className="text-green-700/80 max-w-lg font-bold text-lg">Anda telah menuntaskan seluruh kurikulum pembelajaran ini dengan sangat baik.</p>
                  </div>
                  <button 
                    onClick={() => setShowCertModal(true)}
                    className="bg-green-600 text-white px-10 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl hover:bg-green-700 transition-all hover:scale-105 active:scale-95"
                  >
                    <Download size={20} /> Unduh Sertifikat Kelulusan
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Course Catalog View (When selectedCourse is null)
  return (
    <div className="min-h-screen bg-slate-50 animate-in fade-in duration-500">
      <div className="bg-indigo-900 text-white pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter">
            Lompat ke <span className="text-indigo-400">Masa Depan</span>
          </h1>
          <p className="text-xl text-indigo-100/60 max-w-2xl mx-auto font-medium">
            Pilih kursus terbaik dan mulai belajar sekarang dengan kurikulum berbasis industri.
          </p>
          
          <div className="max-w-2xl mx-auto relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={24} />
            <input
              type="text"
              placeholder="Cari kursus atau kategori..."
              className="w-full pl-16 pr-8 py-6 bg-white rounded-[2rem] text-slate-900 font-bold text-lg shadow-2xl outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-16 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map(course => (
            <div 
              key={course.id} 
              onClick={() => setSelectedCourse(course)}
              className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all group/card shadow-sm cursor-pointer flex flex-col"
            >
              <div className="h-56 relative overflow-hidden bg-slate-100">
                <img src={course.thumbnail} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700" alt={course.title} />
                <div className="absolute top-5 left-5">
                  <span className="text-[10px] font-black text-white px-4 py-1.5 bg-indigo-600 rounded-full uppercase tracking-widest shadow-xl">{course.category}</span>
                </div>
                <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
                   <div className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-black shadow-2xl scale-90 group-hover/card:scale-100 transition-transform">LIHAT MATERI</div>
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-xl text-slate-800 line-clamp-2 leading-tight mb-2 group-hover/card:text-indigo-600 transition-colors">{course.title}</h3>
                  <p className="text-slate-400 text-sm font-bold">{course.instructor}</p>
                </div>
                <div className="flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest pt-6 border-t border-slate-50 mt-6">
                   <div className="flex items-center gap-2"><BookOpen size={14} className="text-indigo-600" /> {course.lessons.length} Materi</div>
                   <div className="text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">Baru</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="py-24 text-center space-y-4">
             <div className="inline-flex p-6 bg-slate-100 rounded-full text-slate-300">
               <Search size={48} />
             </div>
             <p className="text-slate-400 font-black text-xl">Kursus tidak ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
