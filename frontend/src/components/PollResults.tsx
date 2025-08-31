import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { pollsApi } from '../services/api';
import { Poll } from '../types/poll';

interface PollResultsProps {
  pollId: string;
}

const PollResults: React.FC<PollResultsProps> = ({ pollId }) => {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const data = await pollsApi.getPollResults(pollId);
        setPoll(data);
      } catch (err) {
        setError('Failed to load results');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [pollId]);

  if (loading) {
    return <div className="py-4">Loading results...</div>;
  }

  if (error || !poll) {
    return <div className="py-4 text-red-600">{error}</div>;
  }

  // Prepare data for the chart
  const chartData = poll.options.map((option, index) => ({
    name: `Option ${index + 1}`,
    label: option.text.length > 20 ? option.text.substring(0, 20) + '...' : option.text,
    votes: option.voteCount || 0,
    percentage: Math.round(option.percentage || 0),
  }));

  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-2 font-medium">Results</h4>
        <p className="text-sm text-gray-600">Total Votes: {poll.totalVotes || 0}</p>
      </div>

      {/* Results List */}
      <div className="space-y-2">
        {poll.options.map((option, index) => (
          <div key={option.id} className="p-3 border rounded bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{option.text}</span>
              <span className="text-sm text-gray-600">
                {option.voteCount || 0} votes ({Math.round(option.percentage || 0)}%)
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 transition-all duration-300 bg-blue-800 rounded-full"
                style={{ width: `${option.percentage || 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Chart Visualization */}
      {/* {poll.totalVotes && poll.totalVotes > 0 && (
        <div className="mt-6">
          <h5 className="mb-2 font-medium">Vote Distribution</h5>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value} votes (${props.payload.percentage}%)`,
                    props.payload.label
                  ]}
                  labelFormatter={() => ''}
                />
                <Bar dataKey="votes" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {poll.totalVotes === 0 && (
        <div className="py-4 text-center text-gray-600">
          No votes yet on this poll.
        </div>
      )} */}
    </div>
  );
};

export default PollResults;