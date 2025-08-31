import { Controller, Get, Post, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { PollsService } from './polls.service';
import { CreatePollDto, VoteDto } from './dto/create-poll.dto';

@Controller('polls')
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @Get()
  async getActivePolls() {
    try {
      return await this.pollsService.getActivePolls();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('closed')
  async getClosedPolls() {
    try {
      return await this.pollsService.getClosedPolls();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  async createPoll(@Body() createPollDto: CreatePollDto) {
    try {
      return await this.pollsService.createPoll(createPollDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':id/vote')
  async vote(@Param('id') pollId: string, @Body() voteDto: VoteDto) {
    try {
      await this.pollsService.vote(pollId, voteDto);
      return { message: 'Vote recorded successfully' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id/results')
  async getPollResults(@Param('id') pollId: string) {
    try {
      return await this.pollsService.getPollResults(pollId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}