/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import ListingForm from './components/ListingForm';

export default function App() {
  return (
    <div className="min-h-screen bg-[#fcfbf9] selection:bg-emerald-100 selection:text-emerald-900">
      <main className="py-12">
        <ListingForm />
      </main>
      
      <footer className="py-12 border-t border-stone-100">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
          <p className="text-stone-400 text-xs font-medium uppercase tracking-[0.2em]">
            Powered by Outdoor Revival & Google Gemini
          </p>
          <div className="flex justify-center gap-6 text-stone-300">
            <a href="https://outdoorrevival.co.uk" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 transition-colors text-sm font-medium">
              Visit Outdoor Revival
            </a>
            <span className="text-stone-200">|</span>
            <a href="https://outdoorrevival.co.uk/s" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 transition-colors text-sm font-medium">
              Browse Listings
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

