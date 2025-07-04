'use client';
import { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";

export default function EmployeeSidebar({
  typeFilter,
  setTypeFilter,
}: {
  typeFilter: string;
  setTypeFilter: Dispatch<SetStateAction<string>>;
}) {
  const router = useRouter();

  
  return (
    <aside className="w-64 bg-gray-100 p-6 border-r">
      <h2 className="font-bold mb-4">Filters</h2>
      <div className="mb-4">
        <label className="block mb-2">Job Type</label>
        <select
          className="w-full border rounded p-2"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
        </select>
      </div>
      {/* Add more filter controls here as needed */}
      <button
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          onClick={() => router.push("/candidate/profile/create-profile")}
          
        >
          Create Candidate Profile
        </button>

      <button
        className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        onClick={() => router.push("/candidate/profile/display-profile")}
      >
        Go to Candidate Profile
      </button>
    </aside>
  );
}