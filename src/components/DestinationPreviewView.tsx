import { useState } from 'react';
import { ArrowLeft, ArrowRight, Compass, MapPin, Mountain } from 'lucide-react';
import type {
  DestinationDemoData,
  DestinationId,
  PanoramaExperienceConfig,
} from '../data/destinations';
import { ResilientImage } from './ResilientImage';

interface DestinationPreviewViewProps {
  destination: DestinationDemoData;
  experience: PanoramaExperienceConfig;
  alternateDestination: DestinationDemoData;
  onBackToIntro: () => void;
  onOpen360Viewer: () => void;
  onPrefetch360Viewer: () => void;
  onSwitchDestination: (destinationId: DestinationId) => void;
}

export function DestinationPreviewView({
  destination,
  experience,
  alternateDestination,
  onBackToIntro,
  onOpen360Viewer,
  onPrefetch360Viewer,
  onSwitchDestination,
}: DestinationPreviewViewProps) {
  const [showStories, setShowStories] = useState(true);

  return (
    <main>
      {/* Destination Hero */}
      <section className="relative bg-[#0B1D35] text-[#FFFFFF]">
        <div className="relative min-h-[480px] lg:min-h-[560px] flex items-end">
          <ResilientImage
            src={destination.heroImageUrl}
            alt={destination.heroImageAlt}
            fallbackTitle={destination.name}
            priority
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#0B1D35] via-[#0B1D35]/60 to-[#0B1D35]/25"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#0B1D35]/80 via-[#102B50]/25 to-transparent"
          />

          <div className="relative z-10 max-w-7xl mx-auto w-full px-5 sm:px-8 pt-12 pb-14 sm:pb-16">
            <button
              type="button"
              onClick={onBackToIntro}
              className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#EDF2F6] hover:text-[#16B8C1] mb-8 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#16B8C1]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to MyTravWay Overview</span>
            </button>

            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#DCEDEA] mb-3.5">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#F4C84A]" />
                  {destination.regionLine}
                </span>
                <span aria-hidden="true" className="text-[#94A3B8]">
                  ·
                </span>
                <span>{destination.categoryLabel}</span>
              </div>

              <h1 className="font-editorial text-[clamp(2.35rem,4.5vw,3.85rem)] font-normal tracking-tight leading-[1.08] text-[#FFFFFF] mb-4">
                {destination.name}
              </h1>

              <p className="text-base sm:text-lg text-[#EDF2F6] leading-relaxed max-w-2xl">
                {destination.intro}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Structured Information Bar */}
      <section aria-label="Destination facts" className="bg-[#FFFFFF] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-[#E5E7EB]">
          {destination.facts.map((fact, index) => (
            <div
              key={fact.id}
              className={`space-y-1.5 ${
                index > 0 ? 'lg:pl-8' : ''
              } ${index < destination.facts.length - 1 ? 'lg:pr-8' : ''}`}
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-medium text-[#64748B]">{fact.label}</span>
                <span
                  className={`font-semibold ${
                    fact.sourceType === 'verified' ? 'text-[#087F89]' : 'text-[#64748B]'
                  }`}
                >
                  {fact.sourceType === 'verified' ? 'Verified' : 'Sample'}
                </span>
              </div>
              <p className="font-editorial text-2xl font-normal text-[#102B50] tabular-nums">
                {fact.value}
              </p>
              <p className="text-xs text-[#475569] leading-relaxed">{fact.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BEFORE YOU GO — Optional 360° Launch Section */}
      <section
        id="before-you-go"
        className="max-w-7xl mx-auto px-5 sm:px-8 pt-14 sm:pt-18 pb-4 scroll-mt-20"
      >
        <div
          className={`rounded-2xl border text-[#FFFFFF] p-7 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center shadow-[0_10px_30px_rgba(16,43,80,0.06)] ${
            experience.themeId === 'midnight-coastal'
              ? 'bg-[#0B1D35] border-[#183B5B]'
              : 'bg-[#102B50] border-[#183B5B]'
          }`}
        >
          <div className="lg:col-span-7 space-y-3.5">
            <p className="text-xs font-medium tracking-wide text-[#16B8C1]">
              Before You Go · Optional 360° Preview · {experience.hotspots.length} Viewpoints
            </p>
            <h2 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-[#FFFFFF]">
              {destination.beforeYouGoHeadline}
            </h2>
            <p className="text-sm sm:text-base text-[#EDF2F6] leading-relaxed max-w-2xl">
              {destination.beforeYouGoDescription}
            </p>
            <p className="text-xs text-[#94A3B8] leading-relaxed pt-1">
              {destination.beforeYouGoNote}
            </p>
          </div>

          <div className="lg:col-span-5 flex flex-col items-start lg:items-end justify-center gap-3">
            <button
              type="button"
              onClick={onOpen360Viewer}
              onMouseEnter={onPrefetch360Viewer}
              onFocus={onPrefetch360Viewer}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg bg-[#F47724] text-[#0B1D35] text-sm font-semibold whitespace-nowrap shrink-0 hover:brightness-95 transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFFFFF]"
            >
              <Compass className="w-4 h-4" />
              <span>{destination.exploreCtaLabel}</span>
            </button>
            <span className="text-xs text-[#94A3B8] lg:text-right">
              {destination.beforeYouGoHint}
            </span>
          </div>
        </div>
      </section>

      {/* Normal Accessible Destination Details */}
      <section
        id="trip-details"
        className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start"
      >
        {/* Left Narrative & Sample Stages */}
        <div className="lg:col-span-7 space-y-14">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#087F89] mb-2.5">
              {destination.overviewKicker}
            </p>
            <h2 className="font-editorial text-2xl sm:text-3xl font-normal text-[#102B50] mb-5">
              {destination.overviewHeading}
            </h2>
            <div className="space-y-4 text-[15px] sm:text-base text-[#475569] leading-[1.75] max-w-prose">
              {destination.overviewParagraphs.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="pt-10 border-t border-[#E8E3D9]">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-7">
              <h2 className="font-editorial text-2xl sm:text-3xl font-normal text-[#102B50]">
                {destination.stagesHeading}
              </h2>
              <span className="text-xs text-[#64748B]">{destination.stagesSubtitle}</span>
            </div>

            <div className="divide-y divide-[#E8E3D9] border-y border-[#E8E3D9]">
              {destination.sampleRouteStages.map((stage) => (
                <div
                  key={stage.stageNumber}
                  className="py-6 sm:py-7 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-5"
                >
                  <div className="sm:col-span-2 font-mono text-xs font-medium text-[#087F89] tabular-nums pt-1">
                    {stage.stageNumber}
                  </div>
                  <div className="sm:col-span-10 space-y-1.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-editorial text-xl text-[#102B50]">{stage.title}</h3>
                      <span className="text-xs text-[#64748B]">{stage.elevationNote}</span>
                    </div>
                    <p className="text-sm text-[#475569] leading-relaxed">
                      {stage.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Atmosphere Context & Sample Notes */}
        <aside className="lg:col-span-5 space-y-8 lg:sticky lg:top-24">
          <div className="rounded-2xl overflow-hidden bg-[#FFFFFF] border border-[#E8E3D9] shadow-[0_10px_30px_rgba(16,43,80,0.06)]">
            <div className="aspect-[4/3] bg-[#0B1D35]">
              <ResilientImage
                src={destination.sidebarImageUrl}
                alt={destination.sidebarImageAlt}
                fallbackTitle={destination.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 sm:p-7 space-y-2">
              <p className="text-xs text-[#087F89] font-semibold">
                {destination.sidebarCaptionTitle}
              </p>
              <p className="text-sm text-[#475569] leading-relaxed">
                {destination.sidebarCaptionText}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#FAF8F2] border border-[#E8E3D9] p-7 sm:p-8 space-y-5">
            <div className="flex items-center gap-2.5">
              <Mountain className="w-4 h-4 text-[#087F89]" />
              <h3 className="font-editorial text-xl text-[#102B50]">
                {destination.notesHeading}
              </h3>
            </div>
            <ul className="space-y-3.5 text-sm text-[#475569] leading-relaxed">
              {destination.samplePreparationNotes.map((note, idx) => (
                <li
                  key={idx}
                  className={
                    idx === destination.samplePreparationNotes.length - 1
                      ? 'pt-4 border-t border-[#E8E3D9] text-xs text-[#64748B]'
                      : ''
                  }
                >
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      {/* Optional Visual Storytelling Cards (Alibaug Midnight Escape, separate from 360° viewer) */}
      {destination.storyMoments && destination.storyMoments.length > 0 && (
        <section id="camp-moments" className="border-t border-[#E5E7EB] bg-[#EDF2F6]">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b border-[#C8E2DF]">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold tracking-wide text-[#087F89] mb-2">
                  Optional Visual Storytelling · Environmental Mood Only
                </p>
                <h2 className="font-editorial text-2xl sm:text-3xl font-normal text-[#102B50] mb-2">
                  {destination.storySectionTitle}
                </h2>
                <p className="text-sm text-[#475569]">{destination.storySectionSubtitle}</p>
              </div>

              <button
                type="button"
                onClick={() => setShowStories((prev) => !prev)}
                aria-expanded={showStories}
                className="self-start md:self-auto px-4 py-2 rounded-lg border border-[#C8E2DF] bg-[#FFFFFF] text-xs font-medium text-[#102B50] whitespace-nowrap shrink-0 hover:bg-[#DCEDEA] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#087F89]"
              >
                {showStories ? 'Hide Moments' : 'Show Moments'}
              </button>
            </div>

            {showStories && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                  {destination.storyMoments.map((moment) => (
                    <article
                      key={moment.id}
                      className="group rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_10px_30px_rgba(16,43,80,0.06)] hover:shadow-[0_18px_40px_rgba(16,43,80,0.12)] hover:border-[#C8E2DF] overflow-hidden flex flex-col transition-all duration-200"
                    >
                      <div className="aspect-[4/3] bg-[#0B1D35] overflow-hidden">
                        <ResilientImage
                          src={moment.imageUrl}
                          alt={moment.imageAlt}
                          fallbackTitle={moment.title}
                          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                        />
                      </div>
                      <div className="p-5 sm:p-6 flex-1 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-[11px] text-[#087F89] font-semibold">
                          <span className="font-mono tabular-nums">{moment.indexLabel}</span>
                          <span aria-hidden="true" className="text-[#94A3B8]">
                            ·
                          </span>
                          <span>{moment.momentType}</span>
                        </div>
                        <h3 className="font-editorial text-lg text-[#102B50] leading-snug">
                          {moment.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                          {moment.caption}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>

                {destination.storyDisclosure && (
                  <p className="mt-7 text-xs text-[#64748B] leading-relaxed max-w-3xl">
                    {destination.storyDisclosure}
                  </p>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* Cross-Destination Switch Strip */}
      <section className="border-t border-[#C8E2DF] bg-[#DCEDEA]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="hidden sm:block w-20 h-14 rounded-lg overflow-hidden bg-[#0B1D35] border border-[#C8E2DF] shrink-0">
              <ResilientImage
                src={alternateDestination.cardImageUrl}
                alt={alternateDestination.cardImageAlt}
                fallbackTitle={alternateDestination.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#087F89]">Continue Exploring</p>
              <p className="font-editorial text-xl sm:text-2xl text-[#102B50] mt-0.5">
                {alternateDestination.name} · {alternateDestination.categoryLabel}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSwitchDestination(alternateDestination.id)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#102B50] text-sm font-medium text-[#FFFFFF] whitespace-nowrap shrink-0 hover:bg-[#0B1D35] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#087F89]"
          >
            <span>Open {alternateDestination.shortName}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </main>
  );
}
