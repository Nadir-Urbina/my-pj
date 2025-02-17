"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookMarked, Users, Brain, CloudLightning } from "lucide-react"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/ui/theme-toggle"

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function Home() {
  return (
    <main>
      {/* Hero Section with gradient background */}
      <div className="relative min-h-[70vh]">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950">
          {/* Optional subtle grid pattern */}
          <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-800/50 bg-[size:20px_20px]"></div>
        </div>

        {/* Content */}
        <div className="relative pt-8 pb-8 sm:pt-16 sm:pb-12 lg:pb-16 container mx-auto px-4">
          {/* Navigation stays at the top */}
          <nav className="flex justify-between items-center mb-12">
            <h1 className="text-xl font-semibold dark:text-white">My Prophetic Journal</h1>
            <div className="flex gap-4 items-center">
              <ThemeToggle />
              <Link href="/auth" className="text-sm font-medium dark:text-gray-200">
                Login
              </Link>
              <Link 
                href="/auth"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </nav>

          {/* Hero content */}
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
              Document Your Spiritual Journey
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              "Write the vision and make it plain upon tablets" - Habakkuk 2:2
            </p>
            <Link
              href="/start-your-journal"
              className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors duration-200"
            >
              Start Your Journal
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-gray-50 via-transparent to-gray-50 dark:from-gray-900/50 dark:via-transparent dark:to-gray-900/50"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={stagger}
      >
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white"
            variants={fadeIn}
          >
            Features
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<BookMarked className="text-blue-600 dark:text-blue-400" />}
              title="Never Forget"
              description="Record and preserve your spiritual experiences, dreams, and visions"
            />
            <FeatureCard
              icon={<Users className="text-blue-600 dark:text-blue-400" />}
              title="Team Collaboration"
              description="Enable your team with broader spiritual intel and insights"
            />
            <FeatureCard
              icon={<Brain className="text-blue-600 dark:text-blue-400" />}
              title="Issachar Generation"
              description="Be part of those who understand the times and know what to do"
            />
            <FeatureCard
              icon={<CloudLightning className="text-blue-600 dark:text-blue-400" />}
              title="Prophetic Insights"
              description="Track patterns and revelations in your spiritual journey"
            />
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section 
        className="py-20 bg-white dark:bg-black"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={stagger}
      >
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white"
            variants={fadeIn}
          >
            What People Are Saying
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="This journal has transformed how our prophetic team collaborates and shares revelations."
              author="Sarah M."
              role="Prophetic Team Leader"
            />
            <TestimonialCard
              quote="Finally, a digital solution for documenting spiritual experiences and dreams!"
              author="David R."
              role="Pastor"
            />
            <TestimonialCard
              quote="The team features have enhanced our spiritual discussions and discernment."
              author="Rachel K."
              role="Ministry Director"
            />
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={stagger}
      >
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white"
            variants={fadeIn}
          >
            Simple Pricing
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              title="Personal"
              price="Free"
              features={[
                "Unlimited journal entries",
                "Basic formatting tools",
                "Personal categories",
                "Cloud backup"
              ]}
            />
            <PricingCard
              title="Team"
              price="$9.99"
              period="/month"
              features={[
                "Everything in Personal",
                "Team collaboration",
                "Shared categories",
                "Advanced search",
                "Priority support"
              ]}
              highlighted
            />
            <PricingCard
              title="Ministry"
              price="Contact Us"
              features={[
                "Everything in Team",
                "Custom branding",
                "Advanced analytics",
                "API access",
                "Dedicated support"
              ]}
            />
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">My Prophetic Journal</h3>
              <p className="text-sm text-muted-foreground">
                Empowering the Issachar generation to document and discern the times.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>Features</li>
                <li>Pricing</li>
                <li>FAQ</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>About</li>
                <li>Blog</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>Privacy</li>
                <li>Terms</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div 
      className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all"
      variants={fadeIn}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </motion.div>
  )
}

function TestimonialCard({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <motion.div 
      className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm"
      variants={fadeIn}
    >
      <p className="mb-4 text-gray-600 dark:text-gray-400 italic">"{quote}"</p>
      <p className="font-semibold text-gray-900 dark:text-white">{author}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{role}</p>
    </motion.div>
  )
}

function PricingCard({ 
  title, 
  price, 
  period = "", 
  features, 
  highlighted = false 
}: { 
  title: string; 
  price: string; 
  period?: string; 
  features: string[]; 
  highlighted?: boolean;
}) {
  return (
    <motion.div 
      className={`p-6 rounded-xl border ${
        highlighted 
          ? "border-blue-500 dark:border-blue-400 shadow-lg" 
          : "border-gray-200 dark:border-gray-800"
      } bg-white dark:bg-gray-900`}
      variants={fadeIn}
    >
      <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <div className="mb-4">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{price}</span>
        <span className="text-gray-600 dark:text-gray-400">{period}</span>
      </div>
      <ul className="space-y-2 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="text-sm flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            {feature}
          </li>
        ))}
      </ul>
      <Link href="/auth">
        <Button 
          className={`w-full ${
            highlighted 
              ? "bg-blue-600 hover:bg-blue-700 text-white" 
              : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          Get Started
        </Button>
      </Link>
    </motion.div>
  )
}

