import React, { useState, useEffect } from 'react';
import { GOOGLE_SAMPLE, UNITY_SAMPLE } from './constants';
import { mergeSkAdNetworks, extractIds } from './services/skadnetwork';
import { analyzeConfigWithGemini } from './services/geminiService';
import { Button } from './components/Button';
import { type MergeResult, TabOption } from './types';
import { 
  ArrowRight, 
  Copy, 
  Trash2, 
  FileCode, 
  CheckCircle, 
  Bot, 
  Code2, 
  AlertCircle 
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabOption>(TabOption.MERGE);
  
  // Merge State
  const [baseInput, setBaseInput] = useState<string>(GOOGLE_SAMPLE);
  const [mergeInput, setMergeInput] = useState<string>(UNITY_SAMPLE);
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);
  
  // AI Analysis State
  const [aiInput, setAiInput] = useState<string>(UNITY_SAMPLE);
  const [aiOutput, setAiOutput] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // UI State
  const [showToast, setShowToast] = useState<boolean>(false);

  const handleMerge = () => {
    const result = mergeSkAdNetworks(baseInput, mergeInput);
    setMergeResult(result);
  };

  const handleClear = () => {
    setBaseInput('');
    setMergeInput('');
    setMergeResult(null);
  };

  const handleCopyResult = () => {
    if (mergeResult) {
      navigator.clipboard.writeText(mergeResult.mergedXml);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const handleAiAnalysis = async () => {
    setIsAiLoading(true);
    setAiError(null);
    setAiOutput('');
    try {
      const result = await analyzeConfigWithGemini(aiInput);
      setAiOutput(result);
    } catch (err) {
      setAiError("Failed to analyze. Ensure API_KEY is set in environment or try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
              SKAdNetwork Manager
            </h1>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab(TabOption.MERGE)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === TabOption.MERGE
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Merge Tool
            </button>
            <button
              onClick={() => setActiveTab(TabOption.AI_ANALYSIS)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                activeTab === TabOption.AI_ANALYSIS
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Bot className="w-4 h-4" />
              AI Validator
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative">
        
        {activeTab === TabOption.MERGE && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column: Base */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-xs">A</span>
                    Base Config (e.g. Google Mobile Ads)
                  </label>
                  <span className="text-xs text-slate-400">
                    {extractIds(baseInput).length} IDs detected
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    value={baseInput}
                    onChange={(e) => setBaseInput(e.target.value)}
                    className="w-full h-96 p-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-xs leading-relaxed resize-none shadow-sm transition-shadow"
                    placeholder="Paste your base Info.plist or SKAdNetworkItems xml here..."
                    spellCheck={false}
                  />
                  <div className="absolute bottom-2 right-2">
                    <Button variant="ghost" size="sm" onClick={() => setBaseInput('')} className="bg-white/80 backdrop-blur">
                      Clear
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Column: To Merge */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">B</span>
                    Merge Source (e.g. Unity Ads)
                  </label>
                  <span className="text-xs text-slate-400">
                    {extractIds(mergeInput).length} IDs detected
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    value={mergeInput}
                    onChange={(e) => setMergeInput(e.target.value)}
                    className="w-full h-96 p-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-xs leading-relaxed resize-none shadow-sm transition-shadow"
                    placeholder="Paste the list you want to add here..."
                    spellCheck={false}
                  />
                   <div className="absolute bottom-2 right-2">
                    <Button variant="ghost" size="sm" onClick={() => setMergeInput('')} className="bg-white/80 backdrop-blur">
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-4 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <Button onClick={handleMerge} className="w-full sm:w-auto min-w-[200px] h-12 text-base shadow-lg shadow-blue-600/20">
                <ArrowRight className="w-5 h-5 mr-2" />
                Merge Lists
              </Button>
              <Button variant="secondary" onClick={handleClear} className="w-full sm:w-auto h-12">
                <Trash2 className="w-4 h-4 mr-2" />
                Reset All
              </Button>
            </div>

            {/* Result Area */}
            {mergeResult && (
              <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                 <div className="flex items-center justify-between">
                   <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                     <FileCode className="w-5 h-5 text-green-600" />
                     Merged Result
                   </h2>
                   <div className="flex gap-4 text-sm">
                      <span className="text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        {mergeResult.addedCount} Added
                      </span>
                      <span className="text-slate-500">
                        {mergeResult.totalCount} Total IDs
                      </span>
                   </div>
                 </div>

                 {mergeResult.addedCount > 0 && (
                   <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-sm text-green-800">
                      <strong>Added IDs:</strong> {mergeResult.addedItems.join(', ')}
                   </div>
                 )}

                 <div className="relative group">
                    <textarea
                      readOnly
                      value={mergeResult.mergedXml}
                      className="w-full h-96 p-4 rounded-lg bg-slate-800 text-slate-50 font-mono text-xs leading-relaxed resize-none border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button onClick={handleCopyResult} variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy to Clipboard
                      </Button>
                    </div>
                 </div>
              </div>
            )}
          </div>
        )}

        {activeTab === TabOption.AI_ANALYSIS && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
             <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 flex items-start gap-4">
                <Bot className="w-6 h-6 text-purple-600 mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold text-purple-900">AI Config Analysis</h3>
                  <p className="text-sm text-purple-700 mt-1">
                    Paste your SKAdNetwork list below. Gemini will identify ad networks, spot duplicates, and validate structure.
                  </p>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Configuration to Analyze</label>
                <textarea
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  className="w-full h-64 p-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-xs leading-relaxed shadow-sm"
                  placeholder="Paste Info.plist content here..."
                />
             </div>

             <div className="flex justify-end">
                <Button 
                  onClick={handleAiAnalysis} 
                  isLoading={isAiLoading}
                  className="bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500"
                >
                  <Bot className="w-4 h-4 mr-2" />
                  Analyze with Gemini
                </Button>
             </div>

             {aiError && (
               <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-lg flex items-center gap-2">
                 <AlertCircle className="w-5 h-5" />
                 {aiError}
               </div>
             )}

             {aiOutput && (
               <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
                 <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-medium text-slate-700">
                   Analysis Result
                 </div>
                 <div className="p-6 prose prose-sm max-w-none text-slate-700">
                   <pre className="whitespace-pre-wrap font-sans text-sm">{aiOutput}</pre>
                 </div>
               </div>
             )}
          </div>
        )}

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className="bg-slate-800 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <h4 className="font-medium text-sm">Copied!</h4>
                <p className="text-xs text-slate-300">Merged config copied to clipboard</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
