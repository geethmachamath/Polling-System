import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PollList from './components/PollList';
import CreatePoll from './components/CreatePoll';
import PollAnalytics from './components/PollAnalytics';
import { 
  Vote, 
  Archive, 
  Plus, 
  BarChart3, 
  Activity,
  Zap
} from 'lucide-react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'active' | 'closed' | 'create' | 'analytics'>('active');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePollCreated = () => {
    setActiveTab('active');
    setRefreshTrigger(prev => prev + 1);
  };

  const tabs = [
    {
      id: 'active' as const,
      label: 'Active Polls',
      icon: Vote,
      description: 'Live voting',
      color: 'blue'
    },
    {
      id: 'closed' as const,
      label: 'Closed Polls',
      icon: Archive,
      description: 'View results',
      color: 'gray'
    },
    {
      id: 'analytics' as const,
      label: 'Analytics',
      icon: BarChart3,
      description: 'Insights & stats',
      color: 'purple'
    },
    {
      id: 'create' as const,
      label: 'Create Poll',
      icon: Plus,
      description: 'New poll',
      color: 'emerald'
    }
  ];

  const getTabColorClasses = (tabId: string, isActive: boolean) => {
    const colors = {
      blue: isActive 
        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' 
        : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300',
      gray: isActive 
        ? 'bg-gray-600 text-white border-gray-600 shadow-lg shadow-gray-200' 
        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300',
      purple: isActive 
        ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200' 
        : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300',
      emerald: isActive 
        ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200' 
        : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
    };
    return colors[tabId as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        <div className="relative max-w-6xl px-6 py-12 mx-auto">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 text-white shadow-lg rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600">
                <Activity size={32} />
              </div>
              <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text">
                Polling System
              </h1>
            </div>
            <p className="max-w-2xl mx-auto text-lg leading-relaxed text-gray-600">
              Create engaging polls, gather real-time insights, and analyze voting patterns with our comprehensive polling platform.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group relative px-6 py-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105
                    ${getTabColorClasses(tab.color, isActive)}
                    ${isActive ? 'ring-4 ring-white/50' : ''}
                  `}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      p-2 rounded-xl transition-all duration-300
                      ${isActive 
                        ? 'bg-white/20' 
                        : 'bg-white/80 group-hover:bg-white'
                      }
                    `}>
                      <Icon size={20} className={isActive ? 'text-white' : ''} />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">{tab.label}</div>
                      <div className={`
                        text-xs transition-all duration-300
                        ${isActive ? 'text-white/80' : 'text-gray-500'}
                      `}>
                        {tab.description}
                      </div>
                    </div>
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute transform -translate-x-1/2 -bottom-1 left-1/2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  )}

                  {/* Live indicator for active polls */}
                  {tab.id === 'active' && isActive && (
                    <div className="absolute -top-2 -right-2">
                      <div className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-green-500 rounded-full shadow-lg animate-pulse">
                        <Zap size={8} />
                        Live
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl px-6 pb-12 mx-auto">
        <div className="animate-fade-in">
          {activeTab === 'active' && (
            <PollList type="active" refreshTrigger={refreshTrigger} />
          )}
          {activeTab === 'closed' && (
            <PollList type="closed" refreshTrigger={refreshTrigger} />
          )}
          {activeTab === 'create' && (
            <CreatePoll onPollCreated={handlePollCreated} />
          )}
          {activeTab === 'analytics' && (
            <PollAnalytics refreshTrigger={refreshTrigger} />
          )}
        </div>
      </div>

      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 transform translate-x-48 -translate-y-48 rounded-full w-96 h-96 bg-gradient-to-br from-blue-100/20 to-purple-100/20"></div>
        <div className="absolute bottom-0 left-0 transform -translate-x-48 translate-y-48 rounded-full w-96 h-96 bg-gradient-to-tr from-emerald-100/20 to-blue-100/20"></div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }

        /* Custom tab hover effects */
        .group:hover .group-hover\\:scale-105 {
          transform: scale(1.05);
        }

        /* Smooth transitions for all interactive elements */
        * {
          scroll-behavior: smooth;
        }

        /* Custom focus styles */
        button:focus-visible {
          outline: 2px solid #3B82F6;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}

export default App;