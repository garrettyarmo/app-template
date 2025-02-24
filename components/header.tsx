/**
 * @file header.tsx
 * @description
 * This client component provides a sticky header for the BadBeats.org application.
 * It includes:
 * - Branding (logo/title)
 * - Navigation links (including AI Picks, My Picks, Leaderboard, etc.)
 * - Theme switcher
 * - Auth-based actions (sign in/out, user profile button)
 * - A responsive mobile menu
 *
 * Key Features:
 * - Sticky top navigation bar that changes style when scrolled
 * - Desktop nav (centered) and mobile nav (slide-down menu)
 * - Clerk's SignedIn / SignedOut logic for user state
 * - ThemeSwitcher integrated for toggling dark/light modes
 *
 * Implementation Details:
 * - This file uses React’s useState to track the mobile menu.
 * - We also track window scroll position with a 'useEffect' to add a blur background once scrolled.
 * - Navigation arrays define both “guest” pages and pages for logged-in users (if desired).
 *
 * Notes:
 * - If you’d like to add or remove nav links, simply edit the navLinks array below.
 * - Adjust styling or brand name as suits your design.
 */

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, SquareActivity, X } from "lucide-react"
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton
} from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { ThemeSwitcher } from "@/components/utilities/theme-switcher"

/**
 * An array of navigation links always visible (for about, pricing, etc.)
 * in the header. These are for marketing or informational pages.
 */
const navLinks = [
  { href: "/picks", label: "AI Picks" },
  { href: "/my-picks", label: "My Picks" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" }
]

/**
 * The main header component for BadBeats.org
 * @returns JSX.Element
 */
export default function Header() {
  // Whether the mobile menu is open
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Whether the page has been scrolled to apply a background blur
  const [isScrolled, setIsScrolled] = useState(false)

  /**
   * Toggles the mobile menu open/closed
   */
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  /**
   * On mount, add a scroll listener to show background blur once scrolled
   */
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-colors ${
        isScrolled
          ? "bg-background/80 shadow-sm backdrop-blur-sm"
          : "bg-background"
      }`}
    >
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between p-4">
        {/*
          Branding:
          The icon from lucide-react plus the site name linking back to home.
        */}
        <div className="flex items-center space-x-2 hover:cursor-pointer hover:opacity-80">
          <SquareActivity className="size-6" />
          <Link href="/" className="text-xl font-bold">
            BadBeats.org
          </Link>
        </div>

        {/**
         * Main nav for desktop devices:
         * Absolute position to center it horizontally.
         * Only visible at md+ breakpoints.
         */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 space-x-2 font-semibold md:flex">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1 hover:opacity-80"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/**
         * Right-side options:
         * Theme switcher, sign in/out, user button, mobile menu toggle
         */}
        <div className="flex items-center space-x-4">
          <ThemeSwitcher />

          {/* If user is signed out: show "Login" & "Sign Up" buttons */}
          <SignedOut>
            <SignInButton>
              <Button variant="outline">Login</Button>
            </SignInButton>

            <SignUpButton>
              <Button className="bg-blue-500 hover:bg-blue-600">Sign Up</Button>
            </SignUpButton>
          </SignedOut>

          {/* If user is signed in: show the Clerk user button */}
          <SignedIn>
            <UserButton />
          </SignedIn>

          {/* 
            Mobile menu icon:
            Shown only on small screens (md:hidden).
          */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="size-6" />
              ) : (
                <Menu className="size-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/*
        If the mobile menu is open, show a vertical menu with the same links
        plus dynamic user-specific items if needed.
      */}
      {isMenuOpen && (
        <nav className="bg-primary-foreground text-primary p-4 md:hidden">
          <ul className="space-y-2">
            <li>
              <Link
                href="/"
                className="block hover:underline"
                onClick={toggleMenu}
              >
                Home
              </Link>
            </li>

            {navLinks.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block hover:underline"
                  onClick={toggleMenu}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
