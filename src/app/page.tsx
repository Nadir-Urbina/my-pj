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
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-xl font-bold">My Prophetic Journal</div>
          <div className="flex gap-4 items-center">
            <ThemeToggle />
            <Link href="/auth">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <motion.section 
        className="py-20 px-4"
        initial="initial"
        animate="animate"
        variants={stagger}
      >
        <div className="container mx-auto text-center">
          <motion.h1 
            className="text-5xl font-bold mb-6"
            variants={fadeIn}
          >
            Document Your Spiritual Journey
          </motion.h1>
          <motion.p 
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            variants={fadeIn}
          >
            "Write the vision and make it plain upon tablets" - Habakkuk 2:2
          </motion.p>
          <motion.div variants={fadeIn}>
            <Link href="/auth">
              <Button size="lg" className="gap-2">
                Start Your Journal <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="py-20 bg-muted/50"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={stagger}
      >
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12"
            variants={fadeIn}
          >
            Features
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<BookMarked />}
              title="Never Forget"
              description="Record and preserve your spiritual experiences, dreams, and visions"
            />
            <FeatureCard
              icon={<Users />}
              title="Team Collaboration"
              description="Enable your team with broader spiritual intel and insights"
            />
            <FeatureCard
              icon={<Brain />}
              title="Issachar Generation"
              description="Be part of those who understand the times and know what to do"
            />
            <FeatureCard
              icon={<CloudLightning />}
              title="Prophetic Insights"
              description="Track patterns and revelations in your spiritual journey"
            />
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section 
        className="py-20"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={stagger}
      >
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12"
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
        className="py-20 bg-muted/50"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={stagger}
      >
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12"
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
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div 
      className="p-6 rounded-lg border bg-card"
      variants={fadeIn}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.div>
  )
}

function TestimonialCard({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <motion.div className="p-6 rounded-lg border bg-card" variants={fadeIn}>
      <p className="mb-4 text-muted-foreground">"{quote}"</p>
      <p className="font-semibold">{author}</p>
      <p className="text-sm text-muted-foreground">{role}</p>
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
      className={`p-6 rounded-lg border ${highlighted ? "border-primary shadow-lg" : "bg-card"}`}
      variants={fadeIn}
    >
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="mb-4">
        <span className="text-3xl font-bold">{price}</span>
        <span className="text-muted-foreground">{period}</span>
      </div>
      <ul className="space-y-2 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="text-sm flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-primary" />
            {feature}
          </li>
        ))}
      </ul>
      <Link href="/auth">
        <Button className="w-full" variant={highlighted ? "default" : "outline"}>
          Get Started
        </Button>
      </Link>
    </motion.div>
  )
}

