import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { BlocklistProvider } from '@/contexts/blocklist-context'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FocusFlow - Pomodoro & Distraction Blocker',
  description: 'Boost your productivity with Pomodoro timer and distraction blocking features',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <BlocklistProvider>
            {children}
          </BlocklistProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
} 