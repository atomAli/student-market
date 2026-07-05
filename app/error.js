"use client";
export default function Error({ error, reset }) {
  return (
    <div className="text-center py-20 text-slate-500">
      <p className="mb-4">Something went wrong</p>
      <button onClick={() => reset()} className="text-indigo-600 hover:underline font-medium">
        Try again
      </button>
    </div>
  );
}
