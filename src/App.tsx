import { useState } from 'react';
import { ArrowDown, Search, Sparkles } from 'lucide-react';
import DetergentGuide from './components/DetergentGuide';
import HouseworkQuiz from './components/HouseworkQuiz';
import HouseworkSearch from './components/HouseworkSearch';
import RoomFlowchart from './components/RoomFlowchart';
import { HERO_IMAGE_PATH, ROOM_GUIDES, RoomId } from './data/houseworkData';

const CORE_PRINCIPLES = [
  {
    index: '01',
    title: '위에서 아래로',
    description: '천장·선반·거울 먼지를 먼저 털어야 바닥을 두 번 닦지 않습니다.',
  },
  {
    index: '02',
    title: '안쪽에서 바깥으로',
    description: '방 안쪽 창가에서 출입구 쪽으로 후진하며 청소해 발자국을 남기지 마세요.',
  },
  {
    index: '03',
    title: '건식 후 습식 청소',
    description: '물기를 묻히기 전에 마른 먼지와 머리카락을 먼저 쓸고 빨아들입니다.',
  },
  {
    index: '04',
    title: '한 번에 한 세제만',
    description: '락스와 산성(구연산·식초) 혼합은 유독가스를 만드니 절대 금지합니다.',
  },
];

export default function App() {
  const [selectedRoomId, setSelectedRoomId] = useState<RoomId>('bathroom');
  const [heroImgError, setHeroImgError] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleJumpToRoom = (roomId: RoomId) => {
    setSelectedRoomId(roomId);
    scrollToSection('room-guides');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Strict 3-Zone Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text wordmark */}
          <a
            href="#top"
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            살림의 정석
          </a>

          {/* Zone 2: 4 concise single-line nav links */}
          <nav
            aria-label="주요 메뉴"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
          >
            <a
              href="#housework-search"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              질문·검색
            </a>
            <a
              href="#room-guides"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              장소별 가이드
            </a>
            <a
              href="#detergent-guide"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              세제·꿀팁
            </a>
            <a
              href="#housework-quiz"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              살림 퀴즈
            </a>
          </nav>

          {/* Zone 3: 1 primary CTA button */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => scrollToSection('housework-quiz')}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              퀴즈 도전하기
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="flex-1">
        {/* Hero Split Section */}
        <section className="py-12 md:py-16 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
              {/* Left Copy Column */}
              <div className="lg:col-span-6 flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500 mb-4">
                  <span>화장실 · 주방 · 거실 · 침실 · 현관</span>
                  <span aria-hidden="true">·</span>
                  <span>장소별 청소 백과</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-slate-900 leading-[1.22]">
                  장소마다 순서가 달라야 집안일이 쉬워집니다
                </h1>

                <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                  무작정 힘으로 닦기보다 공간에 맞는 동선과 세제를 알면 청소 시간은 줄고 집은 더 오래
                  깨끗하게 유지됩니다. 단계별 순서도와 실전 꿀팁을 확인하고 퀴즈로 실력을 점검해 보세요.
                </p>

                {/* Quick Room Access Buttons */}
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => scrollToSection('housework-search')}
                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors whitespace-nowrap shrink-0"
                  >
                    <Search className="w-4 h-4" />
                    <span>집안일 방법 검색하기</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToSection('room-guides')}
                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-teal-800 bg-white border border-slate-200 hover:border-teal-600 rounded-xl transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>장소별 가이드 보기</span>
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Jump Links for Popular Rooms */}
                <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">바로 가기:</span>
                  {ROOM_GUIDES.map((room) => (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => handleJumpToRoom(room.id)}
                      className="hover:text-teal-700 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
                    >
                      {room.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Image Column */}
              <div className="lg:col-span-6">
                <div className="h-full min-h-[260px] lg:min-h-[380px] rounded-2xl border border-slate-200 overflow-hidden bg-slate-100">
                  {!heroImgError ? (
                    <img
                      src={HERO_IMAGE_PATH}
                      alt="햇살이 가득 들어오는 깨끗하고 정돈된 한국 아파트 거실과 주방"
                      referrerPolicy="no-referrer"
                      onError={() => setHeroImgError(true)}
                      className="w-full h-full lg:h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-50 via-slate-100 to-slate-200 flex flex-col items-center justify-center p-8 text-center">
                      <Sparkles className="w-10 h-10 text-teal-700 mb-3" />
                      <p className="text-lg font-bold text-slate-900">살림의 정석</p>
                      <p className="text-sm text-slate-600 mt-1">쾌적한 우리 집을 위한 공간별 청소 가이드</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Full-Width 4-Column Universal Principles Strip below Hero Split */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {CORE_PRINCIPLES.map((item) => (
                <div
                  key={item.index}
                  className="rounded-xl border border-slate-200 bg-white p-5"
                >
                  <span className="font-mono-num text-xs font-semibold text-teal-700">
                    {item.index}. 기본 원칙
                  </span>
                  <h2 className="text-base font-bold text-slate-900 mt-1">{item.title}</h2>
                  <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Search & Question Explanation Section */}
        <HouseworkSearch onJumpToRoom={handleJumpToRoom} />

        {/* Room Guides & Interactive Flowchart */}
        <RoomFlowchart
          rooms={ROOM_GUIDES}
          selectedRoomId={selectedRoomId}
          onSelectRoom={setSelectedRoomId}
        />

        {/* Detergent & Safety Reference */}
        <DetergentGuide />

        {/* Interactive Quiz with 80+ Congratulations */}
        <HouseworkQuiz onJumpToRoom={handleJumpToRoom} />
      </main>

      {/* Corporate-Style Structured Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-slate-800">
            {/* Left Zone: Site Name, Creator & Email */}
            <div className="md:col-span-6 space-y-4">
              <div>
                <a href="#top" className="text-xl font-bold tracking-tight text-white">
                  살림의 정석
                </a>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed max-w-md">
                  화장실, 주방, 거실, 침실, 현관·세탁실까지 공간별 청소 순서도와 안전한 세제 활용법을
                  안내하는 생활 가이드입니다.
                </p>
              </div>

              <dl className="pt-2 space-y-1.5 text-sm">
                <div className="flex items-center gap-2">
                  <dt className="text-slate-400">만든 사람:</dt>
                  <dd className="font-medium text-white">최주빈</dd>
                </div>
                <div className="flex items-center gap-2">
                  <dt className="text-slate-400">이메일:</dt>
                  <dd>
                    <a
                      href="mailto:com8692@naver.com"
                      className="font-medium text-teal-400 hover:text-teal-300 hover:underline underline-offset-4 transition-colors"
                    >
                      com8692@naver.com
                    </a>
                  </dd>
                </div>
              </dl>
            </div>

            {/* Right Zone Column 1: Room Guides */}
            <div className="md:col-span-3">
              <h3 className="text-sm font-semibold text-white mb-4">장소별 가이드</h3>
              <ul className="space-y-2.5 text-sm">
                {ROOM_GUIDES.map((room) => (
                  <li key={room.id}>
                    <button
                      type="button"
                      onClick={() => handleJumpToRoom(room.id)}
                      className="text-slate-400 hover:text-white transition-colors text-left"
                    >
                      {room.name} 청소 가이드
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Zone Column 2: Quick Navigation */}
            <div className="md:col-span-3">
              <h3 className="text-sm font-semibold text-white mb-4">주요 메뉴</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="#room-guides" className="text-slate-400 hover:text-white transition-colors">
                    장소별 안내
                  </a>
                </li>
                <li>
                  <a
                    href="#cleaning-flowchart"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    청소 순서도
                  </a>
                </li>
                <li>
                  <a
                    href="#detergent-guide"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    세제·안전수칙
                  </a>
                </li>
                <li>
                  <a
                    href="#housework-quiz"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    살림 마스터 퀴즈
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
            <p>© 2026 살림의 정석. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-2">
              <span>제작: 최주빈</span>
              <span aria-hidden="true">·</span>
              <a href="mailto:com8692@naver.com" className="hover:text-slate-200 transition-colors">
                com8692@naver.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
