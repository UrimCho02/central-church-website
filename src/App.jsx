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

// --- 공지사항 팝업 컴포넌트 ---
const NoticePopup = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-[90%] max-w-[320px] md:max-w-[420px] rounded-[2.5rem] overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 relative border border-white/20 font-noto">
        <div className="bg-slate-800 py-6 md:py-8 px-6 text-center text-white relative">
          <h3 className="text-xl md:text-2xl font-black tracking-tighter">센트럴처치 안내</h3>
          <div className="w-10 h-1 bg-indigo-500 mx-auto mt-3 rounded-full opacity-50"></div>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 md:top-6 md:right-6 text-white/70 hover:text-white bg-white/10 p-2 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 md:p-10 space-y-6 md:space-y-8 text-center font-noto">
          <div>
            <p className="text-gray-900 font-bold text-base md:text-xl leading-relaxed break-keep">
              주일 1,2부 예배시 <br />
              <span className="text-indigo-600 font-black">10분 전부터 찬양</span>이 시작됩니다.
            </p>
          </div>
          <div className="w-full h-px bg-gray-100"></div>
          <div>
            <h4 className="text-gray-400 font-black text-[10px] md:text-xs uppercase tracking-widest mb-1 font-sans">PARKING</h4>
            <p className="text-gray-800 font-bold text-sm md:text-base">교회 앞 공영주차장을 이용해 주세요.</p>
          </div>
          <div className="w-full h-px bg-gray-100"></div>
          <div>
            <h4 className="text-gray-400 font-black text-[10px] md:text-xs uppercase tracking-widest mb-1 font-sans">YOUTUBE</h4>
            <p className="text-gray-800 font-bold text-sm md:text-base">지난 설교는 <span className="text-red-600 font-black">교회 유튜브</span>에서</p>
            <p className="text-gray-400 text-xs md:text-sm mt-1">(센트럴처치 검색)</p>
          </div>
          <div className="bg-indigo-50/50 rounded-[2rem] p-5 md:p-8 text-center border border-indigo-100">
            <h4 className="text-indigo-600 font-black text-[10px] md:text-xs uppercase tracking-widest mb-2 flex items-center justify-center gap-2 font-sans">
              <CreditCard size={14} /> OFFERING
            </h4>
            <p className="text-gray-900 font-black text-lg md:text-2xl tracking-tight mb-1">국민은행 437637-01-009066</p>
            <p className="text-gray-600 font-bold text-xs md:text-base mb-2">예금주: 중앙교회</p>
            <p className="text-[11px] md:text-xs text-gray-400 leading-relaxed font-medium break-keep">
              성함과 헌금 명목을 꼭 적어주세요.
            </p>
          </div>
        </div>
        <button onClick={onClose} className="w-full py-5 bg-slate-800 text-white font-black uppercase tracking-[0.2em] text-xs md:text-sm hover:bg-black transition-colors">
          확인했습니다
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
      <div className="relative w-full max-w-6xl aspect-video rounded-[2rem] overflow-hidden shadow-2xl bg-black border border-white/10" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 md:top-8 md:right-8 z-20 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full transition-all"><X size={32} /></button>
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
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10 font-sans">
        {images.map((_, idx) => (
          <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-6 bg-indigo-600' : 'bg-gray-300/50'}`} />
        ))}
      </div>
    </div>
  );
};

const Home = () => (
  <main className="relative min-h-screen flex items-center bg-white overflow-hidden pt-[180px] md:pt-[260px] pb-24 font-noto">
    <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full grid md:grid-cols-2 gap-12 lg:gap-24 items-center text-left">
      <div className="z-10 text-left animate-fade-in-up flex flex-col items-start font-sans">
        <h1 className="text-gray-900 tracking-tighter leading-[1.1] uppercase mb-10 text-left font-noto">
          <span className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold block mb-4 opacity-80">Welcome to</span>
          <span className="text-6xl md:text-8xl lg:text-9xl xl:text-[10rem] font-black block leading-none">Central <br className="hidden lg:block" /> Church</span>
        </h1>
        <div className="w-20 h-2 bg-indigo-600 mb-10"></div>
        <p className="text-lg md:text-2xl text-gray-400 font-medium leading-relaxed max-w-md break-keep">
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
  <main className="pt-[180px] md:pt-[260px] pb-32 px-6 bg-white animate-in fade-in duration-1000 font-noto">
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-gray-900 uppercase font-sans">Church Info</h2>
        <div className="w-12 h-1.5 bg-gray-900 mx-auto rounded-full opacity-20"></div>
      </div>
      <div className="bg-white rounded-[3rem] md:rounded-[5rem] p-10 md:p-28 border border-gray-100 shadow-2xl shadow-indigo-50/50 mb-20 relative overflow-hidden font-noto text-left">
        <Quote className="absolute -top-10 -left-10 text-indigo-50/50 w-48 h-48 md:w-64 md:h-64" />
        <div className="relative z-10 text-left">
          <div className="space-y-10 md:space-y-14 text-lg md:text-3xl text-gray-600 leading-[1.8] font-medium tracking-normal break-keep">
            {["영적인 말씀이 강하게 선포되는 교회", "오직 기도에 힘쓰는 교회", "선교적 사명을 끝날까지 감당하는 교회", "복음으로 사랑의 명령을 실천하는 교회"].map((val, idx) => (
              <div key={idx} className="flex gap-6 items-start">
                <span className="text-indigo-600 shrink-0 text-2xl md:text-4xl font-black mt-[4px]">•</span>
                <p className="flex-1">{val}</p>
              </div>
            ))}
          </div>
          <div className="mt-20 md:mt-32 pt-14 md:pt-20 border-t border-gray-100 text-center font-noto">
            <p className="text-xl md:text-4xl font-black text-gray-900 tracking-tighter uppercase leading-relaxed md:leading-relaxed break-keep">
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
  <section className="pt-[180px] md:pt-[260px] pb-32 px-6 bg-white min-h-screen font-noto">
    <div className="max-w-7xl mx-auto font-noto">
      <div className="text-center mb-20 md:mb-28">
        <h2 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tighter uppercase font-sans">Worship</h2>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-10 md:gap-16 font-bold">
        {/* Sunday Section */}
        <div className="bg-white p-8 md:p-20 rounded-[3rem] md:rounded-[5rem] border border-gray-100 shadow-xl shadow-indigo-50/30 text-left">
          <h3 className="text-gray-900 font-black text-2xl md:text-4xl mb-16 flex items-center gap-6 uppercase tracking-tighter font-sans"><Clock className="text-indigo-600 w-10 h-10 md:w-12 md:h-12" strokeWidth={3}/> Sunday</h3>
          <div className="space-y-14">
            {worshipTimes.filter(t => t.name.includes('주일')).map((item, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_auto] gap-8 items-baseline border-b border-gray-50 pb-8">
                <p className="text-gray-900 font-black text-xl md:text-3xl tracking-tighter whitespace-nowrap">{item.name}</p>
                <p className="text-gray-900 text-2xl md:text-5xl font-black tracking-tighter font-sans text-right min-w-[140px] md:min-w-[240px]">{item.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Weekday Section */}
        <div className="bg-gray-900 p-8 md:p-20 rounded-[3rem] md:rounded-[5rem] text-white shadow-2xl text-left">
          <h3 className="text-indigo-400 font-black text-2xl md:text-4xl mb-16 flex items-center gap-6 uppercase tracking-tighter font-sans"><Users className="w-10 h-10 md:w-12 md:h-12" strokeWidth={3}/> Weekday</h3>
          <div className="space-y-14 font-noto">
            {worshipTimes.filter(t => !t.name.includes('주일')).map((item, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_auto] gap-8 items-baseline border-b border-white/5 pb-8 font-noto">
                <p className="text-white font-black text-xl md:text-3xl tracking-tighter whitespace-nowrap font-noto">{item.name}</p>
                <p className="text-white text-2xl md:text-5xl font-black tracking-tighter font-sans text-right min-w-[140px] md:min-w-[240px]">{item.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Sermon = ({ videos, isLoading, onVideoSelect }) => (
  <main className="pt-[180px] md:pt-[260px] pb-32 px-6 bg-white min-h-screen font-noto">
    <div className="max-w-7xl mx-auto">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 md:mb-24 gap-10">
         <div className="text-left font-sans font-bold">
            <span className="text-indigo-600 font-bold tracking-[0.4em] text-[12px] md:text-sm uppercase mb-4 block font-black font-sans">ARCHIVE</span>
            <h2 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-none uppercase">주일 말씀</h2>
         </div>
         <a href="https://youtube.com/@centralchurch5467" target="_blank" rel="noopener noreferrer" className="bg-red-600 text-white px-10 md:px-14 py-5 rounded-full font-black text-xs md:text-sm tracking-widest hover:bg-red-700 transition-all uppercase flex items-center gap-4 shadow-xl shadow-red-50 font-sans">
            <Youtube size={24}/> YouTube Channel
         </a>
       </div>

       {isLoading ? (
         <div className="flex flex-col items-center justify-center py-40 text-gray-300 gap-6 font-sans">
           <Loader2 className="animate-spin" size={64} />
           <p className="font-bold tracking-widest text-sm uppercase text-gray-400">최신 영상을 불러오는 중...</p>
         </div>
       ) : (
         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-20 font-noto">
            {videos.length > 0 ? (
              videos.map((video, i) => (
                <div key={i} onClick={() => onVideoSelect(video.id.videoId)} className="group cursor-pointer block text-left font-noto">
                  <div className="relative aspect-video rounded-[2.5rem] md:rounded-[4rem] overflow-hidden mb-10 shadow-sm group-hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)] transition-all duration-700 border border-gray-100 bg-gray-50">
                     <img src={video.snippet.thumbnails.high.url} alt={video.snippet.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/30">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center shadow-2xl text-indigo-600 transform scale-90 group-hover:scale-100 transition-transform"><PlayCircle size={40} /></div>
                     </div>
                  </div>
                  <h4 className="text-xl md:text-3xl font-black text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug break-keep">
                    {video.snippet.title}
                  </h4>
                  <p className="text-gray-400 text-xs md:text-sm font-bold font-sans tracking-widest uppercase">
                    {new Date(video.snippet.publishedAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              ))
            ) : (
              [1, 2, 3].map(i => (
                <div key={i} className="group opacity-50 text-left font-noto">
                  <div className="aspect-video rounded-[2.5rem] md:rounded-[4rem] bg-gray-100 border border-gray-200 mb-10 flex flex-col items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-[12px] shadow-sm font-noto"><Video size={40} className="mb-4 opacity-20" /><span>영상 대기 중</span></div>
                  <div className="h-8 w-3/4 bg-gray-100 mb-5 rounded-full"></div>
                  <div className="h-5 w-1/4 bg-gray-100 rounded-full"></div>
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
    <section className="pt-[180px] md:pt-[260px] pb-32 px-6 bg-white min-h-screen text-left font-noto">
      <div className="max-w-7xl mx-auto font-noto">
        <div className="grid lg:grid-cols-12 gap-16 md:gap-24 items-start font-bold">
          <div className="lg:col-span-5 space-y-14 md:space-y-20 text-left">
            <div>
              <h2 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-none uppercase font-sans font-black">Location</h2>
              <div className="w-16 h-2 bg-indigo-600 mt-8 mb-12"></div>
            </div>
            <div className="space-y-12 md:space-y-16 break-keep">
              <div className="flex gap-8 md:gap-10 items-start group">
                <div className="bg-indigo-600 p-5 rounded-3xl text-white shadow-xl shadow-indigo-100 group-hover:scale-110 transition-all duration-300 font-noto"><Train size={32} strokeWidth={2.5} /></div>
                <div className="font-noto"><h4 className="font-black text-2xl md:text-3xl mb-4 text-gray-900 tracking-tight font-noto">지하철</h4><p className="text-base md:text-xl text-gray-500 leading-relaxed font-noto"><span className="text-indigo-600 font-black">사당역</span> (2, 4호선) 11~14번 출구 <span className="text-gray-400 font-bold ml-2">(도보 5분)</span><br /><span className="text-indigo-600 font-black">이수역</span> (4, 7호선) 4, 5번 출구 <span className="text-gray-400 font-bold ml-2">(도보 10분)</span></p></div>
              </div>
              <div className="flex gap-8 md:gap-10 items-start group">
                <div className="bg-indigo-600 p-5 rounded-3xl text-white shadow-xl shadow-indigo-100 group-hover:scale-110 transition-all duration-300 font-noto"><Bus size={32} strokeWidth={2.5} /></div>
                <div className="font-noto"><h4 className="font-black text-2xl md:text-3xl mb-4 text-gray-900 tracking-tight font-noto">버스</h4><p className="text-base md:text-xl text-gray-500 leading-relaxed font-noto"><span className="bg-indigo-50 text-indigo-700 px-4 py-1 rounded-xl font-black mr-3">350, 4212, 4318, 동작09 등</span><br />방배노인종합복지관(중) 하차 <span className="text-gray-400 font-bold ml-2">(도보 3분)</span></p></div>
              </div>
              <div className="flex gap-8 md:gap-10 items-start group font-noto">
                <div className="bg-indigo-600 p-5 rounded-3xl text-white shadow-xl shadow-indigo-100 group-hover:scale-110 transition-all duration-300 font-noto"><Car size={32} strokeWidth={2.5} /></div>
                <div className="font-noto"><h4 className="font-black text-2xl md:text-3xl mb-4 text-gray-900 tracking-tight font-black">자가운전</h4><p className="text-base md:text-xl text-gray-500 leading-relaxed font-noto font-noto"><span className="text-indigo-600 font-black">'서초구 방배천로 40-2'</span><br /><span className="text-sm md:text-base text-gray-400 font-black">교회 앞 공영주차장을 이용해 주시기 바랍니다.</span></p></div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7 h-[600px] md:h-full min-h-[600px] font-noto">
            <div className="bg-white rounded-[4rem] md:rounded-[6rem] overflow-hidden shadow-2xl border-[12px] md:border-[24px] border-white h-full relative shadow-indigo-100/50 font-noto">
              <iframe src="https://maps.google.com/maps?q=서울특별시%20서초구%20방배천로%2040-2&t=&z=17&ie=UTF8&iwloc=&output=embed" width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" title="Church Map" className="opacity-90 contrast-110"></iframe>
              <div className="absolute bottom-8 left-8 right-8 md:bottom-16 md:left-16 md:right-16 z-20 bg-white/90 backdrop-blur-xl p-8 md:p-14 rounded-[3rem] md:rounded-[4rem] shadow-2xl flex items-center justify-between border border-white/20 font-noto">
                <div className="text-left font-black font-noto"><p className="font-black text-gray-900 text-2xl md:text-4xl tracking-tighter uppercase font-noto mb-2">센트럴처치</p><div className="text-xs md:text-lg text-gray-400 mt-1 flex flex-col gap-1 font-noto font-noto font-black"><span>서울특별시 서초구 방배천로 40-2</span><span className="opacity-70">서초구 방배2동 453-6 2층, 3층</span></div></div>
                <a href={mapLink} target="_blank" rel="noopener noreferrer" className="bg-indigo-600 text-white p-4 md:p-8 rounded-3xl md:rounded-[3rem] shadow-lg hover:bg-indigo-700 transition-colors font-sans"><ExternalLink size={28}/></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
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
          if (data.items) setVideos(data.items);
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
            <img src={images.logo} alt="Logo" className="h-20 object-contain" onError={(e) => e.target.style.display='none'} />
            <button onClick={() => setIsMenuOpen(false)} className="text-gray-900 p-2 font-noto font-noto"><X size={36} strokeWidth={1.5} /></button>
          </div>
          <div className="flex flex-col p-12 space-y-10 overflow-y-auto font-noto font-noto">
            {[{ id: 'home', label: '홈' }, { id: 'about', label: '교회소개' }, { id: 'worship', label: '예배시간' }, { id: 'sermon', label: '다시듣기' }, { id: 'contact', label: '찾아오는 길' }].map((tab) => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setIsMenuOpen(false); }} className={`text-6xl font-black text-left tracking-tighter ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-300'} active:text-indigo-400 transition-colors uppercase font-noto font-noto font-black`}>{tab.label}</button>
            ))}
          </div>
          <div className="mt-auto p-12 border-t border-gray-50 bg-gray-50/50 uppercase font-sans font-noto font-black"><p className="text-xs font-black text-gray-300 tracking-[0.4em]">© 2026 Central Church</p></div>
        </div>
      )}

      <nav className={`fixed w-full z-[1000] transition-all duration-500 font-black font-noto ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-4' : 'bg-white py-6 md:py-10'}`}>
        <div className="max-w-[1920px] mx-auto px-6 md:px-16 flex justify-between items-center font-noto">
          <div className="flex items-center cursor-pointer group font-black font-noto font-black font-black font-noto" onClick={() => setActiveTab('home')}>
            <div className="relative h-20 md:h-32 lg:h-36 flex items-center font-noto">
               <img src={images.logo} alt="Central Church" className="h-full w-auto object-contain font-black font-noto font-black font-black" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
               <div className="hidden items-center gap-3 uppercase font-black font-noto font-black font-black font-black"><BookOpen size={32} className="text-indigo-600 font-black" /><span className="text-xl md:text-2xl font-black text-gray-900 tracking-tighter font-noto font-black">Central Church</span></div>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center space-x-16 font-black uppercase text-base xl:text-lg font-sans font-black font-black font-black font-black">
            {[{ id: 'home', label: 'Home' }, { id: 'about', label: '교회소개' }, { id: 'worship', label: '예배시간' }, { id: 'sermon', label: '다시듣기' }, { id: 'contact', label: '찾아오는 길' }].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tracking-[0.1em] transition-all relative py-1 group font-black font-black font-black ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-900'}`}>{tab.label}<span className={`absolute bottom-0 left-0 w-full h-[2px] bg-indigo-600 transform origin-left transition-transform duration-300 ${activeTab === tab.id ? 'scale-x-100' : 'scale-x-0'}`}></span></button>
            ))}
          </div>

          <div className="lg:hidden flex items-center font-black font-noto font-black font-black"><button onClick={() => setIsMenuOpen(true)} className="p-4 -mr-4 text-gray-900 active:bg-gray-50 rounded-full transition-colors relative z-[1100] font-noto font-black"><Menu size={32} strokeWidth={1.5} /></button></div>
        </div>
      </nav>

      <div className="layout-content-wrapper font-noto font-black">
        {renderContent()}
      </div>

      <footer className="bg-white text-gray-400 py-32 md:py-48 px-6 border-t border-gray-50 text-center font-black font-noto">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-8 mb-20 font-black font-noto font-black">
          <MapPin className="text-indigo-600 font-black font-black" size={32} strokeWidth={2} />
          <div className="flex flex-col gap-3 font-black font-noto text-xl md:text-2xl font-black">
            <span className="text-gray-900 font-black font-noto font-black">서울특별시 서초구 방배천로 40-2</span>
            <span className="text-sm md:text-lg opacity-70 font-black font-noto font-black">(지번)서울특별시 서초구 방배2동 453-6 2층, 3층</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-20 border-t border-gray-50 text-xs md:text-sm font-black uppercase tracking-[0.5em] text-gray-300 font-sans font-black font-black"><p>© 2026 CENTRAL CHURCH. ALL RIGHTS RESERVED.</p></div>
      </footer>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
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

        /* 엣지 및 데스크탑 해상도 대응 강화 */
        @media (min-width: 1024px) {
          .lg\\:flex { display: flex !important; }
          .lg\\:hidden { display: none !important; }
        }

        @media (max-width: 1023px) {
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
