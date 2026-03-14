import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Copy, Check, RefreshCw, Mountain, Info, ExternalLink, Camera, Loader2 } from 'lucide-react';
import { generateListing, ListingSuggestion, recognizeProductFromImage } from '../services/gemini';

type Condition = 'Fair' | 'Good' | 'Like New' | 'Brand New';

export default function ListingForm() {
  const [productName, setProductName] = useState('');
  const [condition, setCondition] = useState<Condition>('Good');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<ListingSuggestion | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [recognizing, setRecognizing] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRecognizing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        const mimeType = file.type;
        
        try {
          const identifiedName = await recognizeProductFromImage(base64String, mimeType);
          if (identifiedName) {
            setProductName(identifiedName);
          } else {
            setError("Could not identify the item. Please try entering the name manually.");
          }
        } catch (err) {
          console.error('Error recognizing image:', err);
          setError(err instanceof Error ? err.message : 'Failed to recognize image.');
        } finally {
          setRecognizing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File reading error:', err);
      setError('Failed to read image file.');
      setRecognizing(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const result = await generateListing(productName, condition);
      setSuggestion(result);
    } catch (err) {
      console.error('Error generating listing:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
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
    <div className="min-h-screen bg-[#fcfcf9] selection:bg-brand-orange/30">
      <div className="max-w-4xl mx-auto p-6 md:p-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <header className="text-center space-y-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center"
            >
              <img 
                src="https://sharetribe-assets.imgix.net/68f6a2f1-2d55-442f-8ff6-3d8850eb5021/raw/47/e1b42d122ec53116f7112f312d3a3e7674935c?auto=format&fit=clip&h=96&w=640&s=b66f6edfb24bf2df833ef6ed196f8dc4" 
                alt="Outdoor Revival Logo" 
                className="h-20 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <div className="space-y-2">
              <h1 className="text-5xl font-sans font-black tracking-tight text-stone-900 italic">
                Listing <span className="text-brand-orange">Assistant</span>
              </h1>
              <div className="h-1 w-24 bg-brand-orange mx-auto rounded-full" />
            </div>
            <p className="text-stone-500 max-w-2xl mx-auto text-sm leading-relaxed font-medium">
              Our AI-powered assistant helps you create listing content for your pre-owned outdoor gear: enter a product name or upload a photo to generate suggested details like Title, Description, Category, and Price Range. 
              Use its recommendations as a guide to{' '}
              <a 
                href="https://outdoorrevival.co.uk/l/draft/00000000-0000-0000-0000-000000000000/new/details" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-brand-orange font-semibold underline underline-offset-4 hover:text-stone-900 transition-colors"
              >
                create your own listing
              </a>.
            </p>
          </header>

          <form onSubmit={handleGenerate} className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 p-10 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-orange to-brand-orange-dark" />
            
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
                <label className="text-xs font-bold tracking-wider text-stone-900">
                  1. Identify Your Gear
                </label>
                <span className="text-[10px] text-stone-400 font-bold tracking-wider">
                  Include brand, model, gender, and size if known for better results.
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <textarea
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        e.currentTarget.form?.requestSubmit();
                      }
                    }}
                    placeholder="e.g. Rab Microlight Alpine Women's Jacket Size 12 Blue"
                    className="w-full px-6 py-6 sm:py-5 rounded-2xl border-2 border-stone-100 bg-stone-100/50 focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none transition-all text-stone-800 placeholder:text-stone-400 font-medium text-lg resize-none min-h-[120px] sm:min-h-[64px] hover:border-stone-200"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={recognizing}
                  className="flex flex-col items-center justify-center gap-2 px-4 py-5 sm:py-3 bg-white border-2 border-stone-100 rounded-2xl text-stone-600 hover:text-brand-orange hover:border-brand-orange/30 hover:shadow-lg hover:shadow-brand-orange/5 transition-all disabled:opacity-50 group/btn sm:w-32 shrink-0"
                >
                  {recognizing ? (
                    <Loader2 className="animate-spin text-brand-orange" size={20} />
                  ) : (
                    <Camera size={20} className="group-hover/btn:scale-110 transition-transform" />
                  )}
                  <span className="text-[10px] font-bold tracking-widest uppercase text-center leading-tight">
                    or upload<br />photo
                  </span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                  capture="environment"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold tracking-wider text-stone-900">2. Select Condition</label>
              <div className="grid grid-cols-2 sm:flex gap-3 sm:gap-4">
                {(['Fair', 'Good', 'Like New', 'Brand New'] as Condition[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCondition(c)}
                    className={`flex-1 py-4 rounded-2xl text-sm font-bold tracking-widest transition-all border-2 ${
                      condition === c
                        ? 'bg-stone-900 border-stone-900 text-white shadow-xl shadow-stone-900/20 scale-[1.02]'
                        : 'bg-white border-stone-100 text-stone-400 hover:border-stone-200 hover:text-stone-600'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || !productName.trim()}
                className="w-full sm:flex-1 py-8 px-6 bg-brand-orange text-white rounded-2xl font-bold tracking-widest flex flex-col items-center justify-center text-center leading-tight hover:bg-brand-orange-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-xl shadow-brand-orange/20"
              >
                {loading ? (
                  'Getting Suggestions...'
                ) : (
                  <>
                    <span>GET LISTING</span>
                    <span>SUGGESTIONS</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setProductName('');
                  setSuggestion(null);
                  setError(null);
                }}
                className="px-10 py-5 bg-stone-50 text-stone-400 rounded-2xl font-bold tracking-widest text-xs hover:bg-stone-100 hover:text-stone-600 transition-all active:scale-[0.98]"
              >
                Reset
              </button>
            </div>
          </form>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3 text-red-800"
            >
              <Info className="shrink-0 mt-0.5" size={18} />
              <div className="space-y-1">
                <p className="text-sm font-bold">Generation Failed</p>
                <p className="text-xs leading-relaxed opacity-90">{error}</p>
                {(error.includes('API Key') || error.includes('GEMINI_API_KEY')) && (
                  <p className="text-[10px] mt-2 font-medium bg-red-100/50 px-2 py-1 rounded inline-block">
                    Tip: Ensure GEMINI_API_KEY is set in your Vercel Environment Variables.
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {suggestion && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Title Card */}
                <div className="md:col-span-2 bg-white rounded-[2rem] border border-stone-100 p-8 space-y-4 relative group shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <label className="text-xs font-bold tracking-wider text-stone-900">Suggested Title</label>
                    <button 
                      onClick={() => copyToClipboard(suggestion.title, 'title')}
                      className="p-2.5 hover:bg-stone-50 rounded-xl text-stone-300 hover:text-brand-orange transition-colors"
                    >
                      {copied === 'title' ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                  <p className="text-2xl font-sans font-bold text-stone-900 leading-tight">
                    {suggestion.title}
                  </p>
                </div>

                {/* Price Card */}
                <div className="bg-brand-orange/5 rounded-[2rem] border border-brand-orange/10 p-8 space-y-4 relative group shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <label className="text-xs font-bold tracking-wider text-stone-900">Suggested Price</label>
                    <button 
                      onClick={() => copyToClipboard(suggestion.suggestedPrice, 'price')}
                      className="p-2.5 hover:bg-white/50 rounded-xl text-brand-orange/40 hover:text-brand-orange transition-colors"
                    >
                      {copied === 'price' ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                  <p className="text-4xl font-sans font-black text-brand-orange leading-tight">
                    {suggestion.suggestedPrice}
                  </p>
                  <p className="text-[10px] text-brand-orange/60 font-bold tracking-wider">
                    Market Value Estimate
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {/* Category Card */}
                <div className="bg-white rounded-[2rem] border border-stone-100 p-8 space-y-4 relative group shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <label className="text-xs font-bold tracking-wider text-stone-900">Suggested Category Path</label>
                    <button 
                      onClick={() => copyToClipboard(suggestion.category, 'category')}
                      className="p-2.5 hover:bg-stone-50 rounded-xl text-stone-300 hover:text-brand-orange transition-colors"
                    >
                      {copied === 'category' ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3 items-center">
                    {suggestion.category.split(' > ').map((part, i, arr) => (
                      <React.Fragment key={i}>
                        <span className="px-5 py-2 bg-stone-50 text-stone-700 rounded-2xl text-sm font-bold border border-stone-100 tracking-wider">
                          {part}
                        </span>
                        {i < arr.length - 1 && <span className="text-stone-200 font-black">/</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description Card */}
              <div className="bg-white rounded-[2rem] border border-stone-100 p-10 space-y-6 relative group shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <label className="text-xs font-bold tracking-wider text-stone-900">Description Suggestion</label>
                  <button 
                    onClick={() => copyToClipboard(suggestion.description, 'description')}
                    className="p-2.5 hover:bg-stone-50 rounded-xl text-stone-300 hover:text-brand-orange transition-colors"
                  >
                    {copied === 'description' ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                <div className="prose prose-stone max-w-none">
                  <p className="text-stone-700 leading-loose whitespace-pre-wrap font-medium text-base">
                    {suggestion.description}
                  </p>
                </div>
              </div>

              <div className="pt-12 text-center space-y-8">
                <div className="space-y-2">
                  <p className="text-stone-900 font-bold text-2xl italic">Ready to sell?</p>
                  <p className="text-stone-500 text-sm font-medium">
                    You can now copy and paste the suggested content directly into your listing.
                  </p>
                </div>
                <a 
                  href="https://outdoorrevival.co.uk/l/draft/00000000-0000-0000-0000-000000000000/new/details"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-12 py-6 bg-brand-orange text-white rounded-2xl font-bold tracking-widest hover:bg-brand-orange-dark transition-all active:scale-[0.98] shadow-2xl shadow-brand-orange/30 group"
                >
                  Create Listing
                  <ExternalLink size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  </div>
  );
}
