import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-brand-surface flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="text-brand-accent text-4xl font-bold">Ziyafat</div>
        <p className="text-on-surface-medium">Catering management for Hyderabadi caterers</p>
        <Link
          href="/login"
          className="inline-block bg-brand-accent text-brand-accent-fg px-6 py-2 rounded-lg font-semibold hover:opacity-90"
        >
          Sign In
        </Link>
        <p className="text-on-surface-lowest text-xs">Full landing page coming in Plan 6</p>
      </div>
    </main>
  );
}
