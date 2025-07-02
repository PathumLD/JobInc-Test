'use client';

import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import JobCard, { Job } from "./job-card";
import Fuse from "fuse.js";

// ...mockJobs array as in your code...
const mockJobs: Job[] = [
   {
    id: 1,
    title: "Frontend Developer",
    company: "TechNova",
    location: "Remote",
    type: "Full-time",
    postedAt: "2024-06-01",
    description: "Build and maintain UI components using React and TypeScript."
  },
  {
    id: 2,
    title: "Backend Engineer",
    company: "DataWorks",
    location: "New York, NY",
    type: "Full-time",
    postedAt: "2024-05-28",
    description: "Develop scalable APIs and services with Node.js and PostgreSQL."
  },
  {
    id: 3,
    title: "UI/UX Designer",
    company: "PixelPerfect",
    location: "San Francisco, CA",
    type: "Part-time",
    postedAt: "2024-06-03",
    description: "Design user interfaces and experiences for web and mobile apps."
  },
  {
    id: 4,
    title: "DevOps Engineer",
    company: "CloudSync",
    location: "Remote",
    type: "Full-time",
    postedAt: "2024-05-30",
    description: "Automate deployments and manage cloud infrastructure (AWS)."
  },
  {
    id: 5,
    title: "QA Tester",
    company: "QualityFirst",
    location: "Austin, TX",
    type: "Part-time",
    postedAt: "2024-06-02",
    description: "Test web applications and write automated test scripts."
  },
  {
    id: 6,
    title: "Mobile App Developer",
    company: "Appify",
    location: "Remote",
    type: "Full-time",
    postedAt: "2024-05-27",
    description: "Develop cross-platform mobile apps using React Native."
  },
  {
    id: 7,
    title: "Product Manager",
    company: "InnovateX",
    location: "Boston, MA",
    type: "Full-time",
    postedAt: "2024-06-04",
    description: "Lead product development and coordinate between teams."
  },
  {
    id: 8,
    title: "Technical Writer",
    company: "DocuMentor",
    location: "Remote",
    type: "Part-time",
    postedAt: "2024-05-29",
    description: "Create and maintain technical documentation for APIs."
  },
  {
    id: 9,
    title: "Full Stack Developer",
    company: "StackFlow",
    location: "Chicago, IL",
    type: "Full-time",
    postedAt: "2024-06-01",
    description: "Work on both frontend and backend of web applications."
  },
  {
    id: 10,
    title: "Data Scientist",
    company: "InsightAI",
    location: "Remote",
    type: "Full-time",
    postedAt: "2024-05-31",
    description: "Analyze data and build predictive models using Python."
  },
  {
    id: 11,
    title: "Support Engineer",
    company: "HelpDeskPro",
    location: "Denver, CO",
    type: "Part-time",
    postedAt: "2024-06-03",
    description: "Assist customers and troubleshoot technical issues."
  },
  {
    id: 12,
    title: "Security Analyst",
    company: "SecureNet",
    location: "Remote",
    type: "Full-time",
    postedAt: "2024-05-30",
    description: "Monitor and improve application and network security."
  },
  {
    id: 13,
    title: "Machine Learning Engineer",
    company: "MLWorks",
    location: "Seattle, WA",
    type: "Full-time",
    postedAt: "2024-06-02",
    description: "Deploy and optimize machine learning models in production."
  },
  {
    id: 14,
    title: "Business Analyst",
    company: "BizInsight",
    location: "Remote",
    type: "Part-time",
    postedAt: "2024-05-28",
    description: "Analyze business processes and recommend improvements."
  },
  {
    id: 15,
    title: "Web Designer",
    company: "CreativeWeb",
    location: "Los Angeles, CA",
    type: "Full-time",
    postedAt: "2024-06-04",
    description: "Design modern and responsive websites for clients."
  },
  {
    id: 16,
    title: "Product Manager",
    company: "FuelBack",
    location: "Colombo, SL",
    type: "Full-time",
    postedAt: "2025-04-04",
    description: "Lead product development and coordinate between teams."
  },
  {
    id: 17,
    title: "QA Engineer",
    company: "Quali - ty",
    location: "Austin, TX",
    type: "Part-time",
    postedAt: "2024-06-02",
    description: "Test web applications and write automated test scripts."
  },
  {
    id: 18,
    title: "Automation Engineer(Testing)",
    company: "Autonomous Tech",
    location: "Austin, TX",
    type: "Part-time",
    postedAt: "2024-06-02",
    description: "Test web applications and write automated test scripts."
  },
];

export default function JobList() {
  // FingerprintJS Pro
  const { data } = useVisitorData({ extendedResult: true }, { immediate: true });
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  useEffect(() => {
    if (data?.visitorId) setFingerprint(data.visitorId);
  }, [data]);

  // Search/filter state
  const [searchInput, setSearchInput] = useState("");
  const [typeInput, setTypeInput] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);

  // Save search term for this visitor
  const handleSearch = () => {
    setSearch(searchInput);
    setTypeFilter(typeInput);
    if (!fingerprint || !searchInput.trim()) return;
    const key = `job_search_history_${fingerprint}`;
    const prev = JSON.parse(localStorage.getItem(key) || '[]');
    if (!prev.includes(searchInput.trim())) {
      localStorage.setItem(key, JSON.stringify([...prev, searchInput.trim()]));
    }
  };

  // Fuse.js for fuzzy search
  const fuse = new Fuse(mockJobs, {
    keys: ['title', 'company', 'location', 'description', 'type'],
    threshold: 0.4,
  });

  // Filtered jobs (current search/filter)
  let filteredJobs = mockJobs;
  if (search) {
    filteredJobs = fuse.search(search).map(result => result.item);
  }
  if (typeFilter) {
    filteredJobs = filteredJobs.filter(job => job.type === typeFilter);
  }

  // Recommended jobs (fuzzy match for all previous search terms)
  useEffect(() => {
    if (!fingerprint) return;
    const key = `job_search_history_${fingerprint}`;
    const prev: string[] = JSON.parse(localStorage.getItem(key) || '[]');
    if (prev.length > 0) {
      const recommended = prev
        .flatMap(term => fuse.search(term).map(r => r.item))
        .filter((job, idx, arr) => arr.findIndex(j => j.id === job.id) === idx);
      setRecommendedJobs(recommended);
    } else {
      setRecommendedJobs([]);
    }
  }, [fingerprint, mockJobs]);

  // Reset filters
  const resetFilters = () => {
    setSearchInput("");
    setTypeInput("");
    setSearch("");
    setTypeFilter("");
  };

  return (
    <section className="mt-8">
      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <Input
          placeholder="Search jobs..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-1/4"
        />
        <select
          className="border rounded p-2"
          value={typeInput}
          onChange={(e) => setTypeInput(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
        </select>
        <Button onClick={handleSearch}>Search</Button>
        <Button variant="outline" onClick={resetFilters}>Reset Filters</Button>
      </div>

      {/* Recommendations: only show if not searching */}
      {search === "" && recommendedJobs.length > 0 && (
        <div className="mb-6 border-2 border-gray-300 rounded-lg p-4">
          <h3 className="font-bold mb-2">Recommended for you</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}

      {/* All Jobs (filtered or searched) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.length === 0 && (
          <div className="col-span-full text-center text-gray-500">No jobs found.</div>
        )}
        {filteredJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </section>
  );
}