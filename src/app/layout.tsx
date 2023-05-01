import Chat from './components/Chat'
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Anime Page Chatbot',
  description: 'One stop shop to browse anime of all genres.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Chat />
        {children}
      </body>
    </html>
  )
}
