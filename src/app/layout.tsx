import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Multi-Package Dependency Analyzer',
  description: 'Analyze multiple package.json files and visualize cross-project dependencies',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}