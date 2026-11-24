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
      <section className="relative bg-[#151B19] text-[#F5F0E7]">
        <div className="relative min-h-[460px] lg:min-h-[540px] flex items-end">
          <ResilientImage
            src={destination.heroImageUrl}
            alt={destination.heroImageAlt}
            fallbackTitle={destination.name}
            priority
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#151B19] via-[#151B19]/55 to-[#151B19]/30"
          />

          <div className="relative z-10 max-w-7xl mx-auto w-full px-5 sm:px-8 pt-10 pb-12 sm:pb-16">
            <button
              type="button"
              onClick={onBackToIntro}
              className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#F5F0E7]/85 hover:text-[#FFFFFF] mb-8 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D68A45]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to MyTravWay Overview</span>
            </button>

            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#C9B99D] mb-3">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D68A45]" />
                  {destination.regionLine}
                </span>
              </div>

              <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#FFFFFF] mb-4">
                {destination.name}
              </h1>

              <p className="text-base sm:text-lg text-[#F5F0E7]/90 leading-relaxed max-w-2xl">
                {destination.intro}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Structured Information Bar */}
      <section aria-label="Destination facts" className="bg-[#FFFFFF] border-b border-[#C9B99D]/50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {destination.facts.map((fact) => (
            <div key={fact.id} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-[#151B19]/60">{fact.label}</span>
                <span
                  className={`text-[11px] font-medium ${
                    fact.sourceType === 'verified' ? 'text-[#183C32]' : 'text-[#151B19]/55'
                  }`}
                >
                  {fact.sourceType === 'verified' ? 'Verified' : 'Sample'}
                </span>
              </div>
              <p className="font-editorial text-2xl font-normal text-[#151B19] tabular-nums">
                {fact.value}
              </p>
              <p className="text-xs text-[#151B19]/65">{fact.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BEFORE YOU GO — Optional 360° Launch Section */}
      <section
        id="before-you-go"
        className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-4 scroll-mt-20"
      >
        <div
          className={`rounded-2xl border text-[#F5F0E7] p-7 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center ${
            experience.themeId === 'midnight-coastal'
              ? 'bg-[#0B1424] border-[#E5D3B3]/25'
              : 'bg-[#183C32] border-[#C9B99D]/25'
          }`}
        >
          <div className="lg:col-span-7 space-y-3.5">
            <p className="text-xs font-medium tracking-wide text-[#E5D3B3]">
              Before You Go · Optional 360° Preview · {experience.hotspots.length} Viewpoints
            </p>
            <h2 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-[#FFFFFF]">
              {destination.beforeYouGoHeadline}
            </h2>
            <p className="text-sm sm:text-base text-[#F5F0E7]/85 leading-relaxed max-w-2xl">
              {destination.beforeYouGoDescription}
            </p>
            <p className="text-xs text-[#C9B99D]/90 leading-relaxed pt-1">
              {destination.beforeYouGoNote}
            </p>
          </div>

          <div className="lg:col-span-5 flex flex-col items-start lg:items-end justify-center gap-3">
            <button
              type="button"
              onClick={onOpen360Viewer}
              onMouseEnter={onPrefetch360Viewer}
              onFocus={onPrefetch360Viewer}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg bg-[#D68A45] text-[#151B19] text-sm font-semibold whitespace-nowrap shrink-0 hover:bg-[#e19652] transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5F0E7]"
            >
              <Compass className="w-4 h-4" />
              <span>{destination.exploreCtaLabel}</span>
            </button>
            <span className="text-xs text-[#F5F0E7]/70 lg:text-right">
              {destination.beforeYouGoHint}
            </span>
          </div>
        </div>
      </section>

      {/* Normal Accessible Destination Details */}
      <section
        id="trip-details"
        className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start"
      >
        {/* Left Narrative & Sample Stages */}
        <div className="lg:col-span-7 space-y-12">
          <div>
            <p className="text-xs font-medium text-[#183C32] mb-2">
              {destination.overviewKicker}
            </p>
            <h2 className="font-editorial text-2xl sm:text-3xl font-normal text-[#151B19] mb-5">
              {destination.overviewHeading}
            </h2>
            <div className="space-y-4 text-[15px] sm:text-base text-[#151B19]/80 leading-relaxed max-w-prose">
              {destination.overviewParagraphs.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-[#C9B99D]/50">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
              <h2 className="font-editorial text-2xl sm:text-3xl font-normal text-[#151B19]">
                {destination.stagesHeading}
              </h2>
              <span className="text-xs text-[#151B19]/60">{destination.stagesSubtitle}</span>
            </div>

            <div className="divide-y divide-[#C9B99D]/45 border-y border-[#C9B99D]/45">
              {destination.sampleRouteStages.map((stage) => (
                <div key={stage.stageNumber} className="py-6 grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-2 font-mono text-sm text-[#183C32] tabular-nums">
                    {stage.stageNumber}
                  </div>
                  <div className="sm:col-span-10 space-y-1.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-editorial text-xl text-[#151B19]">{stage.title}</h3>
                      <span className="text-xs text-[#151B19]/60">{stage.elevationNote}</span>
                    </div>
                    <p className="text-sm text-[#151B19]/75 leading-relaxed">{stage.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Atmosphere Context & Sample Notes */}
        <aside className="lg:col-span-5 space-y-8">
          <div className="rounded-2xl overflow-hidden bg-[#FFFFFF] border border-[#C9B99D]/45">
            <div className="aspect-[4/3]">
              <ResilientImage
                src={destination.sidebarImageUrl}
                alt={destination.sidebarImageAlt}
                fallbackTitle={destination.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 space-y-2">
              <p className="text-xs text-[#183C32] font-medium">
                {destination.sidebarCaptionTitle}
              </p>
              <p className="text-sm text-[#151B19]/75 leading-relaxed">
                {destination.sidebarCaptionText}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#FFFFFF] border border-[#C9B99D]/45 p-7 space-y-5">
            <div className="flex items-center gap-2.5">
              <Mountain className="w-4 h-4 text-[#183C32]" />
              <h3 className="font-editorial text-xl text-[#151B19]">
                {destination.notesHeading}
              </h3>
            </div>
            <ul className="space-y-3 text-sm text-[#151B19]/80 leading-relaxed">
              {destination.samplePreparationNotes.map((note, idx) => (
                <li
                  key={idx}
                  className={
                    idx === destination.samplePreparationNotes.length - 1
                      ? 'pt-3 border-t border-[#C9B99D]/40 text-xs text-[#151B19]/60'
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
        <section
          id="camp-moments"
          className="border-t border-[#C9B99D]/45 bg-[#FFFFFF]"
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-[#C9B99D]/45">
              <div className="max-w-2xl">
                <p className="text-xs font-medium tracking-wide text-[#1E4D54] mb-2">
                  Optional Visual Storytelling · Environmental Mood Only
                </p>
                <h2 className="font-editorial text-2xl sm:text-3xl font-normal text-[#151B19] mb-2">
                  {destination.storySectionTitle}
                </h2>
                <p className="text-sm text-[#151B19]/75">
                  {destination.storySectionSubtitle}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowStories((prev) => !prev)}
                aria-expanded={showStories}
                className="self-start md:self-auto px-4 py-2 rounded-lg border border-[#C9B99D] text-xs font-medium text-[#151B19] whitespace-nowrap shrink-0 hover:bg-[#F5F0E7] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D68A45]"
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
                      className="rounded-xl border border-[#C9B99D]/45 bg-[#F5F0E7]/45 overflow-hidden flex flex-col"
                    >
                      <div className="aspect-[4/3] bg-[#151B19]">
                        <ResilientImage
                          src={moment.imageUrl}
                          alt={moment.imageAlt}
                          fallbackTitle={moment.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-5 flex-1 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-[11px] text-[#183C32] font-medium">
                          <span className="font-mono tabular-nums">{moment.indexLabel}</span>
                          <span aria-hidden="true">·</span>
                          <span>{moment.momentType}</span>
                        </div>
                        <h3 className="font-editorial text-lg text-[#151B19] leading-snug">
                          {moment.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#151B19]/75 leading-relaxed">
                          {moment.caption}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>

                {destination.storyDisclosure && (
                  <p className="mt-6 text-xs text-[#151B19]/65 leading-relaxed max-w-3xl">
                    {destination.storyDisclosure}
                  </p>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* Cross-Destination Switch Strip */}
      <section className="border-t border-[#C9B99D]/45 bg-[#F5F0E7]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#183C32]">Explore Other Prototype</p>
            <p className="font-editorial text-xl text-[#151B19] mt-0.5">
              {alternateDestination.name} · {alternateDestination.categoryLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSwitchDestination(alternateDestination.id)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#183C32] text-sm font-medium text-[#183C32] whitespace-nowrap shrink-0 hover:bg-[#183C32] hover:text-[#F5F0E7] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D68A45]"
          >
            <span>Open {alternateDestination.shortName}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </main>
  );
}
