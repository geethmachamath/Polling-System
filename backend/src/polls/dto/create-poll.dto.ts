export class CreatePollDto {
  question: string;
  options: string[];
  expiresAt: string; // ISO date string
}

export class VoteDto {
  optionId: string;
}