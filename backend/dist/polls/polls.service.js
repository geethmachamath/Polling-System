"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PollsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PollsService = class PollsService {
    prisma = new client_1.PrismaClient();
    async getActivePolls() {
        const now = new Date();
        return this.prisma.poll.findMany({
            where: {
                expiresAt: {
                    gt: now,
                },
            },
            include: {
                options: true,
                _count: {
                    select: {
                        votes: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async getClosedPolls() {
        const now = new Date();
        return this.prisma.poll.findMany({
            where: {
                expiresAt: {
                    lte: now,
                },
            },
            include: {
                options: {
                    include: {
                        _count: {
                            select: {
                                votes: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        votes: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async createPoll(createPollDto) {
        const { question, options, expiresAt } = createPollDto;
        if (options.length < 2 || options.length > 5) {
            throw new Error('Poll must have between 2-5 options');
        }
        return this.prisma.poll.create({
            data: {
                question,
                expiresAt: new Date(expiresAt),
                options: {
                    create: options.map((text) => ({ text })),
                },
            },
            include: {
                options: true,
            },
        });
    }
    async vote(pollId, voteDto) {
        const { optionId } = voteDto;
        const poll = await this.prisma.poll.findUnique({
            where: { id: pollId },
        });
        if (!poll) {
            throw new Error('Poll not found');
        }
        const now = new Date();
        if (poll.expiresAt <= now) {
            throw new Error('Poll has expired');
        }
        return this.prisma.vote.create({
            data: {
                pollId,
                optionId,
            },
        });
    }
    async getPollResults(pollId) {
        const poll = await this.prisma.poll.findUnique({
            where: { id: pollId },
            include: {
                options: {
                    include: {
                        _count: {
                            select: {
                                votes: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        votes: true,
                    },
                },
            },
        });
        if (!poll) {
            throw new Error('Poll not found');
        }
        const totalVotes = poll._count.votes;
        const optionsWithPercentage = poll.options.map((option) => ({
            ...option,
            voteCount: option._count.votes,
            percentage: totalVotes > 0 ? (option._count.votes / totalVotes) * 100 : 0,
        }));
        return {
            ...poll,
            options: optionsWithPercentage,
            totalVotes,
        };
    }
};
exports.PollsService = PollsService;
exports.PollsService = PollsService = __decorate([
    (0, common_1.Injectable)()
], PollsService);
//# sourceMappingURL=polls.service.js.map