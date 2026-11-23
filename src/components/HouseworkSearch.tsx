import { FormEvent, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Loader2,
  Search,
  Wrench,
  X,
} from 'lucide-react';
import { ROOM_GUIDES, RoomId } from '../data/houseworkData';

interface AskAnswer {
  title: string;
  summary: string;
  steps: string[];
  recommendedTools: string[];
  caution: string;
  relatedRoomId: RoomId | 'general';
}

interface HouseworkSearchProps {
  onJumpToRoom: (roomId: RoomId) => void;
}

const SAMPLE_QUERIES = [
  '에어컨 필터 청소하는 방법',
  '흰 옷 김치 국물 얼룩 지우기',
  '싱크대 배수구 냄새 없애기',
  '욕실 거울 하얀 물때 제거법',
];

export default function HouseworkSearch({ onJumpToRoom }: HouseworkSearchProps) {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [answer, setAnswer] = useState<AskAnswer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const matchedLocalGuides = useMemo(() => {
    const keyword = (submittedQuery || query).trim().toLowerCase();
    if (keyword.length < 2) return [];

    const tokens = keyword.split(/\s+/).filter((t) => t.length >= 2);
    if (tokens.length === 0) return [];

    return ROOM_GUIDES.map((room) => {
      const searchableText = [
        room.name,
        room.subtitle,
        room.summary,
        room.corePrinciple,
        ...room.steps.map((s) => `${s.title} ${s.description} ${s.keyTip}`),
        ...room.tips.map((t) => `${t.title} ${t.detail}`),
      ]
        .join(' ')
        .toLowerCase();

      const score = tokens.reduce((acc, token) => acc + (searchableText.includes(token) ? 1 : 0), 0);
      return { room, score };
    })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.room);
  }, [query, submittedQuery]);

  const fetchExplanation = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed) return;

    setSubmittedQuery(trimmed);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || '설명을 불러오지 못했습니다. 다시 시도해 주세요.');
      }

      if (!data?.answer) {
        throw new Error('답변 형식이 올바르지 않습니다. 다시 시도해 주세요.');
      }

      setAnswer(data.answer as AskAnswer);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : '네트워크 오류가 발생했습니다. 다시 시도해 주세요.';
      setErrorMessage(message);
      setAnswer(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void fetchExplanation(query);
  };

  const handleSampleClick = (sample: string) => {
    setQuery(sample);
    void fetchExplanation(sample);
  };

  const handleClear = () => {
    setQuery('');
    setSubmittedQuery('');
    setAnswer(null);
    setErrorMessage(null);
  };

  const relatedRoom =
    answer && answer.relatedRoomId !== 'general'
      ? ROOM_GUIDES.find((r) => r.id === answer.relatedRoomId)
      : undefined;

  return (
    <section id="housework-search" className="py-12 md:py-16 border-t border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
          {/* Header */}
          <div className="max-w-2xl mb-6">
            <p className="text-sm font-medium text-teal-700 mb-1.5">집안일 검색 &amp; 맞춤 설명</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              궁금한 집안일을 물어보면 바로 설명해 드려요
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
              얼룩 제거, 가전제품 청소, 세탁법, 정리 순서 등 궁금한 내용을 입력하면 단계별 방법과
              주의할 이유까지 알려드립니다.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                maxLength={300}
                placeholder="예: 에어컨 필터 청소법, 흰 옷 김치 얼룩 지우기, 화장실 물때 제거..."
                aria-label="집안일 검색 질문 입력"
                className="w-full h-12 pl-11 pr-10 rounded-xl border border-slate-300 bg-white text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
              />
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="검색어 지우기"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="h-12 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm sm:text-base font-medium transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>설명 찾는 중</span>
                </>
              ) : (
                <>
                  <span>설명 보기</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Sample Questions */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 mr-1">자주 묻는 질문:</span>
            {SAMPLE_QUERIES.map((sample) => (
              <button
                key={sample}
                type="button"
                disabled={isLoading}
                onClick={() => handleSampleClick(sample)}
                className="px-3 py-1.5 text-xs sm:text-sm text-slate-700 bg-white border border-slate-200 hover:border-teal-600 hover:text-teal-800 rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
              >
                {sample}
              </button>
            ))}
          </div>

          {/* Local Matched Guides Strip (Instant Match) */}
          {matchedLocalGuides.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm">
              <span className="font-semibold text-slate-700 inline-flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-teal-700" />
                관련 공간 가이드:
              </span>
              {matchedLocalGuides.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => onJumpToRoom(room.id)}
                  className="text-teal-700 hover:text-teal-900 font-medium hover:underline underline-offset-4 whitespace-nowrap shrink-0"
                >
                  {room.name} 청소 가이드 바로가기 →
                </button>
              ))}
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
              <div className="flex items-center gap-2.5 text-sm font-medium text-teal-800">
                <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                <span>&ldquo;{submittedQuery}&rdquo;에 대한 순서와 주의사항을 정리하고 있습니다...</span>
              </div>
              <div className="space-y-2.5 animate-pulse">
                <div className="h-5 bg-slate-100 rounded w-1/3" />
                <div className="h-4 bg-slate-100 rounded w-full" />
                <div className="h-4 bg-slate-100 rounded w-5/6" />
              </div>
            </div>
          )}

          {/* Error Display */}
          {!isLoading && errorMessage && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/70 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-950">설명을 불러오지 못했습니다</p>
                  <p className="text-sm text-red-900 mt-0.5">{errorMessage}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void fetchExplanation(submittedQuery || query)}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-red-900 bg-white border border-red-200 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                다시 시도
              </button>
            </div>
          )}

          {/* Structured Explanation Result */}
          {!isLoading && !errorMessage && answer && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
                    <span>검색 질문: {submittedQuery}</span>
                    {relatedRoom && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>관련 공간: {relatedRoom.name}</span>
                      </>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{answer.title}</h3>
                  <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
                    {answer.summary}
                  </p>
                </div>

                {relatedRoom && (
                  <button
                    type="button"
                    onClick={() => onJumpToRoom(relatedRoom.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    <BookOpen className="w-4 h-4" />
                    {relatedRoom.name} 순서도 보기
                  </button>
                )}
              </div>

              {/* Step-by-Step Guide */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-700" />
                  단계별 실행 순서
                </h4>
                <ol className="space-y-3">
                  {answer.steps.map((step, idx) => (
                    <li
                      key={`${idx}-${step.slice(0, 12)}`}
                      className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/70"
                    >
                      <span className="w-7 h-7 rounded-lg bg-teal-600 text-white font-mono-num text-xs font-semibold flex items-center justify-center shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <p className="text-sm sm:text-base text-slate-800 leading-relaxed pt-0.5">
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Tools & Caution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-teal-700" />
                    필요한 준비물 &amp; 세제
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {answer.recommendedTools.length > 0
                      ? answer.recommendedTools.join(' · ')
                      : '기본 청소 도구 및 마른 극세사 천'}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/60">
                  <h4 className="text-sm font-bold text-amber-950 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    주의사항 및 피해야 할 이유
                  </h4>
                  <p className="text-sm text-amber-950 leading-relaxed">{answer.caution}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
