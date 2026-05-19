"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"

export function ToolsBackButton() {
  const { t } = useLanguage()

  return (
    <Button asChild variant="outline" className="mb-6 w-full justify-start sm:mb-8 sm:w-auto">
      <Link href="/tools">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("tools.back")}
      </Link>
    </Button>
  )
}
