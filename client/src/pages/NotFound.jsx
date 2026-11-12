import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="text-6xl font-black text-indigo-600">404</div>
        <h2 className="text-2xl font-bold text-slate-800">Page not found</h2>
        <p className="text-sm text-slate-500">
          The requested page does not exist or may have been relocated.
        </p>
        <div className="pt-2">
          <Link to="/">
            <Button variant="primary">
              <Home className="w-4 h-4 mr-1.5" /> Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
