import { Injectable, OnModuleInit } from '@nestjs/common';
import { VideoRequestDto } from './dto/video.request.dto';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as ytDlpModule from 'yt-dlp-exec';

const execPromise = promisify(exec);
const ytDlp = ytDlpModule.default;

@Injectable()
export class VideoService implements OnModuleInit {
  private readonly VIDEO_DIR = 'videos';

  onModuleInit() {
    // Criar o diretório de vídeos se não existir
    if (!fs.existsSync(this.VIDEO_DIR)) {
      fs.mkdirSync(this.VIDEO_DIR, { recursive: true });
    }
  }

  async cutVideo(videoRequest: VideoRequestDto) {
    const videoId = uuidv4();
    const videoPath = path.join(this.VIDEO_DIR, `${videoId}.mp4`);
    
    // Usar a biblioteca yt-dlp-exec
    await this.downloadVideo(videoRequest.url, videoPath);
    
    const outputFiles: string[] = [];
    
    for (let i = 0; i < videoRequest.clips.length; i++) {
      const { startTime, endTime } = videoRequest.clips[i];
      const outputFile = path.join(this.VIDEO_DIR, `${videoId}_clip_${i}.mp4`);
      
      await this.cutVideoSegment(videoPath, startTime, endTime, outputFile);
      outputFiles.push(outputFile);
    }
    
    return { clips: outputFiles };
  }
  
  private async downloadVideo(url: string, outputPath: string): Promise<void> {
    try {
      await ytDlp(url, {
        output: outputPath,
        format: 'best'
      });
    } catch (error) {
      console.error('Error downloading video:', error);
      throw error;
    }
  }
  
  private async cutVideoSegment(
    inputPath: string, 
    startTime: number, 
    endTime: number, 
    outputPath: string
  ): Promise<void> {
    const command = `ffmpeg -i "${inputPath}" -ss ${startTime} -to ${endTime} -c copy "${outputPath}"`;
    await execPromise(command);
  }
}