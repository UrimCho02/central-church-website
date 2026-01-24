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

// --- 공지사항 팝업 컴포넌트 (크기 축소 및 닫기 버튼 수정) ---
const NoticePopup = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-[340px] md:max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative">
        {/* 상단 헤더: 패딩을 줄이고 X 버튼 가독성 높임 */}
        <div className="bg-slate-800 py-6 px-8 text-center text-white relative">
          <h3 className="text-xl font-black tracking-tighter">센트럴처치 안내</h3>
          <div className="w-6 h-0.5 bg-indigo-500 mx-auto mt-2 rounded-full"></div>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* 본문 내용: 전체적인 마진과 폰트 크기 미세 조정 */}
        <div className="p-7 space-y-7 font-noto">
          <div className="text-center">
            <p className="text-gray-900 font-bold text-base leading-relaxed">
              주일 1,2부 예배시 <br />
              <span className="text-indigo-600">10분 전부터 찬양</span>이 시작됩니다.
            </p>
          </div>

          <div className="w-full h-px bg-gray-100"></div>

          <div className="text-center">
            <h4 className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-1">주차 안내</h4>
            <p className="text-gray-800 font-bold text-sm">교회 앞 공영주차장을 이용하시면 됩니다.</p>
          </div>

          <div className="w-full h-px bg-gray-100"></div>

          <div className="text-center">
            <h4 className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-1">설교 영상</h4>
            <p className="text-gray-800 font-bold text-sm">지난 설교는 <span className="text-red-600">교회 유튜브</span>에서들을 수 있습니다.</p>
            <p className="text-gray-400 text-xs mt-0.5">(유튜브에서 '센트럴처치' 검색)</p>
          </div>

          {/* 온라인 헌금 박스 축소 */}
          <div className="bg-gray-50 rounded-[1.5rem] p-4 text-center border border-gray-100">
            <h4 className="text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5">
              <CreditCard size={12} /> 온라인 헌금
            </h4>
            <p className="text-gray-900 font-black text-lg tracking-tight mb-0.5 font-sans">국민은행 437637-01-009066</p>
            <p className="text-gray-600 font-bold mb-2 text-xs">예금주: 중앙교회</p>
            <p className="text-[10px] text-gray-400 leading-tight font-medium">
              이름과 헌금 명목을 메모해 주세요.<br />
              (예: 홍길동십일조/감사/선교)
            </p>
          </div>
        </div>

        <button 
          onClick={onClose} 
          className="w-full py-4 bg-gray-900 text-white font-black uppercase tracking-[0.1em] text-[10px] hover:bg-black transition-colors"
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
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 md:p-10 bg-black/90 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
      <div className="relative w-full max-w-5xl aspect-video rounded-[2rem] overflow-hidden shadow-2xl bg-black border border-white/10" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 z-20 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full transition-all"
        >
          <X size={32} />
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

// --- 컴포넌트 분리 ---

const MainHeroSlider = ({ images }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative w-full aspect-square md:aspect-[4/5] rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-2xl bg-gray-100">
      {images.map((src, index) => (
        <img 
          key={index}
          src={src} 
          alt={`Slide ${index + 1}`} 
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            currentSlide === index ? 'opacity-100' : 'opacity-0'
          }`}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center -z-10 text-gray-300 font-bold uppercase tracking-widest text-[10px] font-sans p-10 text-center">
        이미지 로딩 중
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10 font-sans">
        {images.map((_, idx) => (
          <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-6 bg-indigo-600' : 'bg-gray-300/50'}`} />
        ))}
      </div>
    </div>
  );
};

const Home = ({ onWorshipClick }) => (
  <>
    <section className="relative min-h-screen flex items-center bg-white overflow-hidden pt-24 pb-20 font-noto">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
        <div className="z-10 text-left animate-fade-in-up flex flex-col items-start font-sans">
          <h1 className="text-gray-900 tracking-tighter leading-[1.0] uppercase mb-8 text-left font-sans">
            <span className="text-4xl md:text-5xl lg:text-6xl font-bold block mb-4 opacity-80">Welcome to</span>
            <span className="text-6xl md:text-8xl lg:text-9xl font-black block leading-none">Central <br className="hidden lg:block" /> Church</span>
          </h1>
          <div className="w-16 h-1.5 bg-indigo-600 mb-8"></div>
          <p className="text-base md:text-xl text-gray-400 font-medium leading-relaxed max-w-md font-noto">
            센트럴처치 홈페이지를 찾아주신 여러분을<br />진심으로 환영하고 축복합니다.
          </p>
        </div>
        <div className="animate-fade-in-up [animation-delay:300ms] w-full max-w-lg mx-auto md:max-w-none">
          <MainHeroSlider images={heroImages} />
        </div>
      </div>
    </section>
    <section className="py-20 px-6 bg-gray-50 font-noto text-center">
        <button onClick={onWorshipClick} className="group inline-flex flex-col items-center">
          <span className="text-indigo-600 font-bold tracking-[0.4em] text-[10px] uppercase mb-4 font-sans">Service Information</span>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter font-noto">예배 안내 보기</h2>
          <div className="mt-8 w-14 h-14 md:w-16 md:h-16 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-500">
             <ChevronRight size={28} />
          </div>
        </button>
    </section>
  </>
);

const About = () => (
  <main className="pt-28 md:pt-40 pb-32 px-6 bg-white animate-in fade-in duration-1000 font-noto text-left">
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-4 font-sans font-bold">
        <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter text-gray-900 uppercase">Church Info</h2>
        <div className="w-10 h-1 bg-gray-900 mx-auto rounded-full opacity-20"></div>
      </div>
      <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-24 border border-gray-100 shadow-2xl shadow-indigo-50/50 mb-20 relative overflow-hidden text-left">
        <Quote className="absolute -top-6 -left-6 text-indigo-50/50 w-32 h-32 md:w-48 md:h-48" />
        <div className="relative z-10">
          <div className="space-y-8 md:space-y-12 text-base md:text-2xl text-gray-600 leading-[1.8] md:leading-[2.1] font-medium tracking-normal">
            <div className="flex gap-4 items-start">
              <span className="text-indigo-600 shrink-0 text-xl font-black mt-[6px] md:mt-[10px]">•</span>
              <p>영적인 말씀이 강하게 선포되는 교회</p>
            </div>
            <div className="flex gap-4 items-start">
              <span className="text-indigo-600 shrink-0 text-xl font-black mt-[6px] md:mt-[10px]">•</span>
              <p>오직 기도에 힘쓰는 교회</p>
            </div>
            <div className="flex gap-4 items-start">
              <span className="text-indigo-600 shrink-0 text-xl font-black mt-[6px] md:mt-[10px]">•</span>
              <p>선교적 사명을 끝날까지 감당하는 교회</p>
            </div>
            <div className="flex gap-4 items-start">
              <span className="text-indigo-600 shrink-0 text-xl font-black mt-[6px] md:mt-[10px]">•</span>
              <p>복음으로 사랑의 명령을 실천하는 교회</p>
            </div>
          </div>
          <div className="mt-16 md:mt-24 pt-10 md:pt-12 border-t border-gray-100 font-sans text-center">
            <p className="text-xl md:text-3xl font-black text-gray-900 tracking-tighter uppercase leading-relaxed md:leading-relaxed font-noto">
              센트럴처치는 영적으로 갈급해 하는 <br />
              자들을 위해 세워진 교회입니다. <br />
              복음의 본질인 예수 그리스도를 <br />
              통하여 말씀을 바라보고, <br />
              오직 기도하며 성령의 역사를<br />
              체험하는 믿음의 사람들이 되기를 <br />
              간절히 소망합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  </main>
);

const Worship = () => (
  <section className="pt-28 md:pt-40 pb-32 px-6 bg-white min-h-screen font-noto">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16 md:mb-24 font-sans font-bold">
        <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tighter uppercase font-sans">Worship</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-8 md:gap-10 font-bold">
        <div className="bg-white p-10 md:p-16 rounded-[3rem] md:rounded-[4rem] border border-gray-100 shadow-xl shadow-indigo-50/30">
          <h3 className="text-gray-900 font-black text-xl md:text-2xl mb-10 flex items-center gap-4 uppercase tracking-tighter font-sans font-bold"><Clock className="text-indigo-600" strokeWidth={3}/> Sunday</h3>
          <div className="space-y-10">
            {worshipTimes.filter(t => t.name.includes('주일')).map((item, idx) => (
              <div key={idx} className="flex justify-between items-end group">
                <p className="text-gray-900 font-black text-lg md:text-xl group-hover:text-indigo-600 transition-colors tracking-tighter font-bold">{item.name}</p>
                <p className="text-gray-900 text-2xl md:text-3xl font-black tracking-tighter font-sans">{item.time}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-900 p-10 md:p-16 rounded-[3rem] md:rounded-[4rem] text-white shadow-2xl">
          <h3 className="text-indigo-400 font-black text-xl md:text-2xl mb-10 flex items-center gap-4 uppercase tracking-tighter font-sans font-bold"><Users strokeWidth={3}/> Weekday</h3>
          <div className="space-y-10">
            {worshipTimes.filter(t => !t.name.includes('주일')).map((item, idx) => (
              <div key={idx} className="flex justify-between items-end group">
                <p className="text-white font-black text-lg md:text-xl group-hover:text-indigo-400 transition-colors tracking-tighter font-bold">{item.name}</p>
                <p className="text-white text-2xl md:text-3xl font-black tracking-tighter font-sans">{item.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Sermon = ({ videos, isLoading, onVideoSelect }) => (
  <main className="pt-28 md:pt-40 pb-32 px-6 bg-white min-h-screen font-noto text-left font-sans">
    <div className="max-w-7xl mx-auto">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-20 gap-8">
         <div className="text-left font-sans font-bold">
            <span className="text-indigo-600 font-bold tracking-[0.4em] text-[10px] uppercase mb-4 block font-sans">Archive</span>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none uppercase font-noto">주일 말씀</h2>
         </div>
         <a 
           href="https://youtube.com/@centralchurch5467?si=zOJh5JBLDqAlI1fF" 
           target="_blank" 
           rel="noopener noreferrer"
           className="bg-red-600 text-white px-8 md:px-10 py-4 rounded-full font-black text-[11px] tracking-widest hover:bg-red-700 transition-all uppercase flex items-center gap-3 shadow-xl shadow-red-50 font-bold font-sans"
         >
            <Youtube size={20}/> YouTube Channel
         </a>
       </div>

       {isLoading ? (
         <div className="flex flex-col items-center justify-center py-40 text-gray-300 gap-4 font-sans">
           <Loader2 className="animate-spin" size={48} />
           <p className="font-bold tracking-widest text-xs uppercase text-gray-400">최신 영상을 불러오는 중...</p>
         </div>
       ) : (
         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16 font-sans">
            {videos.length > 0 ? (
              videos.map((video, i) => (
                <div 
                  key={i} 
                  onClick={() => onVideoSelect(video.id.videoId)}
                  className="group cursor-pointer block"
                >
                  <div className="relative aspect-video rounded-[2rem] md:rounded-[3.5rem] overflow-hidden mb-8 shadow-sm group-hover:shadow-2xl transition-all duration-700 border border-gray-100 bg-gray-50">
                     <img 
                       src={video.snippet.thumbnails.high.url} 
                       alt={video.snippet.title}
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                     />
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/20">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-2xl text-indigo-600 transform scale-90 group-hover:scale-100 transition-transform"><PlayCircle size={32} /></div>
                     </div>
                  </div>
                  <h4 className="text-lg md:text-xl font-black text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug font-noto">
                    {video.snippet.title}
                  </h4>
                  <p className="text-gray-400 text-[11px] font-bold font-sans tracking-widest uppercase">
                    {new Date(video.snippet.publishedAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              ))
            ) : (
              [1, 2, 3].map(i => (
                <div key={i} className="group">
                  <div className="aspect-video rounded-[2rem] md:rounded-[3.5rem] bg-gray-100 border border-gray-200 mb-8 flex flex-col items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-[10px] shadow-sm">
                    <Video size={32
