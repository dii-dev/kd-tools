'use client'

import { Monitor, MoonStar, SunMedium } from 'lucide-react'
import { useTheme } from 'next-themes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'

export function ThemeToggle() {
  const { resolvedTheme, setTheme, theme } = useTheme()
  const { t } = useLanguage()

  const icon =
    resolvedTheme === 'dark' ? (
      <MoonStar className="h-4 w-4" />
    ) : resolvedTheme === 'light' ? (
      <SunMedium className="h-4 w-4" />
    ) : (
      <Monitor className="h-4 w-4" />
    )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-full border-border/70 bg-background/70 px-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
          {icon}
          <span className="hidden sm:inline">{t('theme.label')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 rounded-xl">
        <DropdownMenuLabel>{t('theme.label')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={theme === 'light' ? 'bg-accent' : ''}
        >
          <SunMedium className="h-4 w-4" />
          {t('theme.light')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={theme === 'dark' ? 'bg-accent' : ''}
        >
          <MoonStar className="h-4 w-4" />
          {t('theme.dark')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className={theme === 'system' ? 'bg-accent' : ''}
        >
          <Monitor className="h-4 w-4" />
          {t('theme.system')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
