'use client';

import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import JobCard, { Job } from "./job-card";
import Fuse from "fuse.js";
import { Search, Filter, RotateCcw, Star, Briefcase } from "lucide-react";

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

  // Handle Enter key press for search
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
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

  const hasActiveFilters = search || typeFilter;
  const totalResults = filteredJobs.length;

  return (
    <section className="mt-8">
      {/* Search and Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Find Your Perfect Job</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          {/* Search Input */}
          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Jobs
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Job title, company, or keywords..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Job Type Filter */}
          <div className="min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Type
            </label>
            <select
              className="h-10 px-3 border border-gray-300 rounded-md focus:border-green-500 focus:ring-green-500 bg-white text-sm min-w-[140px]"
              value={typeInput}
              onChange={(e) => setTypeInput(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handleSearch}
              className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-200"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                onClick={resetFilters}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">Active filters:</span>
              {search && (
                <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs border border-green-200">
                  Search: "{search}"
                </span>
              )}
              {typeFilter && (
                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs border border-blue-200">
                  Type: {typeFilter}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-gray-600">
          <Briefcase className="h-5 w-5" />
          <span className="font-medium">
            {hasActiveFilters ? `${totalResults} jobs found` : `${mockJobs.length} total jobs`}
          </span>
        </div>
      </div>

      {/* Recommendations Section */}
      {search === "" && recommendedJobs.length > 0 && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Recommended for You</h3>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                Based on your search history
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedJobs.slice(0, 6).map((job) => (
                <JobCard key={`rec-${job.id}`} job={job} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.length === 0 ? (
          <div className="col-span-full">
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search criteria or clearing filters
              </p>
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  onClick={resetFilters}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))
        )}
      </div>
    </section>
  );
}