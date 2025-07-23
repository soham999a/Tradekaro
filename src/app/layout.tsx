import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "../context/AuthContext";
import { Toaster } from "react-hot-toast";
import DemoModeIndicator from "../components/DemoModeIndicator";
import "./globals.css";

// Using Inter as fallback for Geist
const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Using JetBrains Mono as fallback for Geist Mono
const geistMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TradeKaro - Professional Indian Stock Trading Platform",
  description: "Master Indian stock trading with real NSE/BSE market data. Practice virtual trading, learn advanced strategies, and compete with traders safely. Features real-time quotes, technical analysis, and portfolio management.",
  keywords: "Indian stock trading, NSE, BSE, virtual trading, stock market simulator, portfolio management, technical analysis, Indian stocks, trading platform",
  authors: [{ name: "TradeKaro Team" }],
  creator: "TradeKaro",
  publisher: "TradeKaro",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // metadataBase: new URL('https://tradekaro.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "TradeKaro - Professional Indian Stock Trading Platform",
    description: "Master Indian stock trading with real NSE/BSE market data. Practice virtual trading and learn advanced strategies safely.",
    url: 'https://tradekaro.com',
    siteName: 'TradeKaro',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TradeKaro - Indian Stock Trading Platform',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "TradeKaro - Professional Indian Stock Trading Platform",
    description: "Master Indian stock trading with real NSE/BSE market data. Practice virtual trading safely.",
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            gutter={8}
            containerStyle={{
              top: 20,
              zIndex: 9999,
            }}
            toastOptions={{
              duration: 5000,
              style: {
                background: '#ffffff',
                color: '#1f2937',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 16px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                maxWidth: '400px',
                cursor: 'pointer',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
                style: {
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
                style: {
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                },
              },
              loading: {
                iconTheme: {
                  primary: '#3b82f6',
                  secondary: '#ffffff',
                },
                style: {
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                },
              },
            }}
          />
          <DemoModeIndicator />
        </AuthProvider>
      </body>
    </html>
  );
}
