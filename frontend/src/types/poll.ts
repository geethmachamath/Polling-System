export interface Option {
  id: string;
  text: string;
  pollId: string;
  voteCount?: number;
  percentage?: number;
  _count?: {
    votes: number;
  };
}

export interface Poll {
  id: string;
  question: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  options: Option[];
  totalVotes?: number;
  _count?: {
    votes: number;
  };
}

export interface CreatePollData {
  question: string;
  options: string[];
  expiresAt: string;
}