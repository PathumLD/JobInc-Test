import { Button } from "@/components/ui/button";
import Link from "next/link";

export type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  type: string;
  postedAt: string;
};

export default function JobCard({ job }: { job: Job }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
      <h3 className="text-xl font-bold">{job.title}</h3>
      <p className="text-gray-700">{job.company} — {job.location}</p>
      <p className="text-gray-600">{job.type}</p>
      <p className="text-gray-500 text-sm">Posted at : {new Date(job.postedAt).toLocaleDateString()}</p>
      <p className="text-gray-500">{job.description}</p>
      <Link href={`/job/${job.id}`}>
          <Button>Apply</Button>
        </Link>
    </div>
  );
}