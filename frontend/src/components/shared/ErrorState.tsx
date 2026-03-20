export const ErrorState = ({ message }: { message: string }) => (
  <div className="container mx-auto px-4 py-20 text-center">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 text-destructive mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
      </svg>
    </div>
    <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
    <p className="text-muted-foreground">{message}</p>
    <button 
      onClick={() => window.location.reload()}
      className="mt-8 px-6 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
    >
      Try Again
    </button>
  </div>
);
