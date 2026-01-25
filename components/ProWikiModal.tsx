import React, { useState } from 'react';
import { X, BookOpen, Scale, Gavel, Building2, Link2, Calculator } from 'lucide-react';
import { WelcomeTab, RatgTab, GggTab, AhkTab, LinksTab, ExamplesTab } from './wiki';

type TabId = 'welcome' | 'ratg' | 'ggg' | 'ahk' | 'examples' | 'links';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { id: 'welcome', label: 'Start', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'ratg', label: 'RATG', icon: <Scale className="h-4 w-4" /> },
  { id: 'ggg', label: 'GGG', icon: <Building2 className="h-4 w-4" /> },
  { id: 'ahk', label: 'AHK', icon: <Gavel className="h-4 w-4" /> },
  { id: 'examples', label: 'Beispiele', icon: <Calculator className="h-4 w-4" /> },
  { id: 'links', label: 'Links', icon: <Link2 className="h-4 w-4" /> },
];

interface ProWikiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProWikiModal: React.FC<ProWikiModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('welcome');

  if (!isOpen) return null;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'welcome': return <WelcomeTab />;
      case 'ratg': return <RatgTab />;
      case 'ggg': return <GggTab />;
      case 'ahk': return <AhkTab />;
      case 'examples': return <ExamplesTab />;
      case 'links': return <LinksTab />;
      default: return <WelcomeTab />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 px-8 pt-8 pb-6 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Scale className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Pro-Wiki</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Dokumentation & Gesetzeslinks
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-6 overflow-x-auto pb-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {renderTabContent()}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
};

export default ProWikiModal;
