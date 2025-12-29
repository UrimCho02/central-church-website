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
  Car
} from 'lucide-react';

// --- 전역 데이터 및 이미지 경로 설정 ---
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

// --- 컴포넌트 분리 (깜빡임 방지를 위해 App 외부에 정의) ---

const MainHeroSlider = ({ images }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative w-full aspect-square md:aspect-[4/5] rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-2xl bg-gray-100">
      {images.map((src, index) => (
        <img 
          key={index}
          src={src} 
          alt={`Central Church Slide ${index + 1}`} 
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            currentSlide === index ? 'opacity-100' : 'opacity-0'
          }`}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center -z-10 text-gray-300 font-bold uppercase tracking-widest text-xs font-sans p-10 text-center">
        Hero Slide {currentSlide + 1}<br />(1000x1000 또는 1000x1250 권장)
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {images.map((_, idx) => (
          <div 
            key={idx} 
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentSlide === idx ? 'w-8 bg-indigo-600' : 'bg-gray-300/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const Home = ({ onAboutClick, onWorshipClick }) => (
  <>
    <section className="relative min-h-screen flex items-center bg-white overflow-hidden pt-32 pb-20 font-noto">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
        <div className="z-10 text-left animate-fade-in-up flex flex-col items-start">
          <h1 className="text-gray-900 tracking-tighter leading-[1.0] uppercase font-sans mb-10 text-left">
            <span className="text-4xl md:text-5xl lg:text-6xl font-bold block mb-2 opacity-80">Welcome to</span>
            <span className="text-7xl md:text-8xl lg:text-9xl font-black block">Central <br className="hidden lg:block" /> Church</span>
          </h1>
          <div className="w-16 h-1 bg-indigo-600 mb-10"></div>
          <p className="text-lg md:text-xl text-gray-400 font-medium leading-relaxed max-w-md">
            센트럴처치 홈페이지를 찾아주신 여러분을<br />진심으로 환영하고 축복합니다.
          </p>
        </div>
        <div className="animate-fade-in-up [animation-delay:300ms] w-full">
          <MainHeroSlider images={heroImages} />
        </div>
      </div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-gray-200 hidden md:block">
        <ChevronDown size={40} strokeWidth={1} />
      </div>
    </section>

    <section className="py-24 px-6 bg-gray-50 font-noto">
      <div className="max-w-7xl mx-auto text-center">
        <button onClick={onWorshipClick} className="group inline-flex flex-col items-center">
          <span className="text-indigo-600 font-black tracking-[0.4em] text-[11px] uppercase mb-4 font-sans">Service Information</span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">예배 안내 보기</h2>
          <div className="mt-8 w-16 h-16 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-500">
             <ChevronRight size={32} />
          </div>
        </button>
      </div>
    </section>
  </>
);

const About = () => (
  <main className="pt-40 pb-32 px-6 bg-white animate-in fade-in duration-1000 font-noto text-left">
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-2 font-sans">
        <h2 className="text-6xl font-black mb-8 tracking-tighter text-gray-900 uppercase">Church Info</h2>
        <div className="w-12 h-1 bg-gray-900 mx-auto rounded-full"></div>
      </div>

      <div className="bg-white rounded-[4rem] p-12 md:p-24 border border-gray-100 shadow-2xl shadow-indigo-50 mb-20 relative">
        <Quote className="absolute top-10 left-10 text-gray-50 w-40 h-40" />
        <div className="relative z-10">
          <div className="space-y-12 text-lg md:text-2xl text-gray-600 leading-[2.1] font-medium tracking-normal">
            <div className="flex gap-4 items-center">
              <span className="text-indigo-600 shrink-0 text-xl leading-none">•</span>
              <p>영적인 말씀이 강하게 선포되는 교회</p>
            </div>
            <div className="flex gap-4 items-center">
              <span className="text-indigo-600 shrink-0 text-xl leading-none">•</span>
              <p>오직 기도에 힘쓰는 교회</p>
            </div>
            <div className="flex gap-4 items-center">
              <span className="text-indigo-600 shrink-0 text-xl leading-none">•</span>
              <p>선교적 사명을 끝날까지 감당하는 교회</p>
            </div>
            <div className="flex gap-4 items-center">
              <span className="text-indigo-600 shrink-0 text-xl leading-none">•</span>
              <p>복음으로 사랑의 명령을 실천하는 교회</p>
            </div>
          </div>
          <div className="mt-24 pt-12 border-t border-gray-100 font-sans text-center">
            <p className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-relaxed">
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
  <section className="pt-40 pb-32 px-6 bg-white min-h-screen font-noto">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-24 font-sans">
        <h2 className="text-6xl font-black text-gray-900 mb-6 tracking-tighter uppercase">Worship</h2>
        <p className="text-indigo-600 font-black uppercase tracking-[0.4em] text-[11px]">Worship Services</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-10">
        <div className="bg-white p-12 md:p-16 rounded-[4rem] border border-gray-100 shadow-xl shadow-indigo-50/30">
          <h3 className="text-gray-900 font-black text-2xl mb-12 flex items-center gap-4 uppercase tracking-tighter font-sans"><Clock className="text-indigo-600" strokeWidth={3}/> Sunday</h3>
          <div className="space-y-12">
            {worshipTimes.filter(t => t.name.includes('주일')).map((item, idx) => (
              <div key={idx} className="flex justify-between items-end group">
                <div className="space-y-2">
                  <p className="text-gray-900 font-black text-xl group-hover:text-indigo-600 transition-colors tracking-tighter">{item.name}</p>
                </div>
                <p className="text-gray-900 text-3xl font-black tracking-tighter font-sans">{item.time}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 p-12 md:p-16 rounded-[4rem] text-white shadow-2xl">
          <h3 className="text-indigo-400 font-black text-2xl mb-12 flex items-center gap-4 uppercase tracking-tighter font-sans"><Users strokeWidth={3}/> Weekday</h3>
          <div className="space-y-12">
            {worshipTimes.filter(t => !t.name.includes('주일')).map((item, idx) => (
              <div key={idx} className="flex justify-between items-end group">
                <div className="space-y-2">
                  <p className="text-white font-black text-xl group-hover:text-indigo-400 transition-colors tracking-tighter">{item.name}</p>
                </div>
                <p className="text-white text-3xl font-black tracking-tighter font-sans">{item.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Sermon = () => (
  <main className="pt-40 pb-32 px-6 bg-white min-h-screen font-noto text-left font-sans">
    <div className="max-w-7xl mx-auto">
       <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
         <div className="text-left font-sans">
            <span className="text-indigo-600 font-black tracking-[0.4em] text-[11px] uppercase mb-4 block font-sans">Archive</span>
            <h2 className="text-6xl font-black text-gray-900 tracking-tighter leading-none uppercase">주일 말씀</h2>
         </div>
         {/* 유튜브 채널 링크 연결 */}
         <a 
           href="https://youtube.com/@centralchurch5467?si=zOJh5JBLDqAlI1fF" 
           target="_blank" 
           rel="noopener noreferrer"
           className="bg-red-600 text-white px-10 py-4 rounded-full font-black text-[12px] tracking-widest hover:bg-red-700 transition-all uppercase flex items-center gap-3 shadow-xl shadow-red-50 font-sans cursor-pointer"
         >
            <Youtube size={20}/> YouTube
         </a>
       </div>

       <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-16 font-sans">
          {[1, 2, 3].map(i => (
            <div key={i} className="group cursor-pointer">
              <div className="relative aspect-video rounded-[3.5rem] overflow-hidden mb-8 shadow-sm group-hover:shadow-2xl transition-all duration-700 border border-gray-100 bg-gray-50 flex items-center justify-center">
                 <img src={images.church_info} className="w-full h-full object-cover brightness-105" onError={(e) => e.target.style.display = 'none'} />
                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl text-indigo-600"><PlayCircle size={36} /></div>
                 </div>
                 <div className="text-gray-300 font-bold uppercase tracking-widest text-[10px] font-black font-sans">Sermon Video</div>
              </div>
              <h4 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors tracking-tighter">말씀 영상</h4>
              <p className="text-gray-400 text-xs font-bold font-sans tracking-widest uppercase font-sans">Latest Message</p>
            </div>
          ))}
       </div>
    </div>
  </main>
);

const Contact = () => {
  const mapLink = "https://map.kakao.com/link/search/서울특별시 서초구 방배천로 40-2";

  return (
    <section className="pt-40 pb-32 px-6 bg-white min-h-screen font-noto text-left font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          {/* 좌측 상세 정보 영역 */}
          <div className="lg:col-span-5 space-y-12">
            <div className="mb-4">
              <h2 className="text-6xl font-black text-gray-900 tracking-tighter leading-none uppercase">Location</h2>
              <div className="w-16 h-1.5 bg-indigo-600 mt-6 mb-10"></div>
            </div>
            
            <div className="space-y-12">
              {/* 지하철 정보 */}
              <div className="flex gap-6 items-start group">
                <div className="bg-indigo-50 p-4 rounded-3xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <Train size={28} />
                </div>
                <div>
                  <h4 className="font-black text-xl mb-3 text-gray-900 tracking-tight">지하철</h4>
                  <div className="text-gray-500 leading-relaxed font-medium">
                    <p className="mb-2">
                      <span className="text-indigo-600 font-bold">사당역</span> (2, 4호선) <br />
                      11번, 12번, 13번, 14번 출구 <span className="text-gray-400 text-sm ml-1 font-bold">(도보 5분)</span>
                    </p>
                    <p>
                      <span className="text-indigo-600 font-bold">이수역</span> (4, 7호선) <br />
                      4번, 5번 출구 <span className="text-gray-400 text-sm ml-1 font-bold">(도보 10분)</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* 버스 정보 */}
              <div className="flex gap-6 items-start group">
                <div className="bg-indigo-50 p-4 rounded-3xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <Bus size={28} />
                </div>
                <div>
                  <h4 className="font-black text-xl mb-3 text-gray-900 tracking-tight">버스</h4>
                  <div className="text-gray-500 leading-relaxed font-medium space-y-3">
                    <p>
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-sm font-bold mr-2">350, 4212, 4318, 동작09 등</span><br />
                      방배노인종합복지관(중) 하차 <span className="text-gray-400 text-sm ml-1 font-bold">(도보 3분)</span>
                    </p>
                    <p>
                      이수역(중) 하차 <span className="text-gray-400 text-sm ml-1 font-bold">(도보 7분)</span>
                    </p>
                    <p>
                      사당동우체국앞(중) 하차 <span className="text-gray-400 text-sm ml-1 font-bold">(도보 8분)</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* 자가운전 정보 */}
              <div className="flex gap-6 items-start group">
                <div className="bg-indigo-50 p-4 rounded-3xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <Car size={28} />
                </div>
                <div>
                  <h4 className="font-black text-xl mb-3 text-gray-900 tracking-tight">자가운전</h4>
                  <div className="text-gray-500 leading-relaxed font-medium">
                    <p className="mb-2">
                      네비게이션 <span className="text-indigo-600 font-bold">'서초구 방배천로 40-2'</span>
                    </p>
                    <p className="text-sm text-gray-400 font-bold">
                      주차는 교회 앞 공영주차장을 이용해 주시기 바랍니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 우측 지도 영역 */}
          <div className="lg:col-span-7 h-full">
            <div className="bg-white rounded-[5rem] overflow-hidden shadow-2xl border-[16px] border-white h-[700px] relative shadow-indigo-100/50">
              <iframe 
                src="https://maps.google.com/maps?q=서울특별시%20서초구%20방배천로%2040-2&t=&z=17&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="Church Map"
                className="opacity-90 contrast-110"
              ></iframe>
              
              <div className="absolute bottom-12 left-12 right-12 z-20 bg-white/90 backdrop-blur-xl p-10 rounded-[3.5rem] shadow-2xl flex items-center justify-between border border-white/20">
                <div className="font-sans text-left">
                  <p className="font-black text-gray-900 text-2xl tracking-tighter uppercase">센트럴처치</p>
                  <div className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-2 font-bold font-sans flex flex-col gap-1">
                    <span>서울특별시 서초구 방배천로 40-2</span>
                    <span className="opacity-70">(지번)서울특별시 서초구 방배2동 453-6 2층, 3층</span>
                  </div>
                </div>
                <a 
                  href={mapLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-indigo-600 text-white p-5 rounded-3xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
                >
                  <ExternalLink size={24}/>
                </a>
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
  const [activeTab, setActiveTab] = useState('home');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
  }, [isMenuOpen]);

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home onWorshipClick={() => setActiveTab('worship')} />;
      case 'about': return <About />;
      case 'worship': return <Worship />;
      case 'sermon': return <Sermon />;
      case 'contact': return <Contact />;
      default: return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-900 tracking-tight">
      <nav className={`fixed w-full z-[100] transition-all duration-500 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-2' : 'bg-white py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center font-sans">
          <div className="flex items-center cursor-pointer group" onClick={() => setActiveTab('home')}>
            <div className="relative h-10 md:h-14 flex items-center">
               <img src={images.logo} alt="Central Church" className="h-full w-auto object-contain" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
               <div className="hidden items-center gap-2">
                 <BookOpen size={24} className="text-indigo-600" />
                 <span className="text-xl font-black text-gray-900 tracking-tighter uppercase font-sans">Central Church</span>
               </div>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-12 font-bold uppercase font-sans">
            {[{ id: 'home', label: 'Home' }, { id: 'about', label: '교회소개' }, { id: 'worship', label: '예배시간' }, { id: 'sermon', label: '다시듣기' }, { id: 'contact', label: '찾아오는 길' }].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`text-[13px] tracking-[0.1em] transition-all relative py-1 group ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-900'}`}>
                {tab.label}
                <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-indigo-600 transform origin-left transition-transform duration-300 ${activeTab === tab.id ? 'scale-x-100' : 'scale-x-0'}`}></span>
              </button>
            ))}
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(true)} className="p-2 text-gray-900"><Menu size={28} strokeWidth={1.5} /></button>
          </div>
        </div>
      </nav>

      {renderContent()}

      <footer className="bg-white text-gray-400 py-32 px-6 border-t border-gray-50 font-noto text-center font-sans">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6 mb-16">
          <MapPin className="text-indigo-600" size={24} strokeWidth={2} />
          <div className="flex flex-col gap-2">
            <span className="text-gray-900 font-bold">서울특별시 서초구 방배천로 40-2</span>
            <span className="text-[11px] opacity-70">(지번)서울특별시 서초구 방배2동 453-6 2층, 3층</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-16 border-t border-gray-50 text-[10px] font-black uppercase tracking-[0.5em] text-gray-300 font-sans">
          <p>© 2026 CENTRAL CHURCH. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(60px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap');
        .font-noto { font-family: 'Noto Sans KR', sans-serif; }
        body { font-family: 'Noto Sans KR', sans-serif; background: #ffffff; }
      `}</style>
    </div>
  );
};

export default App;