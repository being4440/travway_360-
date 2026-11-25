import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { DestinationId } from '../data/destinations';

interface TopNavBarProps {
  activeView: 'intro' | 'destination';
  selectedDestinationId: DestinationId;
  onNavigateIntro: () => void;
  onSelectDestination: (destinationId: DestinationId) => void;
  onJumpToBeforeYouGo: () => void;
  onOpenViewer: () => void;
}

export function TopNavBar({
  activeView,
  selectedDestinationId,
  onNavigateIntro,
  onSelectDestination,
  onJumpToBeforeYouGo,
  onOpenViewer,
}: TopNavBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (fn: () => void) => {
    setMobileMenuOpen(false);
    fn();
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E8E3D9]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[72px] flex items-center justify-between gap-8">
        <button
          type="button"
          onClick={() => handleNavClick(onNavigateIntro)}
          className="inline-flex items-center gap-3 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#087F89] cursor-pointer group"
        >
          <img
            src="/assets/aistudio/mytravway-logo_f161cadf.png"
            alt="MyTravWay logo"
            className="h-11 w-11 object-contain shrink-0"
          />
          <span className="font-editorial text-xl sm:text-2xl font-semibold tracking-tight text-[#102B50] group-hover:text-[#087F89] transition-colors">
            MyTravWay
          </span>
        </button>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-8 text-sm font-medium text-[#475569]"
        >
          <button
            type="button"
            onClick={onNavigateIntro}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors duration-150 cursor-pointer hover:text-[#102B50] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#087F89] ${
              activeView === 'intro'
                ? 'text-[#102B50] font-semibold underline underline-offset-8 decoration-[#087F89] decoration-2'
                : ''
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => onSelectDestination('kalsubai-summit')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors duration-150 cursor-pointer hover:text-[#102B50] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#087F89] ${
              activeView === 'destination' && selectedDestinationId === 'kalsubai-summit'
                ? 'text-[#102B50] font-semibold underline underline-offset-8 decoration-[#087F89] decoration-2'
                : ''
            }`}
          >
            Kalsubai Summit
          </button>
          <button
            type="button"
            onClick={() => onSelectDestination('alibaug-night-camping')}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors duration-150 cursor-pointer hover:text-[#102B50] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#087F89] ${
              activeView === 'destination' && selectedDestinationId === 'alibaug-night-camping'
                ? 'text-[#102B50] font-semibold underline underline-offset-8 decoration-[#087F89] decoration-2'
                : ''
            }`}
          >
            Alibaug Camping
          </button>
          <button
            type="button"
            onClick={onJumpToBeforeYouGo}
            className="whitespace-nowrap shrink-0 py-1 transition-colors duration-150 cursor-pointer hover:text-[#102B50] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#087F89]"
          >
            Before You Go
          </button>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          {activeView === 'intro' ? (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                document
                  .getElementById('prototype-destinations')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2 rounded-lg bg-[#102B50] text-[#FFFFFF] text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 hover:bg-[#0B1D35] transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087F89]"
            >
              Explore Destinations
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenViewer();
              }}
              className="px-4 py-2 rounded-lg bg-[#F47724] text-[#0B1D35] text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 hover:brightness-95 transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#102B50]"
            >
              Explore in 360°
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden w-10 h-10 inline-flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#FAF8F2] text-[#102B50] hover:bg-[#EDF2F6] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#087F89]"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="md:hidden border-t border-[#E8E3D9] bg-[#FAF8F2] px-5 py-3 flex flex-col gap-1 text-sm font-medium text-[#102B50]"
        >
          <button
            type="button"
            onClick={() => handleNavClick(onNavigateIntro)}
            className={`text-left px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
              activeView === 'intro'
                ? 'bg-[#DCEDEA] text-[#102B50] font-semibold'
                : 'text-[#475569] hover:bg-[#EDF2F6] hover:text-[#102B50]'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => handleNavClick(() => onSelectDestination('kalsubai-summit'))}
            className={`text-left px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
              activeView === 'destination' && selectedDestinationId === 'kalsubai-summit'
                ? 'bg-[#DCEDEA] text-[#102B50] font-semibold'
                : 'text-[#475569] hover:bg-[#EDF2F6] hover:text-[#102B50]'
            }`}
          >
            Kalsubai Summit
          </button>
          <button
            type="button"
            onClick={() => handleNavClick(() => onSelectDestination('alibaug-night-camping'))}
            className={`text-left px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
              activeView === 'destination' && selectedDestinationId === 'alibaug-night-camping'
                ? 'bg-[#DCEDEA] text-[#102B50] font-semibold'
                : 'text-[#475569] hover:bg-[#EDF2F6] hover:text-[#102B50]'
            }`}
          >
            Alibaug Camping
          </button>
          <button
            type="button"
            onClick={() => handleNavClick(onJumpToBeforeYouGo)}
            className="text-left px-3 py-2.5 rounded-lg text-[#475569] hover:bg-[#EDF2F6] hover:text-[#102B50] transition-colors cursor-pointer"
          >
            Before You Go
          </button>
        </nav>
      )}
    </header>
  );
}
