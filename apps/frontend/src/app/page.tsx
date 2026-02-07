"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  RefreshCw,
  Lock,
  ShieldCheck,
  Zap,
  Users,
  ArrowRight,
  Database,
  FileSpreadsheet
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-10 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left space-y-8 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold border border-blue-100 animate-fade-in">
                <Zap className="w-4 h-4" />
                <span>Real-time Sync for Google Sheets</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
                Connect your Data Grid to <span className="text-blue-600">Any Sheet</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-xl mx-auto md:mx-0">
                A high-performance synchronization engine. manage your data in a custom UI while keeping perfectly in sync with Google Sheets.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start pt-4">
                <Link href="/register">
                  <Button size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="h-14 px-8 text-lg border-2">
                    Sign In
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 justify-center md:justify-start pt-4 text-gray-400">
                <div className="flex items-center gap-1.5 grayscale opacity-70">
                  <Database className="w-5 h-5" />
                  <span className="font-semibold text-sm">MySQL Core</span>
                </div>
                <div className="flex items-center gap-1.5 grayscale opacity-70">
                  <FileSpreadsheet className="w-5 h-5" />
                  <span className="font-semibold text-sm">Sheets API</span>
                </div>
              </div>
            </div>

            <div className="flex-1 relative w-full max-w-xl mx-auto md:max-w-none">
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl border p-4 transform md:rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center justify-between mb-4 border-b pb-4">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded">
                    LIVE SYNCING
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-8 bg-gray-50 rounded animate-pulse" />
                  <div className="h-24 bg-blue-50/50 rounded flex items-center justify-center border border-blue-100 border-dashed">
                    <div className="flex items-center gap-2 text-blue-600">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span className="font-medium text-sm">Broadcasting via SSE...</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-12 bg-gray-50 rounded" />
                    <div className="h-12 bg-gray-100 rounded relative overflow-hidden">
                      <div className="absolute inset-0 bg-red-100/50 flex items-center justify-center">
                        <Lock className="w-4 h-4 text-red-500" />
                      </div>
                    </div>
                    <div className="h-12 bg-gray-50 rounded" />
                  </div>
                  <div className="h-8 bg-gray-50 rounded" />
                </div>
              </div>
              {/* Background Glow */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-400/20 blur-[100px] rounded-full" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-purple-400/20 blur-[100px] rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl font-bold text-gray-900 leading-tight">
              Powerful sync capabilities for modern workflows
            </h2>
            <p className="text-xl text-gray-500">
              Built from the ground up to solve collaboration mismatches and data silos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<RefreshCw className="w-8 h-8 text-blue-600" />}
              title="Bi-Directional Sync"
              description="Changes in the Web UI reflect in Google Sheets instantly, and vice versa using our Apps Script webhook."
            />
            <FeatureCard
              icon={<Lock className="w-8 h-8 text-red-600" />}
              title="Concurrency Protection"
              description="Real-time cell locking powered by Server-Sent Events (SSE) ensures users never overwrite each other."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-8 h-8 text-green-600" />}
              title="Full Audit Logs"
              description="Complete transparency with logs for every modification, sync, and connection event."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-6 text-center text-white space-y-8">
          <h2 className="text-3xl md:text-5xl font-extrabold max-w-3xl mx-auto leading-tight">
            Ready to supercharge your Google Sheets?
          </h2>
          <p className="text-blue-100 text-xl max-w-2xl mx-auto">
            Join users who are building structured applications on top of their spreadsheets today.
          </p>
          <div className="flex justify-center pt-4">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-10 h-14 text-lg">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-blue-600 w-6 h-6" />
            <span className="text-lg font-bold text-gray-900">SheetConnect</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2024 SheetConnect. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm font-medium text-gray-500">
            <Link href="/docs/SYSTEM_ARCHITECTURE.md" className="hover:text-blue-600 transition-colors">Architecture</Link>
            <Link href="/docs/BACKEND_DOCS.md" className="hover:text-blue-600 transition-colors">Backend</Link>
            <Link href="/docs/FRONTEND_DOCS.md" className="hover:text-blue-600 transition-colors">Frontend</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl border bg-gray-50/50 hover:bg-white hover:shadow-xl transition-all duration-300 group">
      <div className="mb-6 p-3 rounded-xl bg-white w-fit shadow-sm group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
