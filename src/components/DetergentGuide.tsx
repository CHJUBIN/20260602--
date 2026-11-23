import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Droplets, ShieldAlert } from 'lucide-react';
import { DETERGENTS } from '../data/houseworkData';

interface StainPreset {
  id: string;
  label: string;
  detergentId: string;
  reason: string;
}

const STAIN_PRESETS: StainPreset[] = [
  {
    id: 'water-scale',
    label: '욕실 거울·수전 하얀 물때',
    detergentId: 'citric-acid',
    reason: '알칼리성 석회·비누 찌꺼기는 산성인 구연산수로 중화해야 얼룩 없이 지워집니다.',
  },
  {
    id: 'grease',
    label: '가스레인지·후드 기름때',
    detergentId: 'baking-soda',
    reason: '산화된 기름때는 약알칼리성 베이킹소다와 따뜻한 물로 불려 분해하는 것이 가장 좋습니다.',
  },
  {
    id: 'laundry-tub',
    label: '세탁조 곰팡이·흰 빨래 삶기',
    detergentId: 'sodium-percarbonate',
    reason: '40~60도 온수에 과탄산소다를 녹이면 산소 기포가 찌든 때와 냄새를 강력히 분해합니다.',
  },
  {
    id: 'silicone-mold',
    label: '화장실 실리콘 검은 곰팡이',
    detergentId: 'bleach',
    reason: '깊이 박힌 곰팡이는 찬물에 희석한 락스를 휴지에 적셔 1~2시간 덮어두는 것이 확실합니다.',
  },
];

export default function DetergentGuide() {
  const [selectedStainId, setSelectedStainId] = useState<string>(STAIN_PRESETS[0].id);
  const activePreset = STAIN_PRESETS.find((s) => s.id === selectedStainId) ?? STAIN_PRESETS[0];

  return (
    <section id="detergent-guide" className="py-16 md:py-20 border-t border-slate-200 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-8">
          <p className="text-sm font-medium text-teal-700 mb-2">세제 활용 &amp; 안전 원칙</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            오염별 천연 세제 조합 &amp; 절대 금지 수칙
          </h2>
          <p className="mt-2 text-base text-slate-600 leading-relaxed">
            세제는 성질(산성·알칼리성)에 맞춰 써야 효과가 2배가 됩니다. 지금 지우고 싶은 오염을 선택해 보세요.
          </p>
        </div>

        {/* Interactive Stain Matcher */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-900 shrink-0">
              상황별 추천 세제 찾기
            </span>
            <div className="flex flex-wrap gap-2">
              {STAIN_PRESETS.map((preset) => {
                const isSelected = preset.id === selectedStainId;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedStainId(preset.id)}
                    className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm sm:text-base font-semibold text-slate-900">
                추천 세제:{' '}
                <span className="text-teal-700">
                  {DETERGENTS.find((d) => d.id === activePreset.detergentId)?.name}
                </span>
              </p>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">{activePreset.reason}</p>
            </div>
          </div>
        </div>

        {/* 4 Detergent Reference Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {DETERGENTS.map((item) => {
            const isHighlighted = item.id === activePreset.detergentId;
            return (
              <article
                key={item.id}
                className={`rounded-2xl border bg-white p-6 transition-colors ${
                  isHighlighted ? 'border-teal-600 ring-1 ring-teal-600' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <span>{item.chemicalNature}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.waterTemp}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                  </div>
                  {isHighlighted && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 shrink-0">
                      <Droplets className="w-4 h-4" />
                      현재 추천
                    </span>
                  )}
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold text-slate-900 mb-1">추천 용도</p>
                    <p className="text-slate-600">{item.bestFor.join(' · ')}</p>
                  </div>

                  <div>
                    <p className="font-semibold text-slate-900 mb-1">올바른 사용법</p>
                    <p className="text-slate-600 leading-relaxed">{item.howToUse}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-start gap-2 text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm leading-relaxed">
                      <span className="font-semibold">주의: </span>
                      {item.caution}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Critical Mixing Safety Notice (Clean Hairline Border, Explicit Text Label) */}
        <div className="rounded-2xl border border-red-200 bg-red-50/60 p-5 sm:p-6">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-red-950">
                절대 섞어 쓰면 안 되는 위험 조합 (안전 경고)
              </h3>
              <p className="text-sm text-red-900 leading-relaxed mt-1">
                <strong>락스(염소계) + 식초·구연산(산성)</strong> 또는 <strong>락스 + 뜨거운 물</strong>을
                함께 사용하면 치명적인 염소가스가 발생해 호흡기에 심각한 손상을 줄 수 있습니다. 세제는 한
                번에 한 종류만 사용하고, 다른 세제를 써야 할 때는 물로 완전히 헹구고 환기한 뒤 사용하세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
