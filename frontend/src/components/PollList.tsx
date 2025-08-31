import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { pollsApi } from '../services/api';
import { Poll } from '../types/poll';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Users, 
  BarChart3, 
  Vote,
  Zap
} from 'lucide-react';
import VotingForm from './VotingForm';
import PollResults from './PollResults';

interface PollListProps {
  type: 'active' | 'closed';
  refreshTrigger?: number;
}

const PollList: React.FC<PollListProps> = ({ type, refreshTrigger }) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPoll, setSelectedPoll] = useState<string | null>(null);
  const [expandedPolls, setExpandedPolls] = useState<Set<string>>(new Set());

  const hasVoted = (pollId: string): boolean => {
    const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]');
    return votedPolls.includes(pollId);
  };

  const toggleExpanded = (pollId: string) => {
    const newExpanded = new Set(expandedPolls);
    if (newExpanded.has(pollId)) {
      newExpanded.delete(pollId);
    } else {
      newExpanded.add(pollId);
    }
    setExpandedPolls(newExpanded);
  };

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const data = type === 'active' 
        ? await pollsApi.getActivePolls()
        : await pollsApi.getClosedPolls();
      setPolls(data);
    } catch (err) {
      setError('Failed to fetch polls');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
    setSelectedPoll(null);
    setExpandedPolls(new Set());
  }, [type, refreshTrigger]);

  const handleVoteSuccess = (pollId: string) => {
    const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]');
    if (!votedPolls.includes(pollId)) {
      votedPolls.push(pollId);
      localStorage.setItem('votedPolls', JSON.stringify(votedPolls));
    }
    
    setSelectedPoll(null);
    fetchPolls();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="w-3/4 h-6 mb-4 bg-gray-200 rounded"></div>
              <div className="w-1/2 h-4 mb-2 bg-gray-200 rounded"></div>
              <div className="w-1/4 h-4 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center animate-fade-in">
        <div className="mb-4 text-6xl text-red-500">⚠️</div>
        <h3 className="mb-2 text-lg font-semibold text-gray-800">{error}</h3>
        <Button onClick={fetchPolls} variant="outline" className="btn-ripple">
          Try Again
        </Button>
      </div>
    );
  }

  if (polls.length === 0) {
    return (
      <div className="py-16 text-center animate-fade-in">
        <div className="mb-4 text-6xl text-gray-400">
          {type === 'active' ? '🗳️' : '📊'}
        </div>
        <h3 className="mb-2 text-xl font-semibold text-gray-700">
          No {type} polls found
        </h3>
        <p className="text-gray-500">
          {type === 'active' 
            ? 'Create your first poll to get started!' 
            : 'Completed polls will appear here.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${type === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
            {type === 'active' ? <Vote size={20} /> : <BarChart3 size={20} />}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 capitalize">
              {type} Polls
            </h2>
            <p className="text-sm text-gray-500">
              {polls.length} poll{polls.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
        
        {type === 'active' && (
          <Badge variant="secondary" className="text-green-700 bg-green-100 animate-pulse">
            <Zap size={12} className="mr-1" />
            Live
          </Badge>
        )}
      </div>

      {/* Polls Grid */}
      <div className="grid gap-4">
        {polls.map((poll, index) => {
          const isExpanded = expandedPolls.has(poll.id);
          const isVoting = selectedPoll === poll.id;
          const userHasVoted = hasVoted(poll.id);
          const canVote = type === 'active' && !userHasVoted && !isVoting;
          
          return (
            <Card 
              key={poll.id}
              className={`
                transition-all duration-300 hover-lift card-hover animate-slide-up
                ${isExpanded ? 'ring-2 ring-blue-200 shadow-lg' : 'shadow-sm hover:shadow-md'}
                ${isVoting ? 'ring-2 ring-purple-200' : ''}
              `}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Minimized Header */}
              <div 
                className="p-4 cursor-pointer"
                onClick={() => toggleExpanded(poll.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="mb-1 text-lg font-semibold text-gray-800 truncate">
                      {poll.question}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>
                          {type === 'active' 
                            ? formatDistanceToNow(new Date(poll.expiresAt), { addSuffix: true })
                            : format(new Date(poll.expiresAt), 'MMM dd, yyyy')
                          }
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>{poll._count?.votes || 0} votes</span>
                      </div>
                      
                      <Badge 
                        variant={type === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {poll.options.length} options
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {/* Status Indicators */}
                    {userHasVoted && type === 'active' && (
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        Voted
                      </Badge>
                    )}
                    
                    {canVote && (
                      <Button
                        size="sm"
                        className="btn-ripple"
                        onClick={(e) => {
                          e.stopPropagation();
                          // First expand the poll, then set it for voting
                          setExpandedPolls(prev => new Set([...prev, poll.id]));
                          setSelectedPoll(poll.id);
                        }}
                      >
                        <Vote size={14} className="mr-1" />
                        Vote
                      </Button>
                    )}

                    {/* Expand/Collapse Icon */}
                    <div className="text-gray-400">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <CardContent className="px-4 pt-0 pb-6 animate-slide-up">
                  <div className="pt-4 border-t">
                    {isVoting ? (
                      <VotingForm
                        poll={poll}
                        onVoteSuccess={() => handleVoteSuccess(poll.id)}
                        onCancel={() => setSelectedPoll(null)}
                      />
                    ) : userHasVoted || type === 'closed' ? (
                      <PollResults pollId={poll.id} showChart={true} />
                    ) : (
                      // Show poll details and vote button for active polls not yet voted
                      <div className="space-y-4">
                        <div>
                          <h4 className="mb-3 font-medium text-gray-800">Available Options:</h4>
                          <div className="space-y-2">
                            {poll.options.map((option, idx) => (
                              <div key={option.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                                <div className="flex items-center justify-center w-6 h-6 text-sm font-bold text-blue-600 bg-blue-100 rounded-full">
                                  {String.fromCharCode(65 + idx)}
                                </div>
                                <span className="text-gray-700">{option.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <Button 
                          onClick={() => setSelectedPoll(poll.id)}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                        >
                          <Vote size={16} className="mr-2" />
                          Start Voting
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PollList;