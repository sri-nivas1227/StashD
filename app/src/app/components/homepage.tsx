"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  FolderOpen,
  Globe,
  Link2,
  Search,
  Share2,
  Sparkles,
} from "lucide-react";
import { ROUTES } from "@/config/constants";
import Image from "next/image";
import Logo from "@/app/assets/StashD-Logo-White.png";

// ─── Data ─────────────────────────────────────────────────────────────────────

const silos = [
  { label: "Instagram saves", note: "only Instagram stuff 🙄" },
  { label: "YouTube playlists", note: "only YouTube stuff 🙄" },
  { label: "Browser bookmarks", note: "chaotic mess, let's be honest 🙄" },
  { label: "Notes app", note: "not built for this 🙄" },
];

const features = [
  {
    icon: Link2,
    title: "Drop any link, from anywhere",
    description:
      "YouTube, Reddit, a random blog at 2am — just paste it in. Done.",
  },
  {
    icon: FolderOpen,
    title: "Make collections for everything",
    description:
      "OS exam prep. Weekend recipes. Job hunt. Whatever your brain is on right now.",
  },
  {
    icon: Search,
    title: "Actually find stuff again",
    description: "Search by title or tag. It'll be there. Promise.",
  },
  {
    icon: Share2,
    title: "Send a whole collection to a friend",
    description:
      "One link. They get everything. No account needed on their end.",
    incoming: true,
  },
  {
    icon: Globe,
    title: "Open it anywhere",
    description: "Phone, laptop, library computer. It just works.",
  },
  {
    icon: BookOpen,
    title: "You're in charge",
    description:
      "Your categories, your tags, your rules. No algorithm deciding what matters.",
  },
];

const useCases = [
  { emoji: "📖", label: "Exam prep" },
  { emoji: "✈️", label: "Trip planning" },
  { emoji: "🍳", label: "Recipes" },
  { emoji: "💼", label: "Job hunt" },
  { emoji: "🎨", label: "Design inspo" },
  { emoji: "🧠", label: "Learning stuff" },
];

const STAGGER = {
  container: {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  },
  item: {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  },
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="w-full lg:w-3/4 flex flex-col gap-10 pb-32 px-4 sm:px-0">
      <section className="mt-10">
        <Link href={ROUTES.HOME} className="flex items-center justify-center">
          {/* <LinkIcon className="w-6 h-6" /> */}
          <Image src={Logo} alt="StashD Logo" className="w-48" />
        </Link>{" "}
      </section>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="flex flex-col justify-center items-center gap-5  p2-2">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-300 w-fit"
        >
          <Sparkles size={14} />
          hey, quick question 👋
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full md:w-1/2 text-center text-4xl font-bold tracking-tight text-zinc-100 leading-snug"
        >
          Ever saved a link and then… just never found it again?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full md:w-1/2 text-center text-sm md:text-base text-zinc-400 leading-relaxed"
        >
          You're deep in research mode — writing a paper, prepping for an exam,
          planning a trip — and your links are{" "}
          <span className="text-zinc-300 font-semibold">everywhere</span>.{" "}
          <i>Instagram saves</i>. <i>A YouTube playlist</i>.{" "}
          <i>Three browser tabs</i>.{" "}
          <i>A notes app you haven't opened in weeks</i>.
        </motion.p>
        <i></i>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-sm text-zinc-400 leading-relaxed text-center"
        >
          Yeah. That chaos ends here. 👇
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 flex flex-col gap-3 pt-2"
        >
          <Link
            href="/auth/signup"
            className="flex items-center justify-center gap-2 rounded-full border border-indigo-500/60 bg-indigo-500 py-3 text-sm font-semibold text-white shadow-[0_20px_50px_-20px_rgba(99,102,241,0.9)] transition hover:brightness-110"
          >
            Get started — it&apos;s free
          </Link>
          <Link
            href="/auth/login"
            className="flex items-center justify-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 py-3 text-sm font-semibold text-zinc-400 transition hover:text-zinc-200"
          >
            Already have an account? Sign in
          </Link>
        </motion.div>
      </section>

      {/* ── THE PROBLEM ───────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-4 px-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <p className="text-xs font-medium text-indigo-400 mb-3 uppercase tracking-widest">
            the struggle is real
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100 mb-3">
            You&apos;ve got links in, like, five different places.
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            And the worst part? They don&apos;t talk to each other. You saved
            that YouTube video in a playlist, the article in bookmarks, and the
            Reddit thread in Instagram. Good luck finding all three when you
            actually need them.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col gap-2"
        >
          {silos.map((silo) => (
            <div
              key={silo.label}
              className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3"
            >
              <span className="text-xs text-red-400">✗</span>
              <span className="text-sm text-zinc-500 line-through">
                {silo.label}
              </span>
              <span className="text-xs text-zinc-600 ml-auto hidden sm:inline">
                {silo.note}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-3 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-3 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
            <span className="text-xs text-indigo-400">✓</span>
            <span className="text-sm font-medium text-indigo-200">
              StashD — all of it, one place, finally 🎉
            </span>
          </div>
        </motion.div>
      </section>

      {/* ── WHAT IT IS ────────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-4 px-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <p className="text-xs font-medium text-indigo-400 mb-3 uppercase tracking-widest">
            so what is this thing?
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100 mb-3">
            Think of it as your personal corner of the internet. 🏠
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            StashD is where you drop any link — from anywhere — tag it, toss it
            into a collection, and find it again whenever. No platform
            restrictions, no chaos, no scrolling through history for twenty
            minutes going{" "}
            <span className="italic text-zinc-300">
              "I know I saved this somewhere..."
            </span>
          </p>
        </motion.div>

        {/* mock preview */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 shadow-[0_8px_30px_-20px_rgba(0,0,0,0.6)] flex flex-col gap-3"
          aria-hidden="true"
        >
          <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2">
            <Search size={14} className="text-zinc-500" />
            <span className="text-xs text-zinc-500">Search your links...</span>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {["All Links", "Exam Prep", "Work", "Recipes"].map((label, i) => (
              <span
                key={label}
                className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs ${
                  i === 0
                    ? "border-indigo-500 bg-indigo-500/15 text-indigo-200 shadow-[0_0_20px_rgba(99,102,241,0.25)]"
                    : "border-zinc-800 bg-zinc-900/60 text-zinc-400"
                }`}
              >
                {label}
              </span>
            ))}
          </div>
          {[
            {
              title: "How compilers work — YouTube",
              url: "youtube.com/watch?v=...",
            },
            {
              title: "Best sourdough recipe",
              url: "seriouseats.com/sourdough",
            },
            { title: "OS: Three Easy Pieces (free PDF)", url: "ostep.org" },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3 flex items-center gap-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-indigo-300">
                <Link2 size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-100 truncate">
                  {item.title}
                </p>
                <p className="text-xs text-zinc-500 truncate">{item.url}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-5 px-2">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-medium text-indigo-400 mb-3 uppercase tracking-widest">
            the good stuff
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
            Everything you&apos;d want. Nothing weird.
          </h2>
        </motion.div>

        <motion.div
          variants={STAGGER.container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex flex-col gap-3"
        >
          {features.map(({ icon: Icon, title, description, incoming }) => (
            <motion.div
              key={title}
              variants={STAGGER.item}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 flex items-start gap-4 shadow-[0_8px_30px_-20px_rgba(0,0,0,0.6)] transition hover:border-indigo-500/30"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-indigo-300">
                <Icon size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-100 mb-1">
                  {title}
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {description}
                </p>
              </div>
              {/*  if it's an incoming feature, show an arrow on the right */}
              {incoming && (
                <div className="ml-auto flex items-center text-orange-400">
                  <span className="text-xs">coming soon</span>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── SHARE HIGHLIGHT ───────────────────────────────────────────────── */}
      {/* todo: Uncomment this after share feature gets introduced */}
      {/* <section className="px-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-6 flex flex-col gap-4 shadow-[0_0_40px_-20px_rgba(99,102,241,0.4)]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
            <Share2 size={22} />
          </div>

          <div>
            <p className="text-xs font-medium text-indigo-400 mb-2 uppercase tracking-widest">
              okay this one slaps 🔥
            </p>
            <h3 className="text-xl font-bold tracking-tight text-zinc-100 mb-3">
              Share a whole collection with one link.
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Imagine spending a week collecting the best resources for your OS
              exam. Textbook chapters, YouTube explanations, that one Reddit
              thread that actually made sense. Your friend asks what you used.
            </p>
            <p className="text-sm text-zinc-300 leading-relaxed mt-2 font-medium">
              You send one link. They get all of it. No copy-pasting ten URLs
              into a message. No account needed on their end. Just vibes. ✨
            </p>
          </div>

          <div>
            <p className="text-xs text-zinc-500 mb-2">works great for...</p>
            <div className="flex flex-wrap gap-2">
              {useCases.map(({ emoji, label }) => (
                <span
                  key={label}
                  className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-400"
                >
                  {emoji} {label}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </section> */}

      {/* ── CLOSER ────────────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-4 px-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="flex flex-col gap-3"
        >
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
            So yeah — no more lost links. 🎉
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Took about five seconds to get the idea when I built this. If
            you&apos;ve ever gone{" "}
            <span className="italic text-zinc-300">
              "ugh I know I saved that somewhere"
            </span>{" "}
            — this is for you. Genuinely.
          </p>
          <p className="text-sm text-zinc-400 leading-relaxed">
            It&apos;s free. It&apos;s simple. And it actually works.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="flex flex-col items-center gap-3 pt-2"
        >
          <Link
            href="/auth/signup"
            className="w-full sm:w-1/2 flex items-center justify-center rounded-full border border-indigo-500/60 bg-indigo-500 py-3 text-sm font-semibold text-white shadow-[0_20px_50px_-20px_rgba(99,102,241,0.9)] transition hover:brightness-110"
          >
            Let&apos;s go 🚀
          </Link>
          <Link
            href="/auth/login"
            className="w-full sm:w-1/2 flex items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/60 py-3 text-sm font-semibold text-zinc-400 transition hover:text-zinc-200"
          >
            Already have an account? Sign in
          </Link>
        </motion.div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="pt-4 text-center text-xs text-zinc-600 flex flex-col gap-1">
        <p>Built with StashD © 2026.</p>
        <p>
          Open source ·{" "}
          <a
            href="https://github.com/sri-nivas1227"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-zinc-300 transition"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
