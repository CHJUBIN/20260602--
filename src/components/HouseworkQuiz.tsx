import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  PartyPopper,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { QUIZ_QUESTIONS, RoomId } from '../data/houseworkData';

interface HouseworkQuizProps {
  onJumpToRoom: (roomId: RoomId) => void;
}

const CONFETTI_PIECES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${5 + ((i * 5.2) % 90)}%`,
  delay: (i % 6) * 0.12,
  duration: 2.2 + (i % 4) * 0.35,
  color:
    i % 4 === 0
      ? 'bg-teal-500'
      : i % 4 === 1
        ? 'bg-amber-400'
        : i % 4 === 2
          ? 'bg-emerald-500'
          : 'bg-sky-500',
}));

export default function HouseworkQuiz({ onJumpToRoom }: HouseworkQuizProps) {
  const prefersReducedMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[currentIndex];
  const selectedOption = selectedAnswers[currentQuestion.id];
  const hasAnsweredCurrent = selectedOption !== undefined;
  const isCurrentCorrect = selectedOption === currentQuestion.correctIndex;

  const totalQuestions = QUIZ_QUESTIONS.length;
  const correctCount = QUIZ_QUESTIONS.reduce((acc, q) => {
    return acc + (selectedAnswers[q.id] === q.correctIndex ? 1 : 0);
  }, 0);
  const score = Math.round((correctCount / totalQuestions) * 100);
  const isPassed = score >= 80;

  const handleSelectOption = (optionIndex: number) => {
    if (hasAnsweredCurrent) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setShowResult(false);
  };

  return (
    <section id="housework-quiz" className="py-16 md:py-24 border-t border-slate-200 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-sm font-medium text-teal-700 mb-2">실력 점검 테스트</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            집안일 마스터 퀴즈
          </h2>
          <p className="mt-2 text-base text-slate-600">
            총 {totalQuestions}문제를 풀고 80점 이상을 달성하면 살림 마스터 축하 인증을 받을 수 있습니다.
          </p>
        </div>

        {!showResult ? (
          /* Active Quiz Card */
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-8">
            {/* Top Progress Metadata */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-slate-500 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono-num font-semibold text-slate-900">
                  문제 {String(currentIndex + 1).padStart(2, '0')} / {totalQuestions}
                </span>
                <span aria-hidden="true">·</span>
                <span>{currentQuestion.roomTag}</span>
              </div>
              <span className="font-mono-num">
                현재 맞힌 문제: {correctCount}개 ({correctCount * 10}점)
              </span>
            </div>

            {/* Linear Progress Bar */}
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-teal-600 transition-all duration-300"
                style={{
                  width: `${((currentIndex + (hasAnsweredCurrent ? 1 : 0)) / totalQuestions) * 100}%`,
                }}
              />
            </div>

            {/* Question Prompt */}
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug mb-6">
              Q{currentIndex + 1}. {currentQuestion.question}
            </h3>

            {/* 4 Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrectOption = idx === currentQuestion.correctIndex;

                let optionStyle =
                  'bg-white border-slate-200 text-slate-800 hover:border-teal-500 hover:bg-teal-50/40';
                if (hasAnsweredCurrent) {
                  if (isCorrectOption) {
                    optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-medium';
                  } else if (isSelected && !isCorrectOption) {
                    optionStyle = 'bg-red-50 border-red-400 text-red-950';
                  } else {
                    optionStyle = 'bg-white/70 border-slate-200 text-slate-500';
                  }
                }

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={hasAnsweredCurrent}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left min-h-[52px] px-4 py-3.5 rounded-xl border transition-colors duration-150 flex items-center justify-between gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 ${optionStyle}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-mono-num text-sm font-semibold text-slate-500 mt-0.5 shrink-0">
                        {idx + 1}.
                      </span>
                      <span className="text-sm sm:text-base leading-relaxed">{option}</span>
                    </div>

                    {hasAnsweredCurrent && isCorrectOption && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                        정답
                      </span>
                    )}
                    {hasAnsweredCurrent && isSelected && !isCorrectOption && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 shrink-0">
                        <XCircle className="w-4 h-4" />
                        오답
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Next Button */}
            {hasAnsweredCurrent && (
              <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
                <div
                  className={`p-4 rounded-xl border ${
                    isCurrentCorrect
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                      : 'bg-amber-50/80 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-bold mb-1">
                    {isCurrentCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>정답입니다! (+10점)</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-700" />
                        <span>아쉽지만 오답입니다 (정답: {currentQuestion.correctIndex + 1}번)</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed">{currentQuestion.explanation}</p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>{currentIndex < totalQuestions - 1 ? '다음 문제' : '최종 결과 보기'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Quiz Result & >= 80 Celebration Screen */
          <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-10 overflow-hidden">
            {/* Confetti celebration for >= 80 */}
            {isPassed && !prefersReducedMotion && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                {CONFETTI_PIECES.map((piece) => (
                  <motion.span
                    key={piece.id}
                    initial={{ y: -20, opacity: 0, rotate: 0 }}
                    animate={{
                      y: [0, 260, 420],
                      opacity: [0, 1, 0],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: piece.duration,
                      delay: piece.delay,
                      repeat: 1,
                      ease: 'easeOut',
                    }}
                    style={{ left: piece.left }}
                    className={`absolute top-0 w-2.5 h-2.5 rounded-sm ${piece.color}`}
                  />
                ))}
              </div>
            )}

            <div className="relative z-10 text-center max-w-xl mx-auto">
              <div
                className={`w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center border ${
                  isPassed
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-amber-50 border-amber-200 text-amber-700'
                }`}
              >
                {isPassed ? <PartyPopper className="w-8 h-8" /> : <Award className="w-8 h-8" />}
              </div>

              <p className="font-mono-num text-sm font-semibold text-slate-600 mb-2">
                최종 점수 {score}점 / 100점 · 정답 {correctCount} / {totalQuestions}
              </p>

              {isPassed ? (
                <>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    축하합니다! 살림 마스터를 달성하셨어요!
                  </h3>
                  <p className="mt-3 text-base text-slate-600 leading-relaxed">
                    80점 이상을 기록하며 장소별 청소 순서와 안전한 세제 활용법을 완벽히 익히셨습니다.
                    오늘 배운 루틴으로 더욱 쾌적한 집을 가꾸어 보세요!
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    조금만 더 힘내세요! 80점까지 한 걸음 남았어요
                  </h3>
                  <p className="mt-3 text-base text-slate-600 leading-relaxed">
                    현재 점수는 <span className="font-semibold text-slate-900">{score}점</span>입니다.
                    80점을 넘기면 축하 인증을 받을 수 있어요. 아래 오답 노트를 확인하고 다시 도전해 보세요!
                  </p>
                </>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                  퀴즈 다시 풀기
                </button>
              </div>
            </div>

            {/* Answer Review Breakdown */}
            <div className="relative z-10 mt-10 pt-8 border-t border-slate-200">
              <h4 className="text-base font-bold text-slate-900 mb-4">문제별 정답 및 해설 확인</h4>
              <div className="space-y-3">
                {QUIZ_QUESTIONS.map((q, idx) => {
                  const userChoice = selectedAnswers[q.id];
                  const correct = userChoice === q.correctIndex;
                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border bg-white ${
                        correct ? 'border-slate-200' : 'border-amber-300'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-mono-num font-semibold text-slate-900">
                            Q{idx + 1}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{q.roomTag}</span>
                        </div>
                        {correct ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            정답 (+10점)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700">
                            <XCircle className="w-3.5 h-3.5" />
                            오답 (정답: {q.correctIndex + 1}번)
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{q.question}</p>
                      <p className="text-sm text-slate-600 mt-1 leading-relaxed">{q.explanation}</p>
                      {!correct && (
                        <button
                          type="button"
                          onClick={() => onJumpToRoom(q.relatedRoomId)}
                          className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          관련 장소 가이드 다시 보기
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
