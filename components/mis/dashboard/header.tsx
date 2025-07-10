'use client';


export default function MisHeader({ userName, role, onLogout }: { userName: string | null, role: string | null, onLogout: () => void }) {
  return (
    <nav className="w-full bg-white shadow px-8 py-4 flex items-center justify-between">
      <div className="text-2xl font-bold">MIS Dashboard</div>
      <div className="flex items-center gap-4">
        <span className="text-lg">
          {role && (
            <span className="mr-2 text-blue-600 font-semibold capitalize">
              {role}
            </span>
          )}
          {userName ? `Welcome ${userName}` : 'Welcome'}
        </span>
        <button
          className="border px-4 py-2 rounded hover:bg-gray-100"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}