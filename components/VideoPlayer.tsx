
import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle, Loader2, Youtube, ExternalLink, RefreshCw } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  title: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [key, setKey] = useState(0); // Digunakan untuk re-mount iframe jika terjadi error

  const videoId = useMemo(() => {
    if (!url) return null;
    const cleanUrl = url.trim();
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern);
      if (match && match[1]) return match[1];
    }
    return /^[a-zA-Z0-9_-]{11}$/.test(cleanUrl) ? cleanUrl : null;
  }, [url]);

  const embedUrl = useMemo(() => {
    if (!videoId) return null;
    
    // Gunakan parameter minimal untuk mencegah Error 153 (Config Error)
    // Menghindari 'origin' dan 'enablejsapi' jika tidak diperlukan interaksi API JS
    const params = new URLSearchParams({
      autoplay: '1',
      rel: '0',
      modestbranding: '1',
      playsinline: '1', // Penting untuk mobile
      showinfo: '0'
    });
    
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }, [videoId]);

  useEffect(() => {
    setIsLoading(true);
    setHasError(!videoId);
  }, [url, videoId]);

  const handleRetry = () => {
    setKey(prev => prev + 1);
    setIsLoading(true);
  };

  if (hasError || !videoId) {
    return (
      <div className="aspect-video w-full bg-slate-100 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 text-slate-500 p-8 text-center animate-in fade-in">
        <Youtube size={48} className="text-red-400 mb-4" />
        <h3 className="font-bold text-slate-800">Video Tidak Valid</h3>
        <p className="text-xs mt-1 text-slate-400">Pastikan link YouTube yang Anda masukkan sudah benar.</p>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-4 flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline"
        >
          <ExternalLink size={14} /> Buka Manual di YouTube
        </a>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full bg-black rounded-3xl overflow-hidden shadow-2xl group border-4 border-white">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-20">
          <Loader2 className="text-white animate-spin" size={40} />
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-4">Memuat Konten Video...</p>
        </div>
      )}
      
      {/* Overlay Control Bar */}
      <div className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <button 
          onClick={handleRetry}
          className="bg-black/60 backdrop-blur-md text-white p-2 rounded-xl border border-white/20 hover:bg-indigo-600 transition-all"
          title="Muat Ulang Pemutar"
        >
          <RefreshCw size={14} />
        </button>
        <a 
          href={`https://youtube.com/watch?v=${videoId}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-2 border border-white/20 hover:bg-red-600 transition-all"
        >
          <ExternalLink size={12} /> Buka di YouTube
        </a>
      </div>

      <iframe
        key={key}
        className="w-full h-full"
        src={embedUrl || ''}
        title={title}
        onLoad={() => setIsLoading(false)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      ></iframe>
    </div>
  );
};

export default VideoPlayer;
