import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";

export const metadata = {
  metadataBase: new URL("https://nagdrishti.netlify.app"),
  title: "NagDrishti AI — Nagpur Urban Flood & Crisis Shield",
  description:
    "AI-powered predictive crisis management platform for real-time rainfall waterlogging detection, emergency response coordination, and safe road navigation across Nagpur.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "NagDrishti AI — Nagpur Urban Flood & Crisis Shield",
    description:
      "Predictive crisis management, real-time flood monitoring, and risk-aware navigation for Nagpur.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "NagDrishti AI" }],
  },
};

export const viewport = {
  themeColor: "#0D9488",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased suppressHydrationWarning">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var dark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches) || (stored === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (dark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (_) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 antialiased selection:bg-teal-500 selection:text-white">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
