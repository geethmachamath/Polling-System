import { PollsService } from './polls.service';
import { CreatePollDto, VoteDto } from './dto/create-poll.dto';
export declare class PollsController {
    private readonly pollsService;
    constructor(pollsService: PollsService);
    getActivePolls(): Promise<({
        options: {
            id: string;
            text: string;
            pollId: string;
        }[];
        _count: {
            votes: number;
        };
    } & {
        id: string;
        question: string;
        expiresAt: Date;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getClosedPolls(): Promise<({
        options: ({
            _count: {
                votes: number;
            };
        } & {
            id: string;
            text: string;
            pollId: string;
        })[];
        _count: {
            votes: number;
        };
    } & {
        id: string;
        question: string;
        expiresAt: Date;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    createPoll(createPollDto: CreatePollDto): Promise<{
        options: {
            id: string;
            text: string;
            pollId: string;
        }[];
    } & {
        id: string;
        question: string;
        expiresAt: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    vote(pollId: string, voteDto: VoteDto): Promise<{
        message: string;
    }>;
    getPollResults(pollId: string): Promise<{
        options: {
            voteCount: number;
            percentage: number;
            _count: {
                votes: number;
            };
            id: string;
            text: string;
            pollId: string;
        }[];
        totalVotes: number;
        _count: {
            votes: number;
        };
        id: string;
        question: string;
        expiresAt: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
