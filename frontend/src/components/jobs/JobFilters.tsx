'use client';

export default function JobFilters({ onFilter }: { onFilter: (query: string) => void }) {
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (value === 'all') {
      onFilter('');
    } else {
      onFilter(`${name}=${value}`);
    }
  };

  return (
    <div className="border rounded-xl p-6 bg-card/50 shadow-sm sticky top-24">
      <h3 className="font-bold mb-6 tracking-wider uppercase text-xs text-muted-foreground">Filter Listings</h3>
      
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-3 tracking-tight">Work Type</label>
        <select 
          name="workType"
          onChange={handleChange}
          className="w-full p-2.5 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none text-sm font-medium"
        >
          <option value="all">All Categories</option>
          <option value="dev">Development / Code</option>
          <option value="design">UI/UX Design</option>
          <option value="audit">Smart Contract Audit</option>
        </select>
      </div>

      <div className="mb-6 invisible">
        <label className="block text-sm font-semibold mb-3 tracking-tight">Verification Method</label>
        <select className="w-full p-2.5 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none text-sm font-medium">
          <option value="all">Any Method</option>
          <option value="github">Automated (GitHub/Git)</option>
          <option value="ipfs">IPFS File Verification</option>
          <option value="multisig">Manual MultiSig Check</option>
        </select>
      </div>
    </div>
  );
}
