import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreatePollDto, VoteDto } from './dto/create-poll.dto';

@Injectable()
export class PollsService {
  private prisma = new PrismaClient();

  // Get all active polls (not expired)
  async getActivePolls() {
    const now = new Date();
    return this.prisma.poll.findMany({
      where: {
        expiresAt: {
          gt: now, // greater than current time = active
        },
      },
      include: {
        options: true,
        _count: {
          select: {
            votes: true, // count total votes per poll
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Get all expired/closed polls
  async getClosedPolls() {
    const now = new Date();
    return this.prisma.poll.findMany({
      where: {
        expiresAt: {
          lte: now, // less than or equal = expired
        },
      },
      include: {
        options: {
          include: {
            _count: {
              select: {
                votes: true, // count votes per option
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

  // Create a new poll
  async createPoll(createPollDto: CreatePollDto) {
    const { question, options, expiresAt } = createPollDto;

    // Validation
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

  // Vote on a poll
  async vote(pollId: string, voteDto: VoteDto) {
    const { optionId } = voteDto;

    // Check if poll exists and is active
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

    // Create vote
    return this.prisma.vote.create({
      data: {
        pollId,
        optionId,
      },
    });
  }

  // Get poll results with vote counts
  async getPollResults(pollId: string) {
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

    // Calculate percentages
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
}