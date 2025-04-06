'use client'

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'

export default function Header() {
    return (
        <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

                {/* Left Side - Logo or Navigation */}
                <Link href="/" className="text-xl font-semibold tracking-tight hover:opacity-80 transition">
                    🚀 MyApp
                </Link>

                {/* Right Side - Buttons & Theme Toggle */}
                <div className="flex items-center gap-3">
                    <ThemeToggle />

                    <SignedOut>
                        <SignInButton mode="modal">
                            <Button variant="ghost" size="sm">Sign In</Button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                            <Button variant="outline" size="sm">Sign Up</Button>
                        </SignUpButton>
                    </SignedOut>

                    <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                </div>
            </div>
        </header>
    )
}
