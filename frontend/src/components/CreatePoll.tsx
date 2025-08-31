import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { pollsApi } from '../services/api';
import { CreatePollData } from '../types/poll';
import { addDays, format } from 'date-fns';
import { 
  Plus, 
  Minus, 
  Calendar, 
  MessageSquare, 
  Settings, 
  CheckCircle,
  AlertCircle,
  Sparkles,
  Clock
} from 'lucide-react';

interface CreatePollProps {
  onPollCreated: () => void;
}

const CreatePoll: React.FC<CreatePollProps> = ({ onPollCreated }) => {
  const [formData, setFormData] = useState<CreatePollData>({
    question: '',
    options: ['', ''],
    expiresAt: format(addDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm"), // Default to 1 week
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, question: e.target.value });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    if (formData.options.length < 5) {
      setFormData({ ...formData, options: [...formData.options, ''] });
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({ ...formData, options: newOptions });
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, expiresAt: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    
    if (!formData.question.trim()) {
      setError('Question is required');
      return;
    }

    const validOptions = formData.options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      setError('At least 2 options are required');
      return;
    }

    if (validOptions.length > 5) {
      setError('Maximum 5 options allowed');
      return;
    }

    const expiryDate = new Date(formData.expiresAt);
    if (expiryDate <= new Date()) {
      setError('Expiry date must be in the future');
      return;
    }

    try {
      setSubmitting(true);
      
      const pollData: CreatePollData = {
        question: formData.question.trim(),
        options: validOptions,
        expiresAt: formData.expiresAt,
      };

      await pollsApi.createPoll(pollData);
      
      setSuccess(true);
      
  
      setFormData({
        question: '',
        options: ['', ''],
        expiresAt: format(addDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm"),
      });

    
      setTimeout(() => {
        onPollCreated();
      }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create poll');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="animate-fade-in">
        <Card className="border-2 border-green-200 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="py-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 text-white rounded-full bg-gradient-to-r from-green-500 to-emerald-500 animate-bounce">
                  <CheckCircle size={32} />
                </div>
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-800">
                Poll Created Successfully!
              </h3>
              <p className="mb-4 text-gray-600">
                Your poll is now live and ready for votes
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-green-700">
                <Sparkles size={16} />
                <span>Redirecting to active polls...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <Card className="border-2 border-gray-200 shadow-lg bg-gradient-to-br from-slate-50 to-white">
        
        <CardHeader className="pb-6 bg-gradient-to-r from-emerald-50 to-blue-50">
          <div className="flex items-center gap-4">
            <div className="p-3 text-white rounded-2xl bg-gradient-to-r from-emerald-600 to-blue-600">
              <Plus size={24} />
            </div>
            <div>
              <CardTitle className="text-2xl text-gray-800">Create New Poll</CardTitle>
              <p className="mt-1 text-gray-600">Design engaging polls to gather valuable insights</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 text-blue-600 bg-blue-100 rounded-lg">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <Label htmlFor="question" className="text-lg font-semibold text-gray-800">
                    Poll Question
                  </Label>
                  <p className="text-sm text-gray-600">Ask a clear, specific question</p>
                </div>
              </div>
              
              <Textarea
                id="question"
                placeholder="e.g., Which programming language do you prefer for web development?"
                value={formData.question}
                onChange={handleQuestionChange}
                rows={3}
                className="text-base transition-all duration-300 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                required
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Be specific and unbiased</span>
                <span>{formData.question.length}/200</span>
              </div>
            </div>

            
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 text-purple-600 bg-purple-100 rounded-lg">
                  <Settings size={20} />
                </div>
                <div>
                  <Label className="text-lg font-semibold text-gray-800">
                    Answer Options
                  </Label>
                  <p className="text-sm text-gray-600">
                    Add 2-5 options for voters to choose from
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {formData.options.map((option, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 p-4 transition-all duration-300 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-slate-50 hover:border-gray-300"
                  >
               
                    <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-white rounded-full bg-gradient-to-r from-gray-600 to-slate-600">
                      {String.fromCharCode(65 + index)}
                    </div>

                    
                    <Input
                      placeholder={`Option ${index + 1} (e.g., React, Vue, Angular)`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      required={index < 2}
                      className="flex-1 transition-all duration-300 border-0 bg-white/80 focus:bg-white focus:ring-2 focus:ring-blue-200"
                    />

                    
                    {formData.options.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(index)}
                        className="text-red-600 border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300"
                      >
                        <Minus size={16} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
           
              {formData.options.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addOption}
                  className="w-full py-3 text-gray-600 transition-all duration-300 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50"
                >
                  <Plus size={16} className="mr-2" />
                  Add Another Option ({formData.options.length}/5)
                </Button>
              )}
            </div>

          
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 text-orange-600 bg-orange-100 rounded-lg">
                  <Calendar size={20} />
                </div>
                <div>
                  <Label htmlFor="expiresAt" className="text-lg font-semibold text-gray-800">
                    Poll Duration
                  </Label>
                  <p className="text-sm text-gray-600">When should this poll close?</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-orange-50 to-yellow-50">
                <Clock size={20} className="text-orange-600" />
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={handleExpiryChange}
                  min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                  className="flex-1 transition-all duration-300 border-0 bg-white/80 focus:bg-white focus:ring-2 focus:ring-orange-200"
                  required
                />
              </div>
            </div>

            
            {error && (
              <div className="flex items-center gap-3 p-4 border-2 border-red-200 rounded-xl bg-red-50 animate-fade-in">
                <AlertCircle size={20} className="text-red-500" />
                <span className="text-sm font-medium text-red-700">{error}</span>
              </div>
            )}

            <div className="pt-6 border-t">
              <Button 
                type="submit" 
                disabled={submitting || !formData.question.trim() || formData.options.filter(opt => opt.trim()).length < 2}
                className={`
                  w-full py-4 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02]
                  ${submitting || !formData.question.trim() || formData.options.filter(opt => opt.trim()).length < 2
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                  }
                `}
              >
                {submitting ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                    Creating Your Poll...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <Sparkles size={20} />
                    Create Poll
                  </div>
                )}
              </Button>
              
           
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <div className={`w-2 h-2 rounded-full ${formData.question.trim() ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>Question</span>
                  <div className="w-4 h-px bg-gray-300"></div>
                  <div className={`w-2 h-2 rounded-full ${formData.options.filter(opt => opt.trim()).length >= 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>Options</span>
                  <div className="w-4 h-px bg-gray-300"></div>
                  <div className={`w-2 h-2 rounded-full ${formData.expiresAt ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>Duration</span>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

    
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute right-0 w-64 h-64 transform translate-x-32 rounded-full top-1/4 bg-gradient-to-br from-emerald-100/20 to-blue-100/20"></div>
        <div className="absolute left-0 w-64 h-64 transform -translate-x-32 rounded-full bottom-1/4 bg-gradient-to-tr from-blue-100/20 to-purple-100/20"></div>
      </div>

      
    </div>
  );
};

export default CreatePoll;