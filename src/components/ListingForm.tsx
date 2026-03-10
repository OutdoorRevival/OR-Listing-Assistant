import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Copy, Check, RefreshCw, Mountain, Info } from 'lucide-react';
import { generateListing, ListingSuggestion } from '../services/gemini';

type Condition = 'Fair' | 'Good' | 'Like New';

export default function ListingForm() {
  const [productName, setProductName] = useState('');
  const [condition, setCondition] = useState<Condition>('Good');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<ListingSuggestion | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;

    setLoading(true);
    try {
      const result = await generateListing(productName, condition);
      setSuggestion(result);
    } catch (error) {
      console.error('Error generating listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center mb-2">
            <img 
              src="https://sharetribe-assets.imgix.net/68f6a2f1-2d55-442f-8ff6-3d8850eb5021/raw/47/e1b42d122ec53116f7112f312d3a3e7674935c?auto=format&fit=clip&h=96&w=640&s=b66f6edfb24bf2df833ef6ed196f8dc4" 
              alt="Outdoor Revival Logo" 
              className="h-[72px] w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-4xl font-sans font-bold tracking-tight text-stone-900">
            Listing Assistant
          </h1>
          <p className="text-stone-500 max-w-2xl mx-auto text-sm leading-relaxed">
            Let our AI-powered listing assistant do the work for you: it suggests a Title, Description, Category, and Price Range. 
            Use its recommendations as a guide to{' '}
            <a 
              href="https://outdoorrevival.co.uk/l/draft/00000000-0000-0000-0000-000000000000/new/details" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-brand-green font-semibold underline underline-offset-4 hover:text-stone-900 transition-colors"
            >
              create your own listing
            </a>.
          </p>
        </header>

        <form onSubmit={handleGenerate} className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 space-y-6">
          <div className="space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <label className="text-sm font-bold uppercase tracking-wider text-stone-600">
                Product Name & Details
              </label>
              <span className="text-xs text-stone-400 font-medium italic">
                Include brand, model, gender, and size if known for better results.
              </span>
            </div>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Rab Microlight Alpine Women's Jacket Size 12 Blue"
              className="w-full px-4 py-4 rounded-xl border border-stone-200 focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all text-stone-800 placeholder:text-stone-300"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold uppercase tracking-wider text-stone-600">Condition</label>
            <div className="flex gap-3">
              {(['Fair', 'Good', 'Like New'] as Condition[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCondition(c)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all border ${
                    condition === c
                      ? 'bg-brand-green border-brand-green text-white shadow-md shadow-brand-green/10'
                      : 'bg-white border-stone-200 text-stone-600 hover:border-brand-green/20 hover:bg-brand-green/5'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                setProductName('');
                setSuggestion(null);
              }}
              className="px-8 py-4 bg-stone-100 text-stone-600 rounded-2xl font-semibold hover:bg-stone-200 transition-all active:scale-[0.98]"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading || !productName.trim()}
              className="flex-1 py-4 bg-stone-900 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {loading ? (
                <RefreshCw className="animate-spin" size={20} />
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate Listing
                </>
              )}
            </button>
          </div>
        </form>

        <AnimatePresence mode="wait">
          {suggestion && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Title Card */}
                <div className="md:col-span-2 bg-white rounded-3xl border border-stone-100 p-6 space-y-3 relative group">
                  <div className="flex justify-between items-start">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Suggested Title</label>
                    <button 
                      onClick={() => copyToClipboard(suggestion.title, 'title')}
                      className="p-2 hover:bg-stone-50 rounded-lg text-stone-400 hover:text-brand-green transition-colors"
                    >
                      {copied === 'title' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-xl font-medium text-stone-900 leading-tight">
                    {suggestion.title}
                  </p>
                </div>

                {/* Price Card */}
                <div className="bg-brand-green/5 rounded-3xl border border-brand-green/10 p-6 space-y-3 relative group">
                  <div className="flex justify-between items-start">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-green">Suggested Price</label>
                    <button 
                      onClick={() => copyToClipboard(suggestion.suggestedPrice, 'price')}
                      className="p-2 hover:bg-white/50 rounded-lg text-brand-green/40 hover:text-brand-green transition-colors"
                    >
                      {copied === 'price' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-3xl font-sans font-bold text-brand-green leading-tight">
                    {suggestion.suggestedPrice}
                  </p>
                  <p className="text-[9px] text-brand-green/70 font-medium">
                    Based on RRP, condition & market trends
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {/* Category Card */}
                <div className="bg-white rounded-3xl border border-stone-100 p-6 space-y-3 relative group">
                  <div className="flex justify-between items-start">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Suggested Category Path</label>
                    <button 
                      onClick={() => copyToClipboard(suggestion.category, 'category')}
                      className="p-2 hover:bg-stone-50 rounded-lg text-stone-400 hover:text-brand-green transition-colors"
                    >
                      {copied === 'category' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    {suggestion.category.split(' > ').map((part, i, arr) => (
                      <React.Fragment key={i}>
                        <span className="px-3 py-1 bg-stone-50 text-stone-700 rounded-full text-sm font-medium border border-stone-100">
                          {part}
                        </span>
                        {i < arr.length - 1 && <span className="text-stone-300 text-xs">/</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description Card */}
              <div className="bg-white rounded-3xl border border-stone-100 p-8 space-y-4 relative group">
                <div className="flex justify-between items-start">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Detailed Description</label>
                  <button 
                    onClick={() => copyToClipboard(suggestion.description, 'description')}
                    className="p-2 hover:bg-stone-50 rounded-lg text-stone-400 hover:text-brand-green transition-colors"
                  >
                    {copied === 'description' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="prose prose-stone max-w-none">
                  <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">
                    {suggestion.description}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
