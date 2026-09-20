import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

export default function NotFoundPage() {
  return (
    <MainLayout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 sm:px-6 text-center">
        <p className="text-6xl font-bold text-primary-light">404</p>
        <h1 className="text-2xl font-bold text-ink mt-4">Page not found</h1>
        <p className="text-muted mt-2 max-w-sm">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <Link
          to="/"
          className="mt-6 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-primary-dark transition-colors"
        >
          Back to home
        </Link>
      </div>
    </MainLayout>
  );
}
