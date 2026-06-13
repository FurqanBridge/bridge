import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import NavWrapper from './components/NavWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Teacher Portal',
  description: 'Student submission management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NavWrapper>
          {children}
        </NavWrapper>
      </body>
    </html>
  )
}
