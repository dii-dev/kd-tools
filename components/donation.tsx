"use client"

import { Heart } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export function Donation() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="flex justify-center mb-6">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}>
              <Heart className="w-12 h-12 text-red-500 fill-red-500" />
            </motion.div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Support Our Mission</h2>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Help us continue developing and improving KD OCR. Your support enables us to add new features, improve
            performance, and keep our service free for everyone.
          </p>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="https://link.payway.com.kh/ABAPAYoc326689D"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300"
            >
              <Heart className="w-5 h-5" />
              Donate via ABA Payway
            </Link>
          </motion.div>

          <p className="mt-6 text-sm text-muted-foreground">
            Every donation helps us serve you better. Thank you for your support! 🙏
          </p>
        </motion.div>
      </div>
    </section>
  )
}
