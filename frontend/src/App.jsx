import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Upload, Send, Bot, User, FileText, Loader2, Sparkles } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

function App() {
  const [summary, setSummary] = useState('');
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, isTyping]);

  const onUpload = async (e) => {
    if (!e.target.files[0]) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    try {
      const res = await axios.post(`${API_BASE}/api/upload`, formData);
      setSummary(res.data.summary);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setLoading(false);
    }
  };

  const onSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setChat(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      const formData = new FormData();
      formData.append('question', currentInput);
      const res = await axios.post(`${API_BASE}/api/ask`, formData);
      setChat(prev => [...prev, { role: 'bot', content: res.data.answer }]);
    } catch (err) {
      console.error("Chat failed", err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    // Updated: Dark Midnight Background with Mesh Gradients
    <div className="relative flex flex-col bg-[#030712] min-h-screen overflow-hidden font-sans text-slate-200">
      
      {/* Dynamic Glow Accents */}
      <div className="top-[-10%] left-[-5%] -z-10 absolute bg-indigo-600/20 blur-[140px] rounded-full w-[600px] h-[600px] animate-pulse"></div>
      <div className="right-[-10%] bottom-[-5%] -z-10 absolute bg-blue-600/10 blur-[140px] rounded-full w-[500px] h-[500px]"></div>

      {/* Navbar - Dark Glass */}
      <nav className="top-0 z-20 sticky flex justify-between items-center bg-[#030712]/60 backdrop-blur-xl px-6 py-4 border-slate-800/50 border-b">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-500 shadow-indigo-500/30 shadow-lg p-1.5 rounded-xl text-white">
            <Sparkles size={20} />
          </div>
          <h1 className="font-bold text-white text-xl tracking-tight">DocuMind <span className="text-indigo-400">AI</span></h1>
        </div>
        
        <div className="flex items-center gap-4">
          <input type="file" id="pdf" hidden onChange={onUpload} accept=".pdf" />
          <label 
            htmlFor="pdf" 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer shadow-lg
              ${loading 
                ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                : "bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-indigo-500/40 active:scale-95"}`}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {loading ? "Analyzing..." : "Upload PDF"}
          </label>
        </div>
      </nav>

      <main className="z-10 flex-1 px-4 py-8 overflow-y-auto">
        <div className="space-y-8 mx-auto max-w-3xl">
          
          {/* Summary Section - Dark Card */}
          {summary && (
            <section className="slide-in-from-bottom-4 animate-in duration-700 fade-in">
              <div className="bg-slate-900/40 shadow-2xl backdrop-blur-md border border-slate-700/50 rounded-3xl overflow-hidden">
                <div className="flex items-center gap-2 bg-slate-800/30 px-6 py-3 border-slate-700/50 border-b">
                  <FileText size={16} className="text-indigo-400" />
                  <h3 className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Document Intelligence</h3>
                </div>
                <div className="p-6">
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{summary}</p>
                </div>
              </div>
            </section>
          )}

          {/* Chat Section */}
          <div className="space-y-6 pb-24">
            {chat.length === 0 && !summary && (
              <div className="py-24 text-center">
                <div className="flex justify-center items-center bg-slate-900 shadow-2xl mx-auto mb-6 border border-slate-800 rounded-3xl w-20 h-20 animate-bounce-slow">
                  <Bot size={40} className="text-indigo-500" />
                </div>
                <h2 className="font-semibold text-slate-300 text-xl">Ready to analyze your files</h2>
                <p className="mt-2 text-slate-500">Drop a document above to begin the conversation.</p>
              </div>
            )}
            
            {chat.map((msg, i) => (
              <div key={i} className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center text-sm shadow-lg
                  ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 border border-slate-700 text-indigo-400'}`}>
                  {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className={`p-4 rounded-2xl text-[15px] leading-relaxed max-w-[85%] shadow-md
                  ${msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/10' 
                    : 'bg-slate-900/80 backdrop-blur-sm text-slate-200 border border-slate-800 rounded-tl-none'}`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-3">
                <div className="flex justify-center items-center bg-slate-800 border border-slate-700 rounded-2xl w-9 h-9">
                  <Bot size={18} className="text-indigo-400" />
                </div>
                <div className="bg-slate-900/80 backdrop-blur-sm p-4 border border-slate-800 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1.5">
                    <span className="bg-indigo-500/60 rounded-full w-2 h-2 animate-bounce"></span>
                    <span className="bg-indigo-500/60 rounded-full w-2 h-2 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="bg-indigo-500/60 rounded-full w-2 h-2 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
      </main>

      {/* Input Footer - Dark Glass */}
      <footer className="z-20 bg-[#030712]/80 backdrop-blur-xl p-4 pb-8 border-slate-800/50 border-t">
        <div className="relative mx-auto max-w-3xl">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && onSend()} 
            placeholder="Ask a question..." 
            className="bg-slate-900/50 shadow-inner py-4 pr-16 pl-6 border border-slate-700/50 focus:border-indigo-500 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 w-full text-white placeholder:text-slate-500 transition-all"
          />
          <button 
            onClick={onSend} 
            disabled={!input.trim()}
            className="top-2.5 right-2.5 absolute bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 shadow-indigo-500/20 shadow-lg disabled:shadow-none p-2 rounded-xl text-white active:scale-95 transition-all disabled:cursor-not-allowed"
          >
            <Send size={22}/>
          </button>
        </div>
        <p className="mt-3 font-semibold text-[10px] text-slate-600 text-center uppercase tracking-widest">Groq AI Intelligence Layer</p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-8%); }
          50% { transform: translateY(0); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s infinite ease-in-out;
        }
      `}} />
    </div>
  );
}

export default App;