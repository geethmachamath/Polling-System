import { CreatePollDto, VoteDto } from './dto/create-poll.dto';
export declare class PollsService {
    private prisma;
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
        id: string;
        createdAt: Date;
        pollId: string;
        optionId: string;
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
