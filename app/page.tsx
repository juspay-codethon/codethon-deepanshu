import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      {/* Header */}
      <header className="relative z-10 px-6 py-8">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg"></div>
            <span className="text-white font-bold text-xl">Juspay Design</span>
          </div>
          <Button className="bg-slate-700 text-slate-200 hover:bg-slate-600 hover:text-white font-medium">
            Join Slack
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <span className="inline-block px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium mb-6">
              🚀 Design Team Event
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Design Team
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Codethon</span>
              <br />Kickoff 2025
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join us for an exciting journey where design meets code. Transform ideas into beautiful, 
              functional experiences with cutting-edge tools and collaborative innovation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="https://github.com/juspay-codethon" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 text-lg font-semibold">
                Start Building Now
              </Button>
            </Link>
            <Link href="https://github.com/dkrai04/juspay-codethon-template" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-slate-700 text-slate-200 hover:bg-slate-600 hover:text-white px-8 py-3 text-lg font-semibold">
                View Guidelines
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">24h</div>
              <div className="text-gray-400 text-sm">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">20+</div>
              <div className="text-gray-400 text-sm">Designers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">∞</div>
              <div className="text-gray-400 text-sm">Possibilities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Powered by Modern Tools
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300">
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold">N</span>
                </div>
                <CardTitle className="text-white">Next.js 15</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 text-center">
                  React framework with App Router and server components for modern web apps
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300">
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold">T</span>
                </div>
                <CardTitle className="text-white">Tailwind CSS</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 text-center">
                  Utility-first CSS framework for rapid UI development and consistent design
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300">
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-slate-500 to-gray-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <CardTitle className="text-white">shadcn/ui</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 text-center">
                  Beautiful, accessible components built with Radix UI and Tailwind CSS
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300">
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold">TS</span>
                </div>
                <CardTitle className="text-white">TypeScript</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 text-center">
                  Type-safe JavaScript for better developer experience and code reliability
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Event Details */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Event Details
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    📅
                  </div>
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-300">Dev Environment Setup</span>
                  <span className="text-blue-400 font-medium">29th May 3 PM</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-300">Dev Sprint</span>
                  <span className="text-blue-400 font-medium">30th May 6 PM</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-300">Final Presentation</span>
                  <span className="text-blue-400 font-medium">2nd June</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    🎯
                  </div>
                  Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-300">Build innovative design solutions</span>
                </div>
                <div className="p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-300">Foster cross-team collaboration</span>
                </div>
                <div className="p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-300">Explore cutting-edge technologies</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-700">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400">
            © 2025 Juspay Design Team Codethon. Made with ❤️ and lots of ☕
          </p>
        </div>
      </footer>
    </div>
  );
}