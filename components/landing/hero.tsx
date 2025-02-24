/**
 * @file hero.tsx
 * @description
 * This client component provides the hero section for the landing page, now updated
 * to align with the new site structure of BadBeats.org. It introduces the site's
 * main features (AI picks, user picks, leaderboard) and encourages sign-ups or
 * account logins for deeper engagement.
 *
 * Key Features:
 * - Animated gradient text link promoting the GitHub repository
 * - Main headline with updated messaging about the new site improvements
 * - A prominent call to action (CTA) for users to get started
 * - Embedded optional hero video for a dynamic demonstration
 *
 * Implementation Details:
 * - Uses Framer Motion for basic fade/slide animations
 * - Integrates PostHog for analytics tracking
 * - Showcases a link to GitHub for open-source code
 *
 * Notes:
 * - The disclaimers are placed on the main landing page, so this hero focuses on
 *   the initial attention grab for visitors.
 * - We retain the `HeroVideoDialog` for marketing or demonstration purposes, but
 *   it can be removed if desired.
 * - This file is a client component using "use client" because it relies on PostHog
 *   and the `useTheme` hook from next-themes.
 */

"use client"

import { motion } from "framer-motion"
import { ChevronRight, Rocket } from "lucide-react"
import Link from "next/link"
import posthog from "posthog-js"
import AnimatedGradientText from "../magicui/animated-gradient-text"
import HeroVideoDialog from "../magicui/hero-video-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * HeroSection Component
 * @description
 * Renders the hero banner, introducing visitors to the main value proposition
 * of BadBeats.org. It includes:
 * 1) A link to GitHub with animated gradient text.
 * 2) Main site headline about community picks, AI assistance, and user engagement.
 * 3) A "Get Started" button linking to the sign-up or GitHub repo.
 * 4) An embedded optional video dialogue for marketing or demonstration.
 *
 * @returns JSX.Element representing the hero section
 */
export const HeroSection = () => {
  /**
   * handleGetStartedClick
   * @description
   * Captures an analytic event in PostHog when the user clicks "Get Started."
   */
  const handleGetStartedClick = () => {
    posthog.capture("clicked_get_started")
  }

  return (
    <div className="flex flex-col items-center justify-center px-8 pt-32 text-center">
      {/* 
        An optional top link for GitHub:
        "View the code on GitHub" with an animated gradient text background.
      */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex items-center justify-center"
      >
        <Link href="https://github.com/garrettyarmo">
          <AnimatedGradientText>
            🚀
            <hr className="mx-2 h-4 w-px shrink-0 bg-gray-300" />
            <span
              className={cn(
                `animate-gradient inline bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`
              )}
            >
              View the code on GitHub
            </span>
            <ChevronRight className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
          </AnimatedGradientText>
        </Link>
      </motion.div>

      {/* 
        Main heading & subheading:
        Updated text focusing on new site features: user picks, AI picks, and leaderboard.
      */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="mt-8 flex max-w-2xl flex-col items-center justify-center gap-6"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          className="text-balance text-6xl font-bold"
        >
          Bet Smarter with AI & Community Insights
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          className="max-w-xl text-balance text-xl"
        >
          Discover daily picks powered by advanced language models. Contribute
          your own picks, track your stats, and climb the community leaderboard.
        </motion.div>

        {/* 
          Primary call to action: 
          Encourages the user to get started or sign up. 
        */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
        >
          <Link href="/signup" onClick={handleGetStartedClick}>
            <Button className="bg-blue-500 text-lg hover:bg-blue-600">
              <Rocket className="mr-2 size-5" />
              Get Started &rarr;
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* 
        Optional embedded video demonstration to highlight the site's concept, 
        especially for new visitors. 
      */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1, ease: "easeOut" }}
        className="mx-auto mt-20 flex w-full max-w-screen-lg items-center justify-center rounded-lg border shadow-lg"
      >
        <HeroVideoDialog
          animationStyle="top-in-bottom-out"
          videoSrc="https://www.youtube.com/watch?v=DKP16d_WdZM"
          thumbnailSrc="https://img.youtube.com/vi/DKP16d_WdZM/0.jpg"
          thumbnailAlt="BadBeats Hero Video"
        />
      </motion.div>
    </div>
  )
}
