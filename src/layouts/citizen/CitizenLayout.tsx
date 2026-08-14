import { FC } from 'react';
import { Outlet, Link } from 'react-router';
import { CitizenBottomNav } from './CitizenBottomNav';
import { DemoSimulationProvider } from '../../context/DemoSimulationContext';
import { ShieldCheck, ArrowRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/theme/ThemeContext';
import nagdrishtiLogo from '../../assets/images/logos/nagdrishti-logo.png';

export const CitizenLayout: FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <DemoSimulationProvider>
      <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#0B1320] text-[#111111] dark:text-white flex flex-col font-sans transition-colors">
        {/* Top Minimal Citizen Header */}
        <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0B1320]/95 backdrop-blur-md border-b border-[#E5E5E5] dark:border-white/10 px-3 py-2.5 transition-all">
          <div className="max-w-md md:max-w-2xl mx-auto flex items-center justify-between">
            {/* Logo & City Identity */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="size-9 rounded-xl bg-slate-900/5 dark:bg-slate-800/40 p-1 flex items-center justify-center border border-[#E5E5E5] dark:border-white/10 shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                <img
                  src={nagdrishtiLogo}
                  alt="NagDrishti AI"
                  className="h-7 w-auto object-contain"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-black text-sm tracking-tight font-outfit text-[#111111] dark:text-white">
                    NagDrishti
                  </span>
                  <span className="text-[9px] font-black px-1.5 py-0.2 bg-[#FFC107] text-[#111111] rounded shadow-xs">
                    AI
                  </span>
                </div>
                <span className="text-[10px] text-[#666666] dark:text-gray-400 font-medium">
                  Nagpur Urban Safety
                </span>
              </div>
            </Link>

            {/* Right Quick Controls: Theme Toggle & Admin Switcher Pill */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="size-8 rounded-lg flex items-center justify-center border border-[#E5E5E5] dark:border-white/10 text-[#666666] dark:text-gray-300 hover:bg-[#F7F7F7] dark:hover:bg-white/5 transition-colors cursor-pointer"
                title="Toggle Dark/Light Mode"
              >
                {theme === 'dark' ? <Sun className="size-4 text-[#FFC107]" /> : <Moon className="size-4 text-[#666666]" />}
              </button>

              <Link
                to="/admin"
                className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#FFF8E1] dark:bg-[#FFC107]/15 border border-[#FFC107]/40 text-[#111111] dark:text-[#FFC107] hover:bg-[#FFC107]/30 transition-all shadow-2xs"
              >
                <ShieldCheck className="size-3.5 text-[#FF8A00]" />
                <span>Admin Command</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 pb-20 px-3 py-3 max-w-md md:max-w-2xl mx-auto w-full">
          <Outlet />
        </main>

        {/* Sticky Mobile Bottom Navigation */}
        <CitizenBottomNav />
      </div>
    </DemoSimulationProvider>
  );
};

export default CitizenLayout;
