'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";

export type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  type: string;
};

export default function JobView({ job }: { job: Job }) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Save job logic (e.g., localStorage or API)
    setSaved(true);
  };

  const handleApply = () => {
    // Apply logic (e.g., redirect to application form or API call)
    alert("Application submitted!");
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
      <p className="text-gray-700 mb-1">{job.company} — {job.location}</p>
      <p className="text-gray-600 mb-2">{job.type}</p>
      <p className="text-gray-500 mb-4">{job.description}</p>
      <div className="flex gap-4">
        <Button onClick={handleApply}>Apply</Button>
        <Button variant={saved ? "outline" : "default"} onClick={handleSave} disabled={saved}>
          {saved ? "Saved" : "Save"}
        </Button>
      </div>
    </div>
  );
}