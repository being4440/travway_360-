import { ArrowRight, Compass, MapPin } from 'lucide-react';
import {
  DESTINATION_LIST,
  type DestinationId,
  LANDING_HERO_IMAGE,
} from '../data/destinations';
import { ResilientImage } from './ResilientImage';

interface IntroLandingViewProps {
  onExploreDestination: (destinationId: DestinationId) => void;
  onDirectLaunch360: (destinationId: DestinationId) => void;
}

export function IntroLandingView({
  onExploreDestination,
  onDirectLaunch360,
}: IntroLandingViewProps) {
  return (
    <main>
      {/* Editorial Hero */}
      <section className="relative bg-[#0B1D35] text-[#FFFFFF] overflow-hidden">
        <div className="relative min-h-[580px] lg:min-h-[680px] flex items-end">
          <ResilientImage
            src={LANDING_HERO_IMAGE.url}
            alt={LANDING_HERO_IMAGE.alt}
            fallbackTitle="Sahyadri Mountain Sunrise"
            priority
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#0B1D35] via-[#0B1D35]/60 to-[#0B1D35]/20"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#0B1D35]/85 via-[#102B50]/35 to-transparent"
          />

          <div className="relative z-10 max-w-7xl mx-auto w-full px-5 sm:px-8 pt-28 pb-12 sm:pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
              <div className="lg:col-span-8">
                <p className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium tracking-wide text-[#16B8C1] mb-4">
                  <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-[#F4C84A]" />
                  <span>MyTravWay · Maharashtra Destination Previews</span>
                </p>
                <h1 className="font-editorial text-[clamp(2.35rem,4.6vw,4.15rem)] font-normal tracking-tight leading-[1.06] text-[#FFFFFF] mb-5 max-w-3xl">
                  Experience the destination before you arrive.
                </h1>
                <p className="text-base sm:text-lg text-[#EDF2F6] leading-relaxed max-w-2xl mb-8">
                  Calm, optional 360° destination previews paired with clear route notes and verified terrain context—from high-altitude Sahyadri dawns to quiet moonlit Konkan beaches.
                </p>

                <div className="flex flex-wrap items-center gap-5">
                  <button
                    type="button"
                    onClick={() => {
                      document
                        .getElementById('prototype-destinations')
                        ?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-lg bg-[#F47724] text-[#0B1D35] text-sm font-semibold whitespace-nowrap shrink-0 hover:brightness-95 transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFFFFF]"
                  >
                    <span>Explore Destinations</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href="#design-philosophy"
                    className="text-sm font-medium text-[#FFFFFF] hover:text-[#16B8C1] underline underline-offset-8 decoration-[#16B8C1] transition-colors"
                  >
                    How the preview works
                  </a>
                </div>
              </div>

              {/* Subtle Desktop Destination Quick-Links */}
              <div className="hidden lg:flex lg:col-span-4 flex-col gap-3 rounded-2xl bg-[#183B5B]/70 border border-[#FFFFFF]/15 p-5">
                <p className="text-xs font-medium text-[#16B8C1]">Featured Environments</p>
                {DESTINATION_LIST.map(({ destination, experience }) => (
                  <button
                    key={destination.id}
                    type="button"
                    onClick={() => onExploreDestination(destination.id)}
                    className="group flex items-center justify-between gap-4 py-2.5 text-left border-b last:border-b-0 border-[#FFFFFF]/15 hover:border-[#16B8C1] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#16B8C1]"
                  >
                    <div>
                      <p className="font-editorial text-lg text-[#FFFFFF] group-hover:text-[#F4C84A] transition-colors">
                        {destination.name}
                      </p>
                      <p className="text-xs text-[#94A3B8]">
                        {destination.categoryLabel} · {experience.hotspots.length} viewpoints
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#16B8C1] transition-transform duration-150 group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two Prototype Destination Cards */}
      <section
        id="prototype-destinations"
        className="max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-28 scroll-mt-16"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-7 border-b border-[#E8E3D9]">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#087F89] mb-2.5">
              Curated Prototypes
            </p>
            <h2 className="font-editorial text-3xl sm:text-4xl font-normal tracking-tight text-[#102B50] max-w-xl">
              Two distinct landscapes, one calm preview flow
            </h2>
          </div>
          <p className="text-sm sm:text-[15px] text-[#475569] leading-relaxed max-w-md">
            Compare a pre-dawn Western Ghats ridge ascent with an unhurried overnight coastal camp beside the Arabian Sea.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
          {DESTINATION_LIST.map(({ destination, experience }) => (
            <article
              key={destination.id}
              className="group bg-[#FFFFFF] rounded-2xl border border-[#E8E3D9] shadow-[0_10px_30px_rgba(16,43,80,0.06)] hover:shadow-[0_18px_40px_rgba(16,43,80,0.12)] hover:border-[#C8E2DF] transition-all duration-200 overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/10] bg-[#0B1D35] overflow-hidden">
                  <ResilientImage
                    src={destination.cardImageUrl}
                    alt={destination.cardImageAlt}
                    fallbackTitle={destination.name}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#0B1D35]/35 via-transparent to-transparent pointer-events-none"
                  />
                </div>

                <div className="p-7 sm:p-10">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#087F89] font-medium mb-3.5">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#F47724]" />
                      {destination.cardLocationLabel}
                    </span>
                    <span aria-hidden="true" className="text-[#94A3B8]">
                      ·
                    </span>
                    <span>{destination.categoryLabel}</span>
                    <span aria-hidden="true" className="text-[#94A3B8]">
                      ·
                    </span>
                    <span className="tabular-nums">{experience.hotspots.length} Viewpoints</span>
                  </div>

                  <h3 className="font-editorial text-2xl sm:text-3xl font-normal text-[#102B50] tracking-tight mb-3">
                    {destination.name}
                  </h3>

                  <p className="text-[15px] leading-[1.7] text-[#475569] mb-7">
                    {destination.intro}
                  </p>

                  <dl className="grid grid-cols-2 gap-6 pt-6 border-t border-[#E5E7EB] text-sm">
                    <div>
                      <dt className="text-xs text-[#64748B]">
                        {destination.cardHighlightLabel}
                      </dt>
                      <dd className="font-medium text-[#102B50] mt-1">
                        {destination.cardHighlightValue}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[#64748B]">
                        {destination.cardSecondaryLabel}
                      </dt>
                      <dd className="font-medium text-[#102B50] mt-1">
                        {destination.cardSecondaryValue}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="px-7 sm:px-10 pb-8 sm:pb-10 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onExploreDestination(destination.id)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#102B50] text-[#FFFFFF] text-sm font-medium whitespace-nowrap shrink-0 hover:bg-[#0B1D35] transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087F89]"
                >
                  <span>Explore Destination</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onDirectLaunch360(destination.id)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[#C8E2DF] bg-[#DCEDEA] text-[#102B50] text-sm font-medium whitespace-nowrap shrink-0 hover:bg-[#087F89] hover:text-[#FFFFFF] hover:border-[#087F89] transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087F89]"
                >
                  <Compass className="w-4 h-4 text-[#F47724]" />
                  <span>Quick 360° Preview</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Editorial Philosophy — Asymmetric Split */}
      <section
        id="design-philosophy"
        className="border-t border-[#E8E3D9] bg-[#FAF8F2] scroll-mt-16"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5 space-y-4">
            <p className="text-xs font-semibold tracking-wide text-[#087F89]">
              Product Approach
            </p>
            <h2 className="font-editorial text-3xl sm:text-4xl font-normal tracking-tight text-[#102B50]">
              Clarity before commitment
            </h2>
            <p className="text-[15px] text-[#475569] leading-relaxed max-w-md">
              Travelers shouldn’t have to guess what a ridge climb or coastal night actually feels like—nor fight past noisy overlays just to read essential logistics.
            </p>
          </div>

          <div className="lg:col-span-7 divide-y divide-[#E8E3D9] border-y border-[#E8E3D9]">
            <div className="py-7 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-6">
              <div className="sm:col-span-2 font-mono text-xs font-medium text-[#087F89] tabular-nums pt-1">
                01
              </div>
              <div className="sm:col-span-10 space-y-1.5">
                <h3 className="font-editorial text-xl text-[#102B50]">Optional by Design</h3>
                <p className="text-sm text-[#475569] leading-relaxed">
                  Essential elevation, coastal logistics, route rhythm, and preparation notes remain cleanly readable whether or not you open the 360° experience.
                </p>
              </div>
            </div>

            <div className="py-7 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-6">
              <div className="sm:col-span-2 font-mono text-xs font-medium text-[#087F89] tabular-nums pt-1">
                02
              </div>
              <div className="sm:col-span-10 space-y-1.5">
                <h3 className="font-editorial text-xl text-[#102B50]">Spatial Scale & Quiet Audio</h3>
                <p className="text-sm text-[#475569] leading-relaxed">
                  An on-demand 360° viewpoint with mouse and touch navigation lets you gauge terrain openness and atmosphere before deciding, with sound muted until opted in.
                </p>
              </div>
            </div>

            <div className="py-7 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-6">
              <div className="sm:col-span-2 font-mono text-xs font-medium text-[#087F89] tabular-nums pt-1">
                03
              </div>
              <div className="sm:col-span-10 space-y-1.5">
                <h3 className="font-editorial text-xl text-[#102B50]">Transparent Fact Labeling</h3>
                <p className="text-sm text-[#475569] leading-relaxed">
                  Verified geographic facts are kept clearly separate from sample pacing, packing notes, and illustrative preview imagery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
