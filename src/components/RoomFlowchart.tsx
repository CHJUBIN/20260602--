import { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { RoomGuide, RoomId } from '../data/houseworkData';

interface RoomFlowchartProps {
  rooms: RoomGuide[];
  selectedRoomId: RoomId;
  onSelectRoom: (id: RoomId) => void;
}

export default function RoomFlowchart({
  rooms,
  selectedRoomId,
  onSelectRoom,
}: RoomFlowchartProps) {
  const [activeStepIndexByRoom, setActiveStepIndexByRoom] = useState<Record<RoomId, number>>({
    bathroom: 0,
    kitchen: 0,
    living: 0,
    bedroom: 0,
    entryway: 0,
  });

  const [completedStepsByRoom, setCompletedStepsByRoom] = useState<Record<RoomId, number[]>>({
    bathroom: [],
    kitchen: [],
    living: [],
    bedroom: [],
    entryway: [],
  });

  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const currentRoom = rooms.find((r) => r.id === selectedRoomId) ?? rooms[0];
  const activeStepIdx = activeStepIndexByRoom[currentRoom.id] ?? 0;
  const activeStep = currentRoom.steps[activeStepIdx] ?? currentRoom.steps[0];
  const completedSteps = completedStepsByRoom[currentRoom.id] ?? [];
  const completionRate = Math.round((completedSteps.length / currentRoom.steps.length) * 100);

  const setActiveStep = (idx: number) => {
    setActiveStepIndexByRoom((prev) => ({
      ...prev,
      [currentRoom.id]: idx,
    }));
  };

  const toggleStepComplete = (stepNumber: number) => {
    setCompletedStepsByRoom((prev) => {
      const current = prev[currentRoom.id] ?? [];
      const exists = current.includes(stepNumber);
      return {
        ...prev,
        [currentRoom.id]: exists
          ? current.filter((n) => n !== stepNumber)
          : [...current, stepNumber],
      };
    });
  };

  const resetRoomProgress = () => {
    setCompletedStepsByRoom((prev) => ({
      ...prev,
      [currentRoom.id]: [],
    }));
    setActiveStep(0);
  };

  const handleCompleteAndNext = () => {
    if (!completedSteps.includes(activeStep.stepNumber)) {
      toggleStepComplete(activeStep.stepNumber);
    }
    if (activeStepIdx < currentRoom.steps.length - 1) {
      setActiveStep(activeStepIdx + 1);
    }
  };

  const hasValidImage = Boolean(currentRoom.imagePath) && !imgErrors[currentRoom.id];

  return (
    <section id="room-guides" className="py-16 md:py-20 border-t border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-teal-700 mb-2">장소별 맞춤형 루틴</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              공간별 집안일 가이드 &amp; 청소 순서도
            </h2>
            <p className="mt-2 text-base text-slate-600 leading-relaxed">
              청소할 장소를 선택하면 가장 효율적인 동선과 단계별 순서, 필요한 준비물을 확인할 수 있습니다.
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-500 font-mono-num shrink-0">
            <span>진행률 {completionRate}%</span>
            <span aria-hidden="true">·</span>
            <span>
              {completedSteps.length} / {currentRoom.steps.length} 단계 완료
            </span>
          </div>
        </div>

        {/* Interactive Room Selector Tabs */}
        <div
          role="tablist"
          aria-label="청소 장소 선택"
          className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl mb-8 w-full md:w-fit"
        >
          {rooms.map((room) => {
            const isSelected = room.id === currentRoom.id;
            const roomDone = (completedStepsByRoom[room.id] ?? []).length;
            return (
              <button
                key={room.id}
                role="tab"
                aria-selected={isSelected}
                onClick={() => onSelectRoom(room.id)}
                className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span>{room.name}</span>
                {roomDone === room.steps.length && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-label="모두 완료됨" />
                )}
              </button>
            );
          })}
        </div>

        {/* Room Overview Strip + Two-Zone Interactive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Zone: Visual Room Overview & Interactive Flowchart (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Room Image & Core Summary */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
              <div className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden">
                {hasValidImage ? (
                  <img
                    src={currentRoom.imagePath}
                    alt={currentRoom.imageAlt}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setImgErrors((prev) => ({
                        ...prev,
                        [currentRoom.id]: true,
                      }))
                    }
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-100 via-teal-50/50 to-slate-200 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-3 text-teal-700">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <p className="text-lg font-bold text-slate-900">{currentRoom.name} 동선 플로우</p>
                    <p className="text-sm text-slate-600 mt-1 max-w-md">{currentRoom.corePrinciple}</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 text-white">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-200 mb-1.5">
                    <span>{currentRoom.recommendedFrequency}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-num">총 약 {currentRoom.totalMinutes}분</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold">{currentRoom.name} 청소 가이드</h3>
                  <p className="text-sm text-slate-200 mt-1">{currentRoom.subtitle}</p>
                </div>
              </div>

              <div className="p-5 sm:p-6 bg-white border-t border-slate-200 space-y-4">
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed">{currentRoom.summary}</p>
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                  <div>
                    <span className="font-semibold text-slate-900">핵심 원칙: </span>
                    <span className="text-slate-600">{currentRoom.corePrinciple}</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-slate-600">
                  <span className="font-semibold text-slate-900 inline-flex items-center gap-1.5 mr-1">
                    <Wrench className="w-3.5 h-3.5 text-teal-700" />
                    필수 준비물:
                  </span>
                  {currentRoom.essentialTools.map((tool, index) => (
                    <span key={tool} className="inline-flex items-center gap-2">
                      <span>{tool}</span>
                      {index < currentRoom.essentialTools.length - 1 && (
                        <span className="text-slate-300" aria-hidden="true">
                          ·
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive Step-by-Step Sequence Flowchart */}
            <div id="cleaning-flowchart" className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900">
                    {currentRoom.name} 청소 순서도 (단계를 눌러 확인하세요)
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    위에서 아래로, 안쪽에서 바깥쪽으로 진행하는 최적 순서입니다.
                  </p>
                </div>
                {completedSteps.length > 0 && (
                  <button
                    type="button"
                    onClick={resetRoomProgress}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    진행 초기화
                  </button>
                )}
              </div>

              {/* Flowchart Progress Bar */}
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-5">
                <div
                  className="h-full bg-teal-600 transition-all duration-300"
                  style={{ width: `${completionRate}%` }}
                />
              </div>

              {/* Connected Step Nodes */}
              <div className="space-y-2.5">
                {currentRoom.steps.map((step, idx) => {
                  const isActive = idx === activeStepIdx;
                  const isDone = completedSteps.includes(step.stepNumber);
                  return (
                    <div key={step.stepNumber} className="flex items-stretch gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveStep(idx)}
                        className={`flex-1 text-left p-3.5 sm:p-4 rounded-xl border transition-colors duration-150 flex items-center justify-between gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 ${
                          isActive
                            ? 'bg-white border-teal-600 ring-1 ring-teal-600'
                            : isDone
                              ? 'bg-emerald-50/50 border-emerald-200 hover:bg-white'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span
                            className={`w-8 h-8 rounded-lg font-mono-num text-sm font-semibold flex items-center justify-center shrink-0 ${
                              isDone
                                ? 'bg-emerald-600 text-white'
                                : isActive
                                  ? 'bg-teal-600 text-white'
                                  : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {isDone ? <Check className="w-4 h-4" /> : `0${step.stepNumber}`}
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                              <span>{step.zone}</span>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono-num">약 {step.durationMinutes}분</span>
                              {isDone && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="text-emerald-700 font-medium">완료</span>
                                </>
                              )}
                            </div>
                            <p className="text-sm sm:text-base font-semibold text-slate-900 truncate mt-0.5">
                              {step.title}
                            </p>
                          </div>
                        </div>

                        <ArrowRight
                          className={`w-4 h-4 shrink-0 transition-transform ${
                            isActive ? 'text-teal-700 translate-x-0.5' : 'text-slate-400'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Zone: Active Step Detail & Room Tips Deck (5 cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            {/* Active Step Instructional Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-2">
                <span className="font-mono-num font-semibold text-teal-700">
                  STEP {activeStep.stepNumber} / {currentRoom.steps.length}
                </span>
                <span className="inline-flex items-center gap-1 font-mono-num">
                  <Clock className="w-3.5 h-3.5" />
                  약 {activeStep.durationMinutes}분 소요
                </span>
              </div>

              <h4 className="text-xl font-bold text-slate-900">{activeStep.title}</h4>
              <p className="text-xs text-slate-500 mt-1">작업 구역: {activeStep.zone}</p>

              <p className="mt-4 text-sm sm:text-base text-slate-700 leading-relaxed">
                {activeStep.description}
              </p>

              {/* Tools for this step */}
              <div className="mt-4 pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-600">
                <span className="font-semibold text-slate-900">이 단계 도구: </span>
                <span>{activeStep.tools.join(' · ')}</span>
              </div>

              {/* Step Key Tip Box (clean hairline border, no thick left bar) */}
              <div className="mt-4 p-4 rounded-xl bg-teal-50/70 border border-teal-200/80">
                <div className="flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <div className="text-sm text-teal-950 leading-relaxed">
                    <span className="font-semibold block text-teal-900 mb-0.5">핵심 포인트</span>
                    {activeStep.keyTip}
                  </div>
                </div>
              </div>

              {/* Step Navigation & Completion Controls */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={activeStepIdx === 0}
                    onClick={() => setActiveStep(activeStepIdx - 1)}
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    이전
                  </button>
                  <button
                    type="button"
                    disabled={activeStepIdx === currentRoom.steps.length - 1}
                    onClick={() => setActiveStep(activeStepIdx + 1)}
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
                  >
                    다음
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={
                    activeStepIdx < currentRoom.steps.length - 1
                      ? handleCompleteAndNext
                      : () => toggleStepComplete(activeStep.stepNumber)
                  }
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    completedSteps.includes(activeStep.stepNumber) &&
                    activeStepIdx === currentRoom.steps.length - 1
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  {activeStepIdx < currentRoom.steps.length - 1
                    ? '완료하고 다음 단계'
                    : completedSteps.includes(activeStep.stepNumber)
                      ? '완료됨 (취소)'
                      : '마지막 단계 완료'}
                </button>
              </div>
            </div>

            {/* Room Practical Tips & Precautions */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
              <h4 className="text-base font-bold text-slate-900 mb-4">
                {currentRoom.name} 실전 꿀팁 &amp; 주의사항
              </h4>
              <div className="space-y-4">
                {currentRoom.tips.map((tip) => {
                  const isWarning = tip.category === '주의사항';
                  return (
                    <div
                      key={tip.title}
                      className={`p-4 rounded-xl border bg-white ${
                        isWarning ? 'border-amber-300' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold mb-1">
                        {isWarning ? (
                          <span className="inline-flex items-center gap-1 text-amber-700">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            주의사항
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-teal-700">
                            <Lightbulb className="w-3.5 h-3.5" />
                            {tip.category}
                          </span>
                        )}
                      </div>
                      <h5 className="text-sm font-bold text-slate-900">{tip.title}</h5>
                      <p className="text-sm text-slate-600 leading-relaxed mt-1">{tip.detail}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
