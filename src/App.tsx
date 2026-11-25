import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { TopNavBar } from './components/TopNavBar';
import { IntroLandingView } from './components/IntroLandingView';
import { DestinationPreviewView } from './components/DestinationPreviewView';
import { DESTINATIONS, type DestinationId } from './data/destinations';

const loadImmersiveViewer = () => import('./immersive/ImmersivePanoramaModal');
const ImmersivePanoramaModal = lazy(loadImmersiveViewer);

export default function App() {
  const [activeView, setActiveView] = useState<'intro' | 'destination'>('intro');
  const [selectedDestinationId, setSelectedDestinationId] =
    useState<DestinationId>('kalsubai-summit');
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const savedScrollYRef = useRef<number>(0);
  const lastTriggerElRef = useRef<HTMLElement | null>(null);

  const currentBundle = DESTINATIONS[selectedDestinationId];
  const alternateDestinationId: DestinationId =
    selectedDestinationId === 'kalsubai-summit'
      ? 'alibaug-night-camping'
      : 'kalsubai-summit';
  const alternateBundle = DESTINATIONS[alternateDestinationId];

  const handleNavigateIntro = useCallback(() => {
    setActiveView('intro');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSelectDestination = useCallback((destinationId: DestinationId) => {
    setSelectedDestinationId(destinationId);
    setActiveView('destination');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleJumpToBeforeYouGo = useCallback(() => {
    if (activeView !== 'destination') {
      setActiveView('destination');
      requestAnimationFrame(() => {
        setTimeout(() => {
          document.getElementById('before-you-go')?.scrollIntoView({ behavior: 'smooth' });
        }, 60);
      });
    } else {
      document.getElementById('before-you-go')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeView]);

  const handleOpenViewerForDestination = useCallback(
    (destinationId?: DestinationId) => {
      lastTriggerElRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      if (destinationId && destinationId !== selectedDestinationId) {
        setSelectedDestinationId(destinationId);
        setActiveView('destination');
        savedScrollYRef.current = 0;
      } else if (activeView !== 'destination') {
        setActiveView('destination');
        savedScrollYRef.current = 0;
      } else {
        savedScrollYRef.current = window.scrollY;
      }
      setIsViewerOpen(true);
    },
    [activeView, selectedDestinationId]
  );

  const handleCloseViewer = useCallback(() => {
    setIsViewerOpen(false);
    const restoreY = savedScrollYRef.current;
    requestAnimationFrame(() => {
      window.scrollTo({ top: restoreY, behavior: 'instant' });
      if (lastTriggerElRef.current?.isConnected) {
        lastTriggerElRef.current.focus({ preventScroll: true });
      }
    });
  }, []);

  const handlePrefetchViewer = useCallback(() => {
    void loadImmersiveViewer();
  }, []);

  // Lock background page scroll while fullscreen 360° viewer is open
  useEffect(() => {
    if (!isViewerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isViewerOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F2E9] text-[#102B50]">
      <TopNavBar
        activeView={activeView}
        selectedDestinationId={selectedDestinationId}
        onNavigateIntro={handleNavigateIntro}
        onSelectDestination={handleSelectDestination}
        onJumpToBeforeYouGo={handleJumpToBeforeYouGo}
        onOpenViewer={() => handleOpenViewerForDestination()}
      />

      <div className="flex-1">
        {activeView === 'intro' ? (
          <IntroLandingView
            onExploreDestination={handleSelectDestination}
            onDirectLaunch360={handleOpenViewerForDestination}
          />
        ) : (
          <DestinationPreviewView
            destination={currentBundle.destination}
            experience={currentBundle.experience}
            alternateDestination={alternateBundle.destination}
            onBackToIntro={handleNavigateIntro}
            onOpen360Viewer={() => handleOpenViewerForDestination()}
            onPrefetch360Viewer={handlePrefetchViewer}
            onSwitchDestination={handleSelectDestination}
          />
        )}
      </div>

      <footer className="border-t border-[#183B5B] bg-[#0B1D35] text-[#FFFFFF]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7 flex flex-col sm:flex-row sm:items-center gap-5">
            <button
              type="button"
              onClick={handleNavigateIntro}
              aria-label="Return to MyTravWay overview"
              className="w-16 h-16 rounded-xl bg-[#FFFFFF] p-2 inline-flex items-center justify-center shrink-0 border border-[#E8E3D9] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#16B8C1]"
            >
              <img
                src="/assets/aistudio/mytravway-logo_f161cadf.png"
                alt="MyTravWay"
                className="w-full h-full object-contain"
              />
            </button>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold tracking-wide text-[#16B8C1]">
                Experience Before You Arrive
              </p>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed max-w-xl">
                Destination preview demonstration for Kalsubai Summit and Alibaug Night Camping, Maharashtra. Illustrative 360° environments, sample pacing, and verified terrain facts are clearly distinguished.
              </p>
            </div>
          </div>
          <div className="md:col-span-5 flex flex-wrap items-center md:justify-end gap-x-7 gap-y-3 text-xs font-medium text-[#EDF2F6]">
            <button
              type="button"
              onClick={handleNavigateIntro}
              className="hover:text-[#16B8C1] transition-colors cursor-pointer whitespace-nowrap"
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => handleSelectDestination('kalsubai-summit')}
              className="hover:text-[#16B8C1] transition-colors cursor-pointer whitespace-nowrap"
            >
              Kalsubai Summit
            </button>
            <button
              type="button"
              onClick={() => handleSelectDestination('alibaug-night-camping')}
              className="hover:text-[#16B8C1] transition-colors cursor-pointer whitespace-nowrap"
            >
              Alibaug Camping
            </button>
          </div>
        </div>
      </footer>

      {isViewerOpen && (
        <Suspense
          fallback={
            <div
              role="status"
              aria-live="polite"
              className={`fixed inset-0 z-50 text-[#F5F0E7] flex flex-col items-center justify-center p-6 text-center ${
                currentBundle.experience.themeId === 'midnight-coastal'
                  ? 'bg-[#0B1424]'
                  : 'bg-[#151B19]'
              }`}
            >
              <div className="w-8 h-8 rounded-full border-2 border-[#C9B99D]/30 border-t-[#D68A45] animate-spin mb-4" />
              <p className="font-editorial text-xl text-[#FFFFFF]">
                {currentBundle.experience.loadingTitle}
              </p>
              <p className="text-xs text-[#C9B99D] mt-1">
                {currentBundle.experience.loadingSubtitle}
              </p>
              <button
                type="button"
                onClick={handleCloseViewer}
                className="mt-6 px-4 py-2 rounded-lg border border-[#C9B99D]/40 text-xs text-[#F5F0E7] hover:bg-[#183C32] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          }
        >
          <ImmersivePanoramaModal
            destination={currentBundle.destination}
            experience={currentBundle.experience}
            onClose={handleCloseViewer}
          />
        </Suspense>
      )}
    </div>
  );
}
