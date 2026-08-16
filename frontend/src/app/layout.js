import "./globals.css";

export const metadata = {
  title: "NagDrishti AI — Nagpur Urban Crisis Management System",
  description:
    "AI-powered predictive crisis management system for rainfall waterlogging, road hazard detection, and risk-aware safe routing across Nagpur.",
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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50">{children}</body>
    </html>
  );
}
