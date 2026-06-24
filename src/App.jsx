import React, { useState, useEffect, useRef } from 'react';
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
  Bell,
  MessageCircle,
  Send
} from 'lucide-react';

// 챗봇 백엔드는 같은 Vercel 프로젝트의 서버리스 함수(/api/ask)로 통합됨.
// 동일 출처라 CORS 불필요. (구: 별도 Render 백엔드 — 콜드 스타트 때문에 제거)
const CHATBOT_API_URL = "";

// --- 전역 설정 (유튜브 API용) ---
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
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

// --- 공지사항 팝업 컴포넌트 (표준 크기 최적화) ---
const NoticePopup = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-[300px] md:max-w-[360px] rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative border border-white/20 font-noto">
        <div className="bg-slate-800 py-5 px-6 text-center text-white relative">
          <h3 className="text-lg font-black tracking-tighter">센트럴처치 안내</h3>
          <div className="w-8 h-1 bg-indigo-500 mx-auto mt-2 rounded-full opacity-50"></div>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 p-1.5 rounded-full transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5 text-center font-noto">
          <div>
            <p className="text-gray-900 font-bold text-[14px] leading-relaxed break-keep">
              주일 1,2부 예배시 <br />
              <span className="text-indigo-600 font-black">10분 전부터 찬양</span>이 시작됩니다.
            </p>
          </div>
          <div className="w-full h-px bg-gray-100"></div>
          <div>
            <h4 className="text-gray-400 font-black text-[9px] uppercase tracking-widest mb-0.5 font-sans">PARKING</h4>
            <p className="text-gray-800 font-bold text-xs">교회 앞 공영주차장을 이용해 주세요.</p>
          </div>
          <div className="w-full h-px bg-gray-100"></div>
          <div>
            <h4 className="text-gray-400 font-black text-[9px] uppercase tracking-widest mb-0.5 font-sans">YOUTUBE</h4>
            <p className="text-gray-800 font-bold text-xs">지난 설교는 <span className="text-red-600 font-black">교회 유튜브</span>에서</p>
            <p className="text-gray-400 text-[9px]">(센트럴처치 검색)</p>
          </div>
          <div className="bg-indigo-50/50 rounded-2xl p-4 text-center border border-indigo-100">
            <h4 className="text-indigo-600 font-black text-[9px] uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1.5 font-sans">
              <CreditCard size={12} /> OFFERING
            </h4>
            <p className="text-gray-900 font-black text-lg tracking-tight mb-0.5 font-sans">국민은행 437637-01-009066</p>
            <p className="text-gray-600 font-bold text-[11px] mb-1">예금주: 중앙교회</p>
            <p className="text-[10px] text-gray-400 leading-tight break-keep">
              성함과 헌금 명목을 꼭 적어주세요.
            </p>
          </div>
        </div>
        <button onClick={onClose} className="w-full py-4 bg-slate-800 text-white font-black uppercase tracking-[0.2em] text-[10px] hover:bg-black transition-colors font-noto text-bold">
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
      <div className="relative w-full max-w-5xl aspect-video rounded-[2rem] overflow-hidden shadow-2xl bg-black border border-white/10" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 md:top-6 md:right-6 z-20 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 p-1.5 rounded-full transition-all"><X size={24} /></button>
        <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
      </div>
    </div>
  );
};

// --- 레이아웃 섹션들 ---

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
        <img key={index} src={src} alt={`Slide ${index + 1}`} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${currentSlide === index ? 'opacity-100' : 'opacity-0'}`} onError={(e) => { e.target.style.display = 'none'; }} />
      ))}
      <div className="absolute inset-0 flex items-center justify-center -z-10 text-gray-300 font-bold uppercase tracking-widest text-[10px] p-10 text-center">IMAGE LOADING</div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, idx) => (
          <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-6 bg-indigo-600' : 'bg-gray-300/50'}`} />
        ))}
      </div>
    </div>
  );
};

const Home = () => (
  <main className="relative min-h-screen flex items-center bg-white overflow-hidden pt-[120px] md:pt-[160px] pb-16 font-noto text-left">
    <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
      <div className="z-10 text-left animate-fade-in-up flex flex-col items-start font-sans">
        <h1 className="text-gray-900 tracking-tighter leading-[1.1] uppercase mb-8 text-left font-noto">
          <span className="text-3xl md:text-5xl lg:text-6xl font-bold block mb-3 opacity-80">Welcome to</span>
          <span className="text-5xl md:text-7xl lg:text-8xl font-black block leading-none">Central <br className="hidden lg:block" /> Church</span>
        </h1>
        <div className="w-16 h-1.5 bg-indigo-600 mb-8"></div>
        <p className="text-base md:text-xl text-gray-400 font-medium leading-relaxed max-w-md break-keep">
          센트럴처치 홈페이지를 찾아주신 여러분을 진심으로 환영하고 축복합니다.
        </p>
      </div>
      <div className="animate-fade-in-up [animation-delay:300ms] w-full max-w-lg mx-auto md:max-w-none">
        <MainHeroSlider images={heroImages} />
      </div>
    </div>
  </main>
);

const About = () => (
  <main className="pt-[120px] md:pt-[160px] pb-32 px-6 bg-white animate-in fade-in duration-1000 font-noto">
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter text-gray-900 uppercase font-sans">Church Info</h2>
        <div className="w-10 h-1 bg-gray-900 mx-auto rounded-full opacity-20"></div>
      </div>
      <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-24 border border-gray-100 shadow-2xl shadow-indigo-50/50 mb-20 relative overflow-hidden font-noto text-left">
        <Quote className="absolute -top-6 -left-6 text-indigo-50/50 w-32 h-32 md:w-48 md:h-48" />
        <div className="relative z-10 text-left">
          <div className="space-y-8 md:space-y-12 text-base md:text-2xl text-gray-600 leading-[1.8] md:leading-[2.1] font-medium tracking-normal break-keep">
            {["영적인 말씀이 강하게 선포되는 교회", "오직 기도에 힘쓰는 교회", "선교적 사명을 끝날까지 감당하는 교회", "복음으로 사랑의 명령을 실천하는 교회"].map((val, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <span className="text-indigo-600 shrink-0 text-xl font-black mt-[6px] md:mt-[10px]">•</span>
                <p className="flex-1">{val}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 md:mt-24 pt-10 md:pt-12 border-t border-gray-100 text-center font-noto">
            <p className="text-xl md:text-3xl font-black text-gray-900 tracking-tighter uppercase leading-relaxed md:leading-relaxed break-keep">
              센트럴처치는 영적으로 갈급해 하는 자들을 위해 세워진 교회입니다. <br className="hidden md:block" />
              복음의 본질인 예수 그리스도를 통하여 말씀을 바라보고, <br className="hidden md:block" />
              오직 기도하며 성령의 역사를 체험하는 믿음의 사람들이 되기를 간절히 소망합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  </main>
);

const Worship = () => (
  <section className="pt-[120px] md:pt-[160px] pb-32 px-6 bg-white min-h-screen font-noto">
    <div className="max-w-6xl mx-auto font-noto">
      <div className="text-center mb-16 md:mb-24">
        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tighter uppercase font-sans">Worship</h2>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 md:gap-10 font-bold">
        {/* Sunday Section */}
        <div className="bg-white p-6 md:p-16 rounded-[3rem] md:rounded-[4rem] border border-gray-100 shadow-xl shadow-indigo-50/30 text-left">
          <h3 className="text-gray-900 font-black text-xl md:text-2xl mb-12 flex items-center gap-4 uppercase tracking-tighter font-sans"><Clock className="text-indigo-600" strokeWidth={3}/> Sunday</h3>
          <div className="space-y-12">
            {worshipTimes.filter(t => t.name.includes('주일')).map((item, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_auto] gap-4 items-baseline border-b border-gray-50 pb-5">
                <p className="text-gray-900 font-black text-lg md:text-xl tracking-tighter whitespace-nowrap">{item.name}</p>
                <p className="text-gray-900 text-xl md:text-3xl font-black tracking-tighter font-sans text-right min-w-[120px] md:min-w-[180px]">{item.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Weekday Section */}
        <div className="bg-gray-900 p-6 md:p-16 rounded-[3rem] md:rounded-[4rem] text-white shadow-2xl text-left">
          <h3 className="text-indigo-400 font-black text-xl md:text-2xl mb-12 flex items-center gap-4 uppercase tracking-tighter font-sans"><Users strokeWidth={3}/> Weekday</h3>
          <div className="space-y-12">
            {worshipTimes.filter(t => !t.name.includes('주일')).map((item, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_auto] gap-4 items-baseline border-b border-white/5 pb-5">
                <p className="text-white font-black text-lg md:text-xl tracking-tighter whitespace-nowrap font-noto">{item.name}</p>
                <p className="text-white text-xl md:text-3xl font-black tracking-tighter font-sans text-right min-w-[120px] md:min-w-[180px]">{item.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Sermon = ({ videos, isLoading, onVideoSelect }) => (
  <main className="pt-[120px] md:pt-[160px] pb-32 px-6 bg-white min-h-screen font-noto">
    <div className="max-w-7xl mx-auto">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-20 gap-8">
         <div className="text-left font-sans font-bold">
            <span className="text-indigo-600 font-bold tracking-[0.4em] text-[10px] uppercase mb-4 block font-black">ARCHIVE</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter leading-none uppercase text-left">주일 말씀</h2>
         </div>
         <a href="https://youtube.com/@centralchurch5467" target="_blank" rel="noopener noreferrer" className="bg-red-600 text-white px-8 md:px-12 py-4 rounded-full font-black text-[11px] tracking-widest hover:bg-red-700 transition-all uppercase flex items-center gap-3 shadow-xl shadow-red-50 font-sans">
            <Youtube size={18}/> YouTube Channel
         </a>
       </div>

       {isLoading ? (
         <div className="flex flex-col items-center justify-center py-40 text-gray-300 gap-4 font-sans">
           <Loader2 className="animate-spin" size={48} />
           <p className="font-bold tracking-widest text-xs uppercase text-gray-400">최신 영상을 불러오는 중...</p>
         </div>
       ) : (
         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16 font-noto">
            {videos.length > 0 ? (
              videos.map((video, i) => (
                <div key={i} onClick={() => onVideoSelect(video.id.videoId)} className="group cursor-pointer block text-left">
                  <div className="relative aspect-video rounded-[2rem] md:rounded-[3.5rem] overflow-hidden mb-8 shadow-sm group-hover:shadow-2xl transition-all duration-700 border border-gray-100 bg-gray-50">
                     <img src={video.snippet.thumbnails.high.url} alt={video.snippet.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/20">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-2xl text-indigo-600 transform scale-90 group-hover:scale-100 transition-transform"><PlayCircle size={32} /></div>
                     </div>
                  </div>
                  <h4 className="text-lg md:text-xl font-black text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug break-keep text-left">
                    {video.snippet.title}
                  </h4>
                  <p className="text-gray-400 text-[11px] font-bold font-sans tracking-widest uppercase text-left">
                    {new Date(video.snippet.publishedAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              ))
            ) : (
              [1, 2, 3].map(i => (
                <div key={i} className="group opacity-50 text-left">
                  <div className="aspect-video rounded-[2rem] md:rounded-[3.5rem] bg-gray-100 border border-gray-200 mb-8 flex flex-col items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-[10px] shadow-sm"><Video size={32} className="mb-3 opacity-20" /><span>영상 대기 중</span></div>
                  <div className="h-6 w-3/4 bg-gray-100 mb-4 rounded-full"></div>
                  <div className="h-4 w-1/4 bg-gray-100 rounded-full"></div>
                </div>
              ))
            )}
         </div>
       )}
    </div>
  </main>
);

const Contact = () => {
  const mapLink = "https://map.kakao.com/link/search/서울특별시 서초구 방배천로 40-2";
  return (
    <section className="pt-[120px] md:pt-[160px] pb-32 px-6 bg-white min-h-screen text-left font-noto">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 md:gap-16 items-start font-bold">
          <div className="lg:col-span-5 space-y-10 md:space-y-12 text-left">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter leading-none uppercase font-sans font-black text-left">Location</h2>
              <div className="w-12 h-1.5 bg-indigo-600 mt-6 mb-10"></div>
            </div>
            <div className="space-y-10 md:space-y-12 break-keep text-left">
              <div className="flex gap-5 md:gap-6 items-start group">
                <div className="bg-indigo-600 p-4 rounded-2xl md:rounded-3xl text-white shadow-lg shadow-indigo-100 group-hover:scale-110 transition-all duration-300"><Train size={24} strokeWidth={2.5} /></div>
                <div><h4 className="font-black text-xl mb-3 text-gray-900 tracking-tight text-left">지하철</h4><p className="text-sm md:text-base text-gray-500 leading-relaxed font-noto text-left text-left"><span className="text-indigo-600 font-black text-lg">사당역</span> (2, 4호선) 11~14번 출구 <span className="text-gray-400 font-bold ml-1">(도보 5분)</span><br /><span className="text-indigo-600 font-black text-lg">이수역</span> (4, 7호선) 4, 5번 출구 <span className="text-gray-400 font-bold ml-1">(도보 10분)</span></p></div>
              </div>
              <div className="flex gap-5 md:gap-6 items-start group">
                <div className="bg-indigo-600 p-4 rounded-2xl md:rounded-3xl text-white shadow-lg shadow-indigo-100 group-hover:scale-110 transition-all duration-300"><Bus size={24} strokeWidth={2.5} /></div>
                <div><h4 className="font-black text-xl mb-3 text-gray-900 tracking-tight text-left">버스</h4><p className="text-sm md:text-base text-gray-500 leading-relaxed font-noto text-left text-left text-left"><span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg font-black mr-2 font-black">350, 4212, 4318, 동작09 등</span><br />방배노인종합복지관(중) 하차 <span className="text-gray-400 font-bold ml-1">(도보 3분)</span></p></div>
              </div>
              <div className="flex gap-5 md:gap-6 items-start group text-left">
                <div className="bg-indigo-600 p-4 rounded-2xl md:rounded-3xl text-white shadow-lg shadow-indigo-100 group-hover:scale-110 transition-all duration-300"><Car size={24} strokeWidth={2.5} /></div>
                <div><h4 className="font-black text-xl mb-3 text-gray-900 tracking-tight font-black text-left">자가운전</h4><p className="text-sm md:text-base text-gray-500 leading-relaxed font-noto text-left text-left text-left text-left"><span className="text-indigo-600 font-black text-left">'서초구 방배천로 40-2'</span><br /><span className="text-xs text-gray-400 font-black font-black text-left text-left text-left">교회 앞 공영주차장을 이용해 주시기 바랍니다.</span></p></div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7 h-[500px] md:h-full min-h-[500px]">
            <div className="bg-white rounded-[3rem] md:rounded-[5rem] overflow-hidden shadow-2xl border-[8px] md:border-[16px] border-white h-full relative shadow-indigo-100/50">
              <iframe src="https://maps.google.com/maps?q=서울특별시%20서초구%20방배천로%2040-2&t=&z=17&ie=UTF8&iwloc=&output=embed" width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" title="Church Map" className="opacity-90 contrast-110"></iframe>
              <div className="absolute bottom-6 left-6 right-6 md:bottom-12 md:left-12 md:right-12 z-20 bg-white/90 backdrop-blur-xl p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] shadow-2xl flex items-center justify-between border border-white/20">
                <div className="text-left font-black"><p className="font-black text-gray-900 text-lg md:text-2xl tracking-tighter uppercase font-noto">센트럴처치</p><div className="text-[10px] md:text-[11px] text-gray-400 mt-1 flex flex-col gap-0.5 font-noto font-black text-left text-left text-left text-left"><span>서울특별시 서초구 방배천로 40-2</span><span className="opacity-70">서초구 방배2동 453-6 2층, 3층</span></div></div>
                <a href={mapLink} target="_blank" rel="noopener noreferrer" className="bg-indigo-600 text-white p-3 md:p-5 rounded-2xl md:rounded-3xl shadow-lg hover:bg-indigo-700 transition-colors font-sans"><ExternalLink size={20}/></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- 챗봇 상담 위젯 ---
const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: '안녕하세요. 설교 말씀을 바탕으로 신앙 상담을 도와드립니다. 마음에 있는 질문이나 고민을 편하게 적어주세요.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [coldStartHint, setColdStartHint] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // 모바일 키보드 대응: 입력창 포커스 시 키보드가 화면을 가려도
  // 패널이 시각 뷰포트(visualViewport)에 맞춰 줄어들도록 높이/위치를 보정.
  // (fixed inset-0 은 레이아웃 뷰포트 기준이라 키보드만큼 안 줄어 입력창이 화면 밖으로 밀림)
  useEffect(() => {
    if (!isOpen) return;
    const vv = window.visualViewport;
    const el = panelRef.current;
    if (!vv || !el) return;
    const apply = () => {
      if (window.matchMedia('(max-width: 767px)').matches) {
        el.style.height = `${vv.height}px`;
        el.style.top = `${vv.offsetTop}px`;
      } else {
        el.style.height = '';
        el.style.top = '';
      }
    };
    apply();
    vv.addEventListener('resize', apply);
    vv.addEventListener('scroll', apply);
    return () => {
      vv.removeEventListener('resize', apply);
      vv.removeEventListener('scroll', apply);
      el.style.height = '';
      el.style.top = '';
    };
  }, [isOpen]);

  const sendMessage = async () => {
    const q = input.trim();
    if (!q || isLoading) return;

    setMessages((m) => [...m, { role: 'user', text: q }]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsLoading(true);
    setColdStartHint(false);

    const coldTimer = setTimeout(() => setColdStartHint(true), 8000);
    const controller = new AbortController();
    const abortTimer = setTimeout(() => controller.abort(), 90000);

    // 멀티턴 컨텍스트: 환영 인사·에러 메시지를 제외한 직전 대화를
    // {role, content} 형태로 백엔드에 전달. 윈도우 트리밍은 백엔드가 책임.
    const history = messages
      .filter((m) => !m.isError && !(m.role === 'assistant' && m.text.startsWith('안녕하세요')))
      .map((m) => ({ role: m.role, content: m.text }));

    try {
      const res = await fetch(`${CHATBOT_API_URL}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, history }),
        signal: controller.signal
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMessages((m) => [...m, { role: 'assistant', text: data.answer }]);
    } catch (err) {
      const isTimeout = err.name === 'AbortError';
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text: isTimeout
            ? '서버 응답이 너무 오래 걸렸습니다. 잠시 후 다시 시도해 주세요.'
            : '죄송합니다. 답변을 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.',
          isError: true
        }
      ]);
    } finally {
      clearTimeout(coldTimer);
      clearTimeout(abortTimer);
      setIsLoading(false);
      setColdStartHint(false);
    }
  };

  const handleKeyDown = (e) => {
    // 데스크탑(마우스): Enter=전송, Shift+Enter=줄바꿈
    // 모바일(터치): Enter=줄바꿈, 전송은 버튼으로만 → 조기 전송 방지
    const isTouch =
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse)').matches;
    if (e.key === 'Enter' && !e.shiftKey && !isTouch) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[9998] w-16 h-16 md:w-[72px] md:h-[72px] bg-red-500 hover:bg-red-600 text-white rounded-full shadow-2xl shadow-red-200/50 flex items-center justify-center transition-all duration-300 font-noto ${
          isOpen ? 'opacity-0 pointer-events-none scale-50' : 'opacity-100 scale-100'
        }`}
        aria-label="상담 챗봇 열기"
      >
        <MessageCircle size={28} strokeWidth={2} />
      </button>

      {isOpen && (
        <div ref={panelRef} className="fixed inset-x-0 top-0 h-[100dvh] md:inset-auto md:top-auto md:bottom-6 md:right-6 z-[9999] md:w-[400px] md:h-[640px] md:max-h-[85vh] bg-white md:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom duration-300 font-noto">
          <div className="bg-slate-800 text-white px-6 py-5 flex items-center justify-between shrink-0">
            <div className="text-left">
              <h3 className="font-black text-base tracking-tight">센트럴처치 상담</h3>
              <p className="text-[9px] uppercase tracking-[0.25em] text-red-300 font-bold mt-1 font-sans">
                Sermon-Based AI
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white p-1.5 bg-white/10 rounded-full transition-all"
              aria-label="닫기"
            >
              <X size={18} />
            </button>
          </div>

          <div className="bg-red-50/60 px-5 py-3 text-[11px] text-red-900/80 leading-relaxed break-keep border-b border-red-100 shrink-0 font-medium">
            AI가 설교 말씀을 근거로 답변합니다. 더 깊은 상담은 담임 목사님과 직접 나누어 주세요.
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-white">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed break-keep whitespace-pre-wrap font-medium ${
                    m.role === 'user'
                      ? 'bg-red-500 text-white rounded-br-md'
                      : m.isError
                      ? 'bg-red-50 text-red-900 rounded-bl-md border border-red-100'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-red-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 bg-red-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 bg-red-300 rounded-full animate-bounce" />
                  {coldStartHint && (
                    <span className="text-[10px] text-gray-500 ml-2 font-medium">답변을 정리하고 있어요...</span>
                  )}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-100 p-3 bg-white shrink-0">
            <div className="flex gap-3 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="고민이나 질문을 입력하세요..."
                rows={1}
                disabled={isLoading}
                className="flex-1 resize-none px-4 py-3 bg-gray-50 rounded-2xl leading-relaxed focus:outline-none focus:bg-white focus:ring-2 focus:ring-red-500 disabled:opacity-50 font-medium break-keep"
                style={{ maxHeight: '128px', fontSize: '16px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-full transition-colors shrink-0"
                aria-label="전송"
              >
                <Send size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// --- 메인 앱 컴포넌트 ---

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
          // 브라우저 캐시 무시를 위해 items가 있으면 명시적으로 6개만 자름
          if (data.items) {
            setVideos(data.items.slice(0, 6));
          }
        } catch (err) { console.error("유튜브 로딩 에러:", err); }
        finally { setIsLoading(false); }
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
      case 'home': return <Home />;
      case 'about': return <About />;
      case 'worship': return <Worship />;
      case 'sermon': return <Sermon videos={videos} isLoading={isLoading} onVideoSelect={setSelectedVideoId} />;
      case 'contact': return <Contact />;
      default: return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-indigo-100 selection:text-indigo-900 tracking-tight overflow-x-hidden font-black font-noto">
      
      {isPopupOpen && <NoticePopup onClose={() => setIsPopupOpen(false)} />}
      {selectedVideoId && <VideoModal videoId={selectedVideoId} onClose={() => setSelectedVideoId(null)} />}

      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-[9999] flex flex-col animate-in fade-in slide-in-from-right duration-300 font-black font-noto">
          <div className="flex justify-between items-center p-8 border-b border-gray-50 font-noto">
            <img src={images.logo} alt="Logo" className="h-12 object-contain" onError={(e) => e.target.style.display='none'} />
            <button onClick={() => setIsMenuOpen(false)} className="text-gray-900 p-2 font-noto"><X size={32} strokeWidth={1.5} /></button>
          </div>
          <div className="flex flex-col p-10 space-y-8 overflow-y-auto font-noto">
            {[{ id: 'home', label: '홈' }, { id: 'about', label: '교회소개' }, { id: 'worship', label: '예배시간' }, { id: 'sermon', label: '다시듣기' }, { id: 'contact', label: '찾아오는 길' }].map((tab) => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setIsMenuOpen(false); }} className={`text-5xl font-black text-left tracking-tighter ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-300'} active:text-indigo-400 transition-colors uppercase font-noto`}>{tab.label}</button>
            ))}
          </div>
          <div className="mt-auto p-10 border-t border-gray-50 bg-gray-50/50 uppercase font-sans"><p className="text-[10px] font-black text-gray-300 tracking-[0.4em]">© 2026 Central Church</p></div>
        </div>
      )}

      <nav className={`fixed w-full z-[1000] transition-all duration-500 font-black font-noto ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-2' : 'bg-white py-4 md:py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center font-noto">
          <div className="flex items-center cursor-pointer group font-black font-noto" onClick={() => setActiveTab('home')}>
            <div className="relative h-12 md:h-16 flex items-center font-noto">
               <img src={images.logo} alt="Central Church" className="h-full w-auto object-contain font-black" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
               <div className="hidden items-center gap-2 uppercase font-black font-noto"><BookOpen size={24} className="text-indigo-600 font-black" /><span className="text-xl font-black text-gray-900 tracking-tighter font-noto">Central Church</span></div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-12 font-black uppercase text-sm lg:text-base font-sans">
            {[{ id: 'home', label: 'Home' }, { id: 'about', label: '교회소개' }, { id: 'worship', label: '예배시간' }, { id: 'sermon', label: '다시듣기' }, { id: 'contact', label: '찾아오는 길' }].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tracking-[0.1em] transition-all relative py-1 group font-black ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-900'}`}>{tab.label}<span className={`absolute bottom-0 left-0 w-full h-[1px] bg-indigo-600 transform origin-left transition-transform duration-300 ${activeTab === tab.id ? 'scale-x-100' : 'scale-x-0'}`}></span></button>
            ))}
          </div>

          <div className="md:hidden flex items-center font-black font-noto"><button onClick={() => setIsMenuOpen(true)} className="p-3 -mr-3 text-gray-900 active:bg-gray-50 rounded-full transition-colors relative z-[1100] font-noto"><Menu size={28} strokeWidth={1.5} /></button></div>
        </div>
      </nav>

      <div className="layout-content-wrapper font-noto">
        {renderContent()}
      </div>

      <ChatWidget />

      <footer className="bg-white text-gray-400 py-24 md:py-32 px-6 border-t border-gray-50 text-center font-black font-noto">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6 mb-16 font-black font-noto">
          <MapPin className="text-indigo-600 font-black" size={24} strokeWidth={2} />
          <div className="flex flex-col gap-2 font-black font-noto">
            <span className="text-gray-900 font-black text-lg font-noto">서울특별시 서초구 방배천로 40-2</span>
            <span className="text-[11px] opacity-70 font-black font-noto">(지번)서울특별시 서초구 방배2동 453-6 2층, 3층</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-16 border-t border-gray-50 text-[10px] font-black uppercase tracking-[0.5em] text-gray-300 font-sans"><p>© 2026 CENTRAL CHURCH. ALL RIGHTS RESERVED.</p></div>
      </footer>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap');
        
        * {
          font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
          word-break: keep-all !important; 
          overflow-wrap: break-word !important;
          box-sizing: border-box;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          -ms-text-size-adjust: 100%;
          -webkit-text-size-adjust: 100%;
        }

        body { 
          background: #ffffff; 
          margin: 0;
          padding: 0;
          text-rendering: optimizeLegibility;
          overflow-x: hidden;
          width: 100% !important;
        }

        .layout-content-wrapper {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 auto;
        }

        @media (min-width: 768px) {
          .md\\:flex { display: flex !important; }
          .md\\:hidden { display: none !important; }
        }

        @media (max-width: 767px) {
          br {
            display: inline-block;
            content: " ";
            padding: 0 2px;
          }
          .md\\:block { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default App;
