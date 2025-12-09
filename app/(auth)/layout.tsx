import React from 'react'
import { ThemeProvider } from '@/components/theme-provider'

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex justify-center items-center min-h-screen w-full bg-gradient-to-br from-background via-secondary/20 to-primary/5 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-3xl opacity-50" />

        <div className="relative z-10 animate-fade-in">
          {children}
        </div>
      </div>
    </ThemeProvider>
  )
}

export default layout
