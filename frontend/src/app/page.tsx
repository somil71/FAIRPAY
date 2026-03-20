import Link from 'next/link';

const features = [
  {
    icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
    title: "Automated Verification",
    desc: "Funds release automatically when a GitHub commit or IPFS hash matches the milestone requirement. Zero manual approval needed.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6",
    title: "Partial Disputes",
    desc: "Don't freeze the whole payment. Dispute only the exact percentage of work left undone. Fair for both sides.",
    gradient: "from-amber-500/20 to-orange-500/20",
    border: "border-amber-500/20",
    iconColor: "text-amber-400",
  },
  {
    icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
    title: "Portable Reputation",
    desc: "Earn soulbound NFTs for every completed job. Build a verified, tamper-proof on-chain resume that travels with you.",
    gradient: "from-purple-500/20 to-indigo-500/20",
    border: "border-purple-500/20",
    iconColor: "text-purple-400",
  },
];

const stats = [
  { value: "0%", label: "Platform Fees" },
  { value: "48h", label: "Auto-Release" },
  { value: "100%", label: "On-Chain" },
];

export default function Home() {
  return (
    <div className="relative">
      {/* Background effects */}
      <div className="absolute inset-0 gradient-bg grid-pattern opacity-50 pointer-events-none" />

      {/* Hero */}
      <section className="relative container mx-auto px-4 pt-24 pb-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/50 border border-border/50 text-xs font-semibold text-accent-foreground mb-8 animate-in">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Live on Sepolia Testnet
        </div>

        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.1] mb-6 animate-in" style={{animationDelay: '0.1s'}}>
          Get paid for every milestone
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            — automatically
          </span>
        </h1>

        <p className="max-w-2xl text-lg text-muted-foreground mb-12 leading-relaxed animate-in" style={{animationDelay: '0.2s'}}>
          FairPay replaces trust with math. Programmable smart escrows, verifiable milestones,
          and automatic releases. No platform cuts. No ghosting.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20 animate-in" style={{animationDelay: '0.3s'}}>
          <Link
            href="/contracts/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 h-12 px-8 glow-primary transition-all duration-300 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create your first contract
          </Link>
          <Link
            href="/jobs"
            className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold border border-border/50 bg-card/50 hover:bg-accent/50 hover:border-border h-12 px-8 transition-all duration-300"
          >
            Browse open jobs
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-12 animate-in" style={{animationDelay: '0.4s'}}>
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">{s.value}</div>
              <div className="text-xs text-muted-foreground font-medium mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative container mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`group relative rounded-2xl p-6 bg-gradient-to-b ${f.gradient} border ${f.border} hover:scale-[1.02] transition-all duration-300 animate-in`}
              style={{animationDelay: `${0.5 + i * 0.1}s`}}
            >
              <div className={`w-10 h-10 rounded-xl bg-card/80 border border-border/50 flex items-center justify-center mb-4 ${f.iconColor}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
