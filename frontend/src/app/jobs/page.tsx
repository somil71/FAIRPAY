'use client';

import { useState, useEffect } from "react";
import JobFilters from "@/components/jobs/JobFilters";
import JobCard from "@/components/jobs/JobCard";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = async (queryString = "") => {
    try {
      setIsLoading(true);
      const url = queryString ? `/api/jobs?${queryString}` : "/api/jobs";
      const response = await fetch(url);
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error("Failed to fetch jobs", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8 max-w-6xl">
      <aside className="w-full lg:w-1/4">
        <JobFilters onFilter={(query) => fetchJobs(query)} />
      </aside>
      <main className="flex-1 space-y-5">
        <h1 className="text-3xl font-bold mb-8 tracking-tight">Verified Job Board</h1>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-40 bg-muted animate-pulse rounded-xl"></div>)}
          </div>
        ) : jobs.length > 0 ? (
          jobs.map(job => <JobCard key={job.id} job={job} />)
        ) : (
          <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
            <p className="text-muted-foreground font-medium">No open jobs found. Try adjusting your filters.</p>
          </div>
        )}
      </main>
    </div>
  );
}
