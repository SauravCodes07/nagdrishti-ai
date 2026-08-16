import "./globals.css";

export const metadata = {
  title: "NagDrishti AI — Nagpur Urban Flood & Crisis Shield",
  description:
    "AI-powered predictive crisis management platform for real-time rainfall waterlogging detection, emergency response coordination, and safe road navigation across Nagpur.",
  icons: {
    icon: "/brand/logoicon.svg",
    apple: "/brand/nagdrishti-logo.png",
  },
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#FFC107",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F7F7F7] text-[#111111]">
        {children}
      </body>
    </html>
  );
}
