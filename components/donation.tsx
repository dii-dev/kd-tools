"use client"

import { Heart } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"

export function Donation() {
  const { t } = useLanguage()

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 py-16 md:py-24 dark:from-rose-500/10 dark:via-amber-500/8 dark:to-sky-500/10">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20 dark:opacity-35">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-pink-500 mix-blend-multiply blur-3xl animate-pulse dark:bg-rose-500/80"></div>
        <div
          className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-purple-500 mix-blend-multiply blur-3xl animate-pulse dark:bg-amber-500/70"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center dark:rounded-[2rem] dark:border dark:border-white/10 dark:bg-white/[0.04] dark:px-6 dark:py-10 dark:shadow-[0_22px_70px_rgba(0,0,0,0.32)] dark:backdrop-blur-sm"
        >
          <div className="flex justify-center mb-6">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}>
              <Heart className="w-12 h-12 text-red-500 fill-red-500" />
            </motion.div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">{t('donation.title')}</h2>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('donation.subtitle')}
          </p>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="https://link.payway.com.kh/ABAPAYoc326689D"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 px-8 py-4 font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/50 dark:hover:shadow-[0_18px_50px_rgba(236,72,153,0.35)]"
            >
              <Heart className="w-5 h-5" />
              {t('donation.button')}
            </Link>
          </motion.div>

          <p className="mt-6 text-sm text-muted-foreground">
            {t('donation.footer')}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
