import ReputationCard from "@/components/reputation/ReputationCard";
import NFTReveal from "@/components/reputation/NFTReveal";

export default function ProfilePage({ params }: { params: { address: string } }) {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <header className="mb-12 text-center flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-primary/10 text-primary flex items-center justify-center rounded-full mb-6 border border-primary/20 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent"></div>
            <svg className="w-12 h-12 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        </div>
        <h1 className="text-3xl font-bold font-mono tracking-tight">{params.address}</h1>
        <p className="text-muted-foreground mt-3 font-semibold uppercase tracking-widest text-xs">Verified On-Chain Resume</p>
      </header>

      <ReputationCard address={params.address} />

      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-8 tracking-tight">Recent Soulbound Credentials</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <NFTReveal index={1} />
          <NFTReveal index={2} delay={0.2} />
          <NFTReveal index={3} delay={0.4} />
        </div>
      </div>
    </div>
  );
}
