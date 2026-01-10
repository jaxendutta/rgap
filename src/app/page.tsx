import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-24">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-5xl font-bold text-gray-900">
          Research Grant Analytics Platform
        </h1>

        <p className="text-xl text-gray-600">
          Comprehensive analytics for Canadian research grants from NSERC, CIHR, and SSHRC
        </p>

        <div className="flex gap-4 justify-center mt-8">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>

          <Link
            href="/auth/login"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Sign In
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Comprehensive Data</h3>
            <p className="text-gray-600">
              Access to 230,000+ grant records from Canada's three major funding agencies
            </p>
          </div>

          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
            <p className="text-gray-600">
              Powerful search, filtering, and visualization tools for funding insights
            </p>
          </div>

          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Track & Compare</h3>
            <p className="text-gray-600">
              Bookmark grants and compare funding across institutions and programs
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
