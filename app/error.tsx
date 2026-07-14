'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Something went wrong!</h1>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={reset}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
