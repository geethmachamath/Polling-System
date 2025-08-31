import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { pollsApi } from '../services/api';
import { Poll } from '../types/poll';
import { 
  Vote, 
  X, 
  CheckCircle, 
  AlertCircle,
  Zap 
} from 'lucide-react';

interface VotingFormProps {
  poll: Poll;
  onVoteSuccess: () => void;
  onCancel: () => void;
}

const VotingForm: React.FC<VotingFormProps> = ({ poll, onVoteSuccess, onCancel }) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOption) {
      setError('Please select an option');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      await pollsApi.vote(poll.id, selectedOption);
      onVoteSuccess();
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit vote');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden border-2 border-gray-200 rounded-2xl bg-gradient-to-br from-slate-50 to-white">
     
      <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-3">
          <div className="p-2 text-white rounded-xl bg-gradient-to-r from-blue-600 to-purple-600">
            <Vote size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">Cast Your Vote</h4>
            <p className="text-sm text-gray-600">Select your preferred option</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 px-3 py-1 text-xs text-green-700 bg-green-100 rounded-full animate-pulse">
          <Zap size={12} />
          Live
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
       
        <div className="space-y-3">
          {poll.options.map((option, idx) => {
            const isSelected = selectedOption === option.id;
            
            return (
              <div key={option.id} className="relative group">
                <input
                  type="radio"
                  id={option.id}
                  name="pollOption"
                  value={option.id}
                  checked={isSelected}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="sr-only"
                />
                <Label 
                  htmlFor={option.id} 
                  className={`
                    relative flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 transform
                    ${isSelected 
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg ring-4 ring-blue-100 scale-[1.02]' 
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 hover:shadow-md'
                    }
                    group-hover:scale-[1.01]
                  `}
                >
                 
                  <div className={`
                    flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-300
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300 bg-white group-hover:border-blue-300'
                    }
                  `}>
                    {isSelected && (
                      <CheckCircle size={14} className="text-white" />
                    )}
                  </div>

                 
                  <div className="flex items-center flex-1 gap-3">
                    <div className={`
                      flex items-center justify-center w-8 h-8 text-sm font-bold rounded-full transition-all duration-300
                      ${isSelected 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                      }
                    `}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className={`
                      font-medium transition-all duration-300
                      ${isSelected ? 'text-gray-800' : 'text-gray-700'}
                    `}>
                      {option.text}
                    </span>
                  </div>

                 
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </Label>
              </div>
            );
          })}
        </div>

        
        {error && (
          <div className="flex items-center gap-3 p-4 border border-red-200 rounded-xl bg-red-50 animate-fade-in">
            <AlertCircle size={20} className="text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        
        <div className="flex flex-col gap-3 pt-4 border-t sm:flex-row">
          <Button 
            type="submit" 
            disabled={!selectedOption || submitting}
            className={`
              flex-1 py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02]
              ${!selectedOption || submitting 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
              }
            `}
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                Submitting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Vote size={16} />
                Submit Vote
              </div>
            )}
          </Button>
          
          <Button 
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 py-3 transition-all duration-300 transform border-gray-300 rounded-xl sm:flex-none text-gray-700 hover:bg-gray-50 hover:scale-[1.02]"
          >
            <X size={16} className="mr-2" />
            Cancel
          </Button>
        </div>
      </form>

      
    </div>
  );
};

export default VotingForm;