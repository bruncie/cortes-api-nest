import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoRequestDto } from './dto/video.request.dto';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('cut')
  async cutVideo(@Body() videoRequest: VideoRequestDto) {
    try {
      const result = await this.videoService.cutVideo(videoRequest);
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Error processing video',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}