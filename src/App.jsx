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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-[280px] rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative border border-white/20">
        <div className="bg-slate-800 py-4 px-6 text-center text-white relative">
          <h3 className="text-base font-black tracking-tighter">센트럴처치 안내</h3>
          <button 
            onClick={onClose} 
            className="absolute top-1/2 -translate-y-1/2 right-4 text-white/70 hover:text-white bg-white/10 p-1 rounded-full transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-4 font-noto break-keep text-left">
          <div className="text-center">
            <p className="text-gray-900 font-bold text-[13px] leading-relaxed">
              주일 1,2부 예배시 <br />
              <span className="text-indigo-600 font-black">10분 전부터 찬양</span>이 시작됩니다.
            </p>
          </div>
          <div className="w-full h-px bg-gray-100"></div>
          <div className="text-center">
            <h4 className="text-gray-400 font-black text-[8px] uppercase tracking-widest mb-0.5">주차 안내</h4>
            <p className="text-gray-800 font-bold text-[11px]">교회 앞 공영주차장을 이용해 주세요.</p>
          </div>
          <div className="w-full h-px bg-gray-100"></div>
          <div className="text-center">
            <h4 className="text-gray-400 font-black text-[8px] uppercase tracking-widest mb-0.5">설교 영상</h4>
            <p className="text-gray-800 font-bold text-[11px]">지난 설교는 <span className="text-red-600 font-black">교회 유튜브</span>에서</p>
            <p className="text-gray-400 text-[9px]">(센트럴처치 검색)</p>
          </div>
          <div className="bg-indigo-50/50 rounded-xl p-3 text-center border border-indigo-100">
            <h4 className="text-indigo-600 font-black text-[8px] uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
              <CreditCard size={10} /> 온라인 헌금
            </h4>
            <p className="text-gray-900 font-black text-sm tracking-tight mb-0.5 font-sans">국민은행 437637-01-009066</p>
            <p className="text-gray-600 font-bold text-[10px] mb-1">예금주: 중앙교회</p>
            <p className="text-[8px] text-gray-400 leading-tight">성함과 헌금 명목을 꼭 적어주세요.</p>
          </div>
        </div>
        <button onClick={onClose} className="w-full py-3 bg-slate-800 text-white font-black uppercase tracking-[0.2em] text-[9px] hover:bg-black transition-colors">확인했습니다</button>
      </div>
    </div>
  );
};

// --- 비디오 모달 플레이어 컴포넌트 ---
const VideoModal = ({ videoId, onClose }) => {
  if (!videoId) return null;
  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
      <div className="relative w-full max-w-5xl aspect-video rounded-[1rem] md:rounded-[2rem] overflow-hidden shadow-2xl bg-black border border-white/10" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 md:top-6 md:right-6 z-20 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 p-1.5 rounded-full transition-all"><X size={24} /></button>
        <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
      </div>
    </div>
  );
};

// --- 메인 레이아웃 컴포넌트들 ---

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
      <div className="absolute inset-0 flex items-center justify-center -z-10 text-gray-300 font-bold uppercase tracking-widest text-[10px] font-sans p-10 text-center">IMAGE LOADING</div>
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
    {/* pt-40 md:pt-52로 여백을 대폭 확대하여 글씨가 로고에 가려지지 않게 수정 */}
    <section className="relative min-h-screen flex items-center bg-white overflow-hidden pt-40 md:pt-52 pb-20 font-noto">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
        <div className="z-10 text-left animate-fade-in-up flex flex-col items-start font-sans">
          <h1 className="text-gray-900 tracking-tighter leading-[1.0] uppercase mb-8 text-left font-sans">
            <span className="text-4xl md:text-5xl lg:text-6xl font-bold block mb-4 opacity-80">Welcome to</span>
            <span className="text-6xl md:text-8xl lg:text-9xl font-black block leading-none">Central <br className="hidden lg:block" /> Church</span>
          </h1>
          <div className="w-16 h-1.5 bg-indigo-600 mb-8"></div>
          <p className="text-base md:text-xl text-gray-400 font-medium leading-relaxed max-w-md font-noto break-keep text-left">
            센트럴처치 홈페이지를 찾아주신 여러분을 진심으로 환영하고 축복합니다.
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
  <main className="pt-40 md:pt-60 pb-32 px-6 bg-white animate-in fade-in duration-1000 font-noto text-left">
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-4 font-sans font-bold">
        <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter text-gray-900 uppercase font-sans">Church Info</h2>
        <div className="w-10 h-1 bg-gray-900 mx-auto rounded-full opacity-20"></div>
      </div>
      <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-24 border border-gray-100 shadow-2xl shadow-indigo-50/50 mb-20 relative overflow-hidden text-left">
        <Quote className="absolute -top-6 -left-6 text-indigo-50/50 w-32 h-32 md:w-48 md:h-48" />
        <div className="relative z-10 text-left">
          <div className="space-y-8 md:space-y-12 text-base md:text-2xl text-gray-600 leading-[1.8] md:leading-[2.1] font-medium tracking-normal break-keep">
            <div className="flex gap-4 items-start text-left">
              <span className="text-indigo-600 shrink-0 text-xl font-black mt-[6px] md:mt-[10px]">•</span>
              <p>영적인 말씀이 강하게 선포되는 교회</p>
            </div>
            <div className="flex gap-4 items-start text-left">
              <span className="text-indigo-600 shrink-0 text-xl font-black mt-[6px] md:mt-[10px]">•</span>
              <p>오직 기도에 힘쓰는 교회</p>
            </div>
            <div className="flex gap-4 items-start text-left">
              <span className="text-indigo-600 shrink-0 text-xl font-black mt-[6px] md:mt-[10px]">•</span>
              <p>선교적 사명을 끝날까지 감당하는 교회</p>
            </div>
            <div className="flex gap-4 items-start text-left">
              <span className="text-indigo-600 shrink-0 text-xl font-black mt-[6px] md:mt-[10px]">•</span>
              <p>복음으로 사랑의 명령을 실천하는 교회</p>
            </div>
          </div>
          <div className="mt-16 md:mt-24 pt-10 md:pt-12 border-t border-gray-100 font-sans text-center break-keep">
            <p className="text-xl md:text-3xl font-black text-gray-900 tracking-tighter uppercase leading-relaxed md:leading-relaxed font-noto">
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
  <section className="pt-40 md:pt-60 pb-32 px-6 bg-white min-h-screen font-noto">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16 md:mb-24 font-sans font-bold">
        <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tighter uppercase font-sans">Worship</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-8 md:gap-10 font-bold">
        <div className="bg-white p-10 md:p-16 rounded-[3rem] md:rounded-[4rem] border border-gray-100 shadow-xl shadow-indigo-50/30 text-left">
          <h3 className="text-gray-900 font-black text-xl md:text-2xl mb-10 flex items-center gap-4 uppercase tracking-tighter font-sans font-bold"><Clock className="text-indigo-600" strokeWidth={3}/> Sunday</h3>
          <div className="space-y-10">
            {worshipTimes.filter(t => t.name.includes('주일')).map((item, idx) => (
              <div key={idx} className="flex justify-between items-end group">
                <p className="text-gray-900 font-black text-lg md:text-xl group-hover:text-indigo-600 transition-colors tracking-tighter font-bold font-noto">{item.name}</p>
                <p className="text-gray-900 text-2xl md:text-3xl font-black tracking-tighter font-sans">{item.time}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-900 p-10 md:p-16 rounded-[3rem] md:rounded-[4rem] text-white shadow-2xl text-left">
          <h3 className="text-indigo-400 font-black text-xl md:text-2xl mb-10 flex items-center gap-4 uppercase tracking-tighter font-sans font-bold"><Users strokeWidth={3}/> Weekday</h3>
          <div className="space-y-10">
            {worshipTimes.filter(t => !t.name.includes('주일')).map((item, idx) => (
              <div key={idx} className="flex justify-between items-end group">
                <p className="text-white font-black text-lg md:text-xl group-hover:text-indigo-400 transition-colors tracking-tighter font-bold font-noto">{item.name}</p>
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
  <main className="pt-40 md:pt-60 pb-32 px-6 bg-white min-h-screen font-noto text-left font-sans">
    <div className="max-w-7xl mx-auto">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-20 gap-8 text-left">
         <div className="text-left font-sans font-bold">
            <span className="text-indigo-600 font-bold tracking-[0.4em] text-[10px] uppercase mb-4 block font-sans font-black">Archive</span>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none uppercase font-noto text-left">주일 말씀</h2>
         </div>
         <a href="https://youtube.com/@centralchurch5467?si=zOJh5JBLDqAlI1fF" target="_blank" rel="noopener noreferrer" className="bg-red-600 text-white px-8 md:px-10 py-4 rounded-full font-black text-[11px] tracking-widest hover:bg-red-700 transition-all uppercase flex items-center gap-3 shadow-xl shadow-red-50 font-sans">
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
                <div key={i} onClick={() => onVideoSelect(video.id.videoId)} className="group cursor-pointer block text-left">
                  <div className="relative aspect-video rounded-[2rem] md:rounded-[3.5rem] overflow-hidden mb-8 shadow-sm group-hover:shadow-2xl transition-all duration-700 border border-gray-100 bg-gray-50">
                     <img src={video.snippet.thumbnails.high.url} alt={video.snippet.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/20">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-2xl text-indigo-600 transform scale-90 group-hover:scale-100 transition-transform"><PlayCircle size={32} /></div>
                     </div>
                  </div>
                  <h4 className="text-lg md:text-xl font-black text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug font-noto break-keep text-left">
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
                  <div className="h-6 w-3/4 bg-gray-100 mb-4 rounded-full border border-gray-50"></div>
                  <div className="h-4 w-1/4 bg-gray-100 rounded-full border border-gray-50"></div>
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
    <section className="pt-40 md:pt-60 pb-32 px-6 bg-white min-h-screen font-noto text-left font-sans text-left">
      <div className="max-w-7xl mx-auto text-left">
        <div className="grid lg:grid-cols-12 gap-12 md:gap-16 items-start font-bold text-left">
          <div className="lg:col-span-5 space-y-10 md:space-y-12 text-left">
            <div>
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none uppercase font-sans font-black text-left">Location</h2>
              <div className="w-12 h-1.5 bg-indigo-600 mt-6 mb-10"></div>
            </div>
            <div className="space-y-10 md:space-y-12 font-noto break-keep text-left">
              <div className="flex gap-5 md:gap-6 items-start group text-left">
                <div className="bg-indigo-600 p-4 rounded-2xl md:rounded-3xl text-white shadow-lg shadow-indigo-100 group-hover:scale-110 transition-all duration-300 text-left"><Train size={24} strokeWidth={2.5} /></div>
                <div className="text-left"><h4 className="font-black text-xl mb-3 text-gray-900 tracking-tight text-left">지하철</h4><p className="text-sm md:text-base text-gray-500 leading-relaxed font-noto text-left"><span className="text-indigo-600 font-black text-lg text-left">사당역</span> (2, 4호선) 11~14번 출구 <span className="text-gray-400 font-bold ml-1 text-left">(도보 5분)</span><br /><span className="text-indigo-600 font-black text-lg text-left">이수역</span> (4, 7호선) 4, 5번 출구 <span className="text-gray-400 font-bold ml-1 text-left">(도보 10분)</span></p></div>
              </div>
              <div className="flex gap-5 md:gap-6 items-start group text-left">
                <div className="bg-indigo-600 p-4 rounded-2xl md:rounded-3xl text-white shadow-lg shadow-indigo-100 group-hover:scale-110 transition-all duration-300 text-left"><Bus size={24} strokeWidth={2.5} /></div>
                <div className="text-left"><h4 className="font-black text-xl mb-3 text-gray-900 tracking-tight text-left text-left">버스</h4><p className="text-sm md:text-base text-gray-500 leading-relaxed font-noto text-left text-left"><span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg font-black mr-2 font-black text-left">350, 4212, 4318, 동작09 등</span><br />방배노인종합복지관(중) 하차 <span className="text-gray-400 font-bold ml-1 text-left">(도보 3분)</span></p></div>
              </div>
              <div className="flex gap-5 md:gap-6 items-start group text-left">
                <div className="bg-indigo-600 p-4 rounded-2xl md:rounded-3xl text-white shadow-lg shadow-indigo-100 group-hover:scale-110 transition-all duration-300 text-left text-left"><Car size={24} strokeWidth={2.5} /></div>
                <div className="text-left"><h4 className="font-black text-xl mb-3 text-gray-900 tracking-tight font-black text-left text-left text-left">자가운전</h4><p className="text-sm md:text-base text-gray-500 leading-relaxed font-noto text-left text-left text-left text-left text-left"><span className="text-indigo-600 font-black text-left">'서초구 방배천로 40-2'</span><br /><span className="text-xs text-gray-400 font-black font-black text-left text-left text-left">교회 앞 공영주차장을 이용해 주시기 바랍니다.</span></p></div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7 h-[500px] md:h-full min-h-[500px] text-left">
            <div className="bg-white rounded-[3rem] md:rounded-[5rem] overflow-hidden shadow-2xl border-[8px] md:border-[16px] border-white h-full relative shadow-indigo-100/50 font-bold text-left">
              <iframe src="https://maps.google.com/maps?q=서울특별시%20서초구%20방배천로%2040-2&t=&z=17&ie=UTF8&iwloc=&output=embed" width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" title="Church Map" className="opacity-90 contrast-110 text-left"></iframe>
              <div className="absolute bottom-6 left-6 right-6 md:bottom-12 md:left-12 md:right-12 z-20 bg-white/90 backdrop-blur-xl p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] shadow-2xl flex items-center justify-between border border-white/20 text-left">
                <div className="font-sans text-left font-black text-left"><p className="font-black text-gray-900 text-lg md:text-2xl tracking-tighter uppercase font-noto text-left text-left">센트럴처치</p><div className="text-[10px] md:text-[11px] text-gray-400 mt-1 font-sans flex flex-col gap-0.5 font-noto font-black text-left text-left"><span>서울특별시 서초구 방배천로 40-2</span><span className="opacity-70 text-left">서초구 방배2동 453-6 2층, 3층</span></div></div>
                <a href={mapLink} target="_blank" rel="noopener noreferrer" className="bg-indigo-600 text-white p-3 md:p-5 rounded-2xl md:rounded-3xl shadow-lg hover:bg-indigo-700 transition-colors font-sans"><ExternalLink size={20}/></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

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
          console.error("유튜브 에러:", err);
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
    <div className="min-h-screen bg-white font-noto text-gray-900 selection:bg-indigo-100 selection:text-indigo-900 tracking-tight overflow-x-hidden font-bold">
      
      {isPopupOpen && <NoticePopup onClose={() => setIsPopupOpen(false)} />}
      
      {selectedVideoId && <VideoModal videoId={selectedVideoId} onClose={() => setSelectedVideoId(null)} />}

      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-[9999] flex flex-col animate-in fade-in slide-in-from-right duration-300 font-bold font-sans">
          <div className="flex justify-between items-center p-8 border-b border-gray-50">
            <img src={images.logo} alt="Logo" className="h-16 object-contain" onError={(e) => e.target.style.display='none'} />
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
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setIsMenuOpen(false); }} className={`text-5xl font-black text-left tracking-tighter ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-300'} active:text-indigo-400 transition-colors uppercase font-bold font-sans`}>{tab.label}</button>
            ))}
          </div>
          <div className="mt-auto p-10 border-t border-gray-50 bg-gray-50/50 font-sans font-bold uppercase"><p className="text-[10px] font-black text-gray-300 tracking-[0.4em]">© 2026 Central Church</p></div>
        </div>
      )}

      <nav className={`fixed w-full z-[1000] transition-all duration-500 font-bold ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-2' : 'bg-white py-4 md:py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center font-sans">
          <div className="flex items-center cursor-pointer group font-bold" onClick={() => setActiveTab('home')}>
            <div className="relative h-20 md:h-28 flex items-center">
               <img src={images.logo} alt="Central Church" className="h-full w-auto object-contain font-bold font-sans font-bold" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
               <div className="hidden items-center gap-2 font-bold font-sans uppercase font-bold font-bold font-bold"><BookOpen size={24} className="text-indigo-600 font-bold font-sans font-bold" /><span className="text-xl font-black text-gray-900 tracking-tighter font-noto font-bold">Central Church</span></div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-12 font-bold uppercase font-sans font-bold">
            {[
              { id: 'home', label: 'Home' }, 
              { id: 'about', label: '교회소개' }, 
              { id: 'worship', label: '예배시간' }, 
              { id: 'sermon', label: '다시듣기' }, 
              { id: 'contact', label: '찾아오는 길' }
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`text-[13px] tracking-[0.1em] transition-all relative py-1 group font-bold font-sans font-bold ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-900'}`}>{tab.label}<span className={`absolute bottom-0 left-0 w-full h-[1px] bg-indigo-600 transform origin-left transition-transform duration-300 ${activeTab === tab.id ? 'scale-x-100' : 'scale-x-0'}`}></span></button>
            ))}
          </div>

          <div className="md:hidden flex items-center font-bold font-sans font-bold"><button onClick={() => setIsMenuOpen(true)} className="p-3 -mr-3 text-gray-900 active:bg-gray-50 rounded-full transition-colors relative z-[1100] font-bold"><Menu size={28} strokeWidth={1.5} /></button></div>
        </div>
      </nav>

      {renderContent()}

      <footer className="bg-white text-gray-400 py-24 md:py-32 px-6 border-t border-gray-50 font-noto text-center font-sans font-bold font-bold">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6 mb-16 font-bold font-bold">
          <MapPin className="text-indigo-600 font-bold font-bold" size={24} strokeWidth={2} />
          <div className="flex flex-col gap-2 font-bold font-bold">
            <span className="text-gray-900 font-black text-lg font-noto font-bold">서울특별시 서초구 방배천로 40-2</span>
            <span className="text-[11px] opacity-70 font-bold font-noto font-bold font-bold">(지번)서울특별시 서초구 방배2동 453-6 2층, 3층</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-16 border-t border-gray-50 text-[10px] font-black uppercase tracking-[0.5em] text-gray-300 font-bold font-sans font-black font-black font-black"><p>© 2026 CENTRAL CHURCH. ALL RIGHTS RESERVED.</p></div>
      </footer>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap');
        
        .font-noto { 
          font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
          word-break: keep-all; 
          overflow-wrap: break-word;
        }
        
        .break-keep {
          word-break: keep-all;
          overflow-wrap: break-word;
        }

        body { 
          font-family: 'Noto Sans KR', sans-serif; 
          background: #ffffff; 
          -webkit-tap-highlight-color: transparent;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </div>
  );
};

export default App;
