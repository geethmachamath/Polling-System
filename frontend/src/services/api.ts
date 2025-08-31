import axios from 'axios';
import { Poll, CreatePollData } from '../types/poll';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const pollsApi = {
  // Get active polls
  getActivePolls: async (): Promise<Poll[]> => {
    const response = await api.get('/polls');
    return response.data;
  },

  // Get closed polls
  getClosedPolls: async (): Promise<Poll[]> => {
    const response = await api.get('/polls/closed');
    return response.data;
  },

  // Create new poll
  createPoll: async (pollData: CreatePollData): Promise<Poll> => {
    const response = await api.post('/polls', pollData);
    return response.data;
  },

  // Vote on a poll
  vote: async (pollId: string, optionId: string): Promise<void> => {
    await api.post(`/polls/${pollId}/vote`, { optionId });
  },

  // Get poll results
  getPollResults: async (pollId: string): Promise<Poll> => {
    const response = await api.get(`/polls/${pollId}/results`);
    return response.data;
  },
};