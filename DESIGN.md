# FairPay Design Documentation

## Design Philosophy
"The contract IS the agreement — the UI just makes it legible." The frontend bridges the complex, immutable on-chain state into a highly readable, approachable, and actionable format for both crypto-natives and newcomers.

## Color System
- **Active/funded**: Blue (`#2563EB`)
- **Milestone complete / released**: Green (`#16a34a`)
- **In dispute**: Amber (`#d97706`)
- **Defaulted / cancelled**: Red (`#dc2626`)
- **Pending 48h window**: Purple (`#7c3aed`)

## Typography
- **Body & Headings**: Geist
- **Addresses & Hashes**: Geist Mono

## Components & Framer Motion Strategy
- **shadcn/ui**: Base layer providing Button, Card, Dialog, Slider, Tabs, Toast, Badge, Progress, Input.
- **Contract Creation Wizard**: Multi-step Framer Motion `AnimatePresence` slide transitions (`x: 100` -> `0` -> `-100`).
- **Milestone Timeline**: Staggered vertical reveals (`delay: i * 0.1`) smoothly exposing milestone states as user scrolls.
- **Funds Release**: Satisfying green "explosion" particle effect on milestone release success to provide psychological reward.
- **Dispute State**: Continuous amber pulse (`scale/opacity` loop) during the 48h dispute window indicating urgency without panic.
- **Reputation NFT**: Card-flip reveal using 3D transforms upon contract completion, turning a hidden card into a shiny credential.

## Dashboard Layouts
**Mobile Strategy**: Mobile-first design optimized for 375px rendering. Wide tables collapse into stacked cards with horizontal scroll for complex data like IPFS history.
**Dark Mode**: Default dark theme using Tailwind dark mode classes with a crisp, low-contrast UI aesthetic. Effortlessly toggleable to light mode.

**Client View**: Emphasizes reviewing deliverables, approving tasks, and monitoring total value locked. Displays a clear call-to-action out front to authorize the next release boundary.
**Freelancer View**: Emphasizes submitting work packages, dynamic countdown timers leading up to default payouts, and an unambiguous visualization of locked vs released payments.
