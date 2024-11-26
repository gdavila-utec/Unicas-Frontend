'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md">
        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-6xl font-bold text-gray-900">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700">
            Página no encontrada
          </h2>
          <p className="text-gray-500">
            Lo sentimos, no pudimos encontrar la página que estás buscando.
          </p>
        </div>

        {/* Illustration */}
        <div className="my-8">
          <svg
            className="w-64 h-64 mx-auto"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <circle cx="12" cy="12" r="11" className="text-gray-200" />
            <path
              d="M8 8L16 16M8 16L16 8"
              strokeWidth="2"
              className="text-gray-400"
            />
          </svg>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <ArrowLeft size={20} />
            Regresar
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Home size={20} />
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );
}