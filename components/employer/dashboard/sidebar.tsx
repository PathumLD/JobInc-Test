'use client';
import { Dispatch, SetStateAction } from "react";

export default function EmployerSidebar({
  typeFilter,
  setTypeFilter,
}: {
  typeFilter: string;
  setTypeFilter: Dispatch<SetStateAction<string>>;
}) {
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
    </aside>
  );
}