import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Calendar, 
  PlayCircle, 
  BookOpen, 
  ChevronRight,
  Heart, 
  Users, 
  Info, 
  Youtube, 
  Navigation as NavIcon, 
  ChevronDown, 
  Quote, 
  Star, 
  ExternalLink,
  Train,
  Bus,
  Car,
  Loader2,
  Video,
  CreditCard,
  Bell
} from 'lucide-react';

// --- 전역 설정 (유튜브 API용) ---
const YOUTUBE_API_KEY = "AIzaSyCcNp1sgnwVpv73VlhU-l2bPjA4w0BRn9M"; 
const YOUTUBE_CHANNEL_ID = "UCC89jn_fly4DJqzY96M8cBA"; 

// --- 전역 데이터 ---
const worshipTimes = [
  { name: '주일 예배 1부', time: '오전 11:00' },
  { name: '주일 예배 2부', time: '오후 02:00' },
  { name: '새벽 예배', time: '월-금 새벽 05:30' },
  { name: '수요 예배', time: '저녁 07:30' },
  { name: '금요 예배', time: '저녁 08:00' },
];

const images = {
  logo: "./logo.webp",
  hero1: "./hero1.jpg",
  hero2: "./hero2.jpg",
  church_info: "./church_info.webp",
  map_static: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1200"
};

const heroImages = [images.hero1, images.hero2];

// --- 공지사항 팝업 컴포넌트 (크기 대폭 축소 및 닫기 버튼 가시성 강화) ---
const NoticePopup = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-[300px] md:max-w-xs rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative border border-white/20">
        {/* 상단 헤더: 높이를 줄이고 버튼 위치 최적화 */}
        <div className="bg-slate-800 py-5 px-6 text-center text-white relative">
          <h3 className="text-lg font-black tracking-tighter">센트럴처치 안내</h3>
          <div className="w-6 h-0.5 bg-indigo-500 mx-auto mt-2 rounded-full"></div>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-white/60 hover:text-white bg-white/10 p-1.5 rounded-full transition-all"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* 본문 내용: 여백 최소화 및 가독성 중심 배치 */}
        <div className="p-5 space-y-6 font-noto">
          <div className="text-center">
            <p className="text-gray-900 font-bold text-sm md:text-base leading-relaxed">
              주일 1,2부 예배시 <br />
              <span className="text-indigo-600">10분 전부터 찬양</span>이 시작됩니다.
            </p>
          </div>

          <div className="w-full h-px bg-gray-100"></div>

          <div className="text-center">
            <h4 className="text-gray-400 font-black text-[9px] uppercase tracking-widest mb-0.5">주차 안내</h4>
            <p className="text-gray-800 font-bold text-xs">교회 앞 공영주차장을 이용해 주세요.</p>
          </div>

          <div className="w-full h-px bg-gray-100"></div>

          <div className="text-center">
            <h4 className="text-gray-400 font-black text-[9px] uppercase tracking-widest mb-0.5">설교 영상</h4>
            <p className="text-gray-800 font-bold text-xs">지난 설교는 <span className="text-red-600 font-black">교회 유튜브</span>에서</p>
            <p className="text-gray-400 text-[10px]">(센트럴처치 검색)</p>
          </div>

          {/* 온라인 헌금 박스 (콤팩트 디자인) */}
          <div className="bg-indigo-50/50 rounded-2xl p-4 text-center border border-indigo-100">
            <h4 className="text-indigo-600 font-black text-[9px] uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1.5">
              <CreditCard size={12} /> 온라인 헌금
            </h4>
            <p className="text-gray-900 font-black text-base tracking-tight mb-0.5 font-sans">국민은행 437637-01-009066</p>
            <p className="text-gray-600 font-bold text-[11px] mb-2">예금주: 중앙교회</p>
            <p className="text-[9px] text-gray-400 leading-tight font-medium">
              성함과 헌금 명목을 꼭 적어주세요.
            </p>
          </div>
        </div>

        <button 
          onClick={onClose} 
          className="w-full py-4 bg-slate-800 text-white font-black uppercase tracking-[0.2em] text-[10px] hover:bg-black transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  );
};

// --- 비디오 모달 플레이어 컴포넌트 ---
const VideoModal = ({ videoId, onClose }) => {
  if (!videoId) return null;
  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
      <div className="relative w-full max-w-5xl aspect-video rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl bg-black border border-white/10" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 z-20 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full transition-all"
        >
          <X size={28} />
        </button>
        <iframe 
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

// --- 메인 App 컴포넌트 ---

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (YOUTUBE_API_KEY && YOUTUBE_CHANNEL_ID) {
      const fetchVideos = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&maxResults=6&type=video`);
          const data = await res.json();
          if (data.items) setVideos(data.items);
        } catch (err) {
          console.error("유튜브 로딩 에러:", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchVideos();
    }
  }, []);

  useEffect(() => {
    if (isMenuOpen || isPopupOpen || selectedVideoId) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    }
  }, [isMenuOpen, isPopupOpen, selectedVideoId]);

  useEffect(() => { window.scrollTo(0, 0); }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home onWorshipClick={() => setActiveTab('worship')} />;
      case 'about': return <About />;
      case 'worship': return <Worship />;
      case 'sermon': return <Sermon videos={videos} isLoading={isLoading} onVideoSelect={setSelectedVideoId} />;
      case 'contact': return <Contact />;
      default: return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-900 tracking-tight overflow-x-hidden">
      
      {isPopupOpen && <NoticePopup onClose={() => setIsPopupOpen(false)} />}
      
      {selectedVideoId && <VideoModal videoId={selectedVideoId} onClose={() => setSelectedVideoId(null)} />}

      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-[9999] flex flex-col animate-in fade-in slide-in-from-right duration-300 font-bold font-sans">
          <div className="flex justify-between items-center p-8 border-b border-gray-50">
            <img src={images.logo} alt="Logo" className="h-8 object-contain" onError={(e) => e.target.style.display='none'} />
            <button onClick={() => setIsMenuOpen(false)} className="text-gray-900 p-2"><X size={32} strokeWidth={1.5} /></button>
          </div>
          <div className="flex flex-col p-10 space-y-8 overflow-y-auto">
            {[
              { id: 'home', label: '홈' }, 
              { id: 'about', label: '교회소개' }, 
              { id: 'worship', label: '예배시간' }, 
              { id: 'sermon', label: '다시듣기' }, 
              { id: 'contact', label: '찾아오는 길' }
            ].map((tab) => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setIsMenuOpen(false); }} className={`text-5xl font-black text-left tracking-tighter ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-300'} active:text-indigo-400 transition-colors uppercase font-bold`}>{tab.label}</button>
            ))}
          </div>
          <div className="mt-auto p-10 border-t border-gray-50 bg-gray-50/50"><p className="text-[10px] font-black text-gray-300 tracking-[0.4em] uppercase font-sans font-bold">© 2026 Central Church</p></div>
        </div>
      )}

      <nav className={`fixed w-full z-[1000] transition-all duration-500 font-bold ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-2' : 'bg-white py-4 md:py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center font-sans">
          <div className="flex items-center cursor-pointer group" onClick={() => setActiveTab('home')}>
            <div className="relative h-10 md:h-14 flex items-center">
               <img src={images.logo} alt="Central Church" className="h-full w-auto object-contain font-bold" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
               <div className="hidden items-center gap-2 font-bold font-sans uppercase"><BookOpen size={24} className="text-indigo-600 font-bold" /><span className="text-xl font-black text-gray-900 tracking-tighter font-noto">Central Church</span></div>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-12 font-bold uppercase font-sans">
            {[
              { id: 'home', label: 'Home' }, 
              { id: 'about', label: '교회소개' }, 
              { id: 'worship', label: '예배시간' }, 
              { id: 'sermon', label: '다시듣기' }, 
              { id: 'contact', label: '찾아오는 길' }
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`text-[13px] tracking-[0.1em] transition-all relative py-1 group font-bold ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-900'}`}>{tab.label}<span className={`absolute bottom-0 left-0 w-full h-[1px] bg-indigo-600 transform origin-left transition-transform duration-300 ${activeTab === tab.id ? 'scale-x-100' : 'scale-x-0'}`}></span></button>
            ))}
          </div>
          <div className="md:hidden flex items-center font-bold font-sans"><button onClick={() => setIsMenuOpen(true)} className="p-3 -mr-3 text-gray-900 active:bg-gray-50 rounded-full transition-colors relative z-[1100]"><Menu size={28} strokeWidth={1.5} /></button></div>
        </div>
      </nav>

      {renderContent()}

      <footer className="bg-white text-gray-400 py-24 md:py-32 px-6 border-t border-gray-50 font-noto text-center font-sans font-bold">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6 mb-16 font-bold">
          <MapPin className="text-indigo-600 font-bold" size={24} strokeWidth={2} />
          <div className="flex flex-col gap-2 font-bold">
            <span className="text-gray-900 font-black text-lg font-noto">서울특별시 서초구 방배천로 40-2</span>
            <span className="text-[11px] opacity-70 font-bold font-noto">(지번)서울특별시 서초구 방배2동 453-6 2층, 3층</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-16 border-t border-gray-50 text-[10px] font-black uppercase tracking-[0.5em] text-gray-300 font-bold font-sans"><p>© 2026 CENTRAL CHURCH. ALL RIGHTS RESERVED.</p></div>
      </footer>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap');
        .font-noto { font-family: 'Noto Sans KR', sans-serif; }
        body { font-family: 'Noto Sans KR', sans-serif; background: #ffffff; -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
};

// --- Home, About, Worship, Sermon, Contact 컴포넌트 정의 (생략됨 - 기존과 동일) ---
// (위 App 컴포넌트 상단에 정의된 컴포넌트들을 모두 포함하여 코드를 완성하세요)

export default App;
