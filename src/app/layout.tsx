import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import "./globals.css";
import { Providers } from "./providers";
import { ThemeProvider } from 'next-themes'
import { ThemeToggle } from '@/components/theme-toggle'

export const metadata: Metadata = {
  title: "IVR Authentication Designer",
  description: "Design IVR authentication flows for your business",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <div className="min-h-screen">
              <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
              </div>
              {children}
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
