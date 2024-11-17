import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import os from 'os';

export async function POST(request: NextRequest) {
    try {
        // Handle multipart form data
        const formData = await request.formData();
        const audioFile = formData.get('AUDIO_FILE') as File;
        const name = formData.get('NAME') as string;
        const desc = formData.get('DESC') as string;

        if (!audioFile || !name || !desc) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        // Create temp directory for processing
        const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'video-'));
        
        // Save uploaded audio file
        const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
        const audioPath = path.join(tempDir, 'audio.mp3');
        await fs.promises.writeFile(audioPath, audioBuffer);

        // Generate output filename with UUID
        const outputFileName = `${uuidv4()}.mp4`;
        const outputPath = path.join(tempDir, outputFileName);

        // Get main video path
        const mainVideoPath = path.join(process.cwd(), 'assets', 'output_720p.mp4');

        // Prepare FFmpeg command
        const ffmpegCommand = [
            '-i', mainVideoPath,
            '-i', audioPath,
            '-filter_complex',
            `[0:v]drawtext=text='${name}':fontfile='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc':fontsize=120:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/4-40:borderw=1:bordercolor=black:enable='between(t,0,3)',drawtext=text='${desc}':fontfile='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-60:borderw=1:bordercolor=black:enable='between(t,8,12)'[vout];[0:a] volume=1.0 [orig_aud];[1:a] adelay=3000|3000, volume=4.0 [bgm_aud];[orig_aud][bgm_aud] amix=inputs=2:duration=longest [mixed];[mixed] alimiter=limit=0.95 [aout]`,
            '-map', '[vout]',
            '-map', '[aout]',
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-shortest',
            outputPath
        ];
        console.log(ffmpegCommand);

        // Execute FFmpeg
        await new Promise((resolve, reject) => {
            const ffmpeg = spawn('ffmpeg', ffmpegCommand);

            ffmpeg.stderr.on('data', (data) => {
                console.log(`FFmpeg: ${data}`);
            });

            ffmpeg.on('close', (code) => {
                if (code === 0) {
                    resolve(code);
                } else {
                    reject(new Error(`FFmpeg process exited with code ${code}`));
                }
            });

            ffmpeg.on('error', (err) => {
                reject(err);
            });
        });

        // Generate download URL
        const downloadUrl = `/api/download/${outputFileName}`;

        // Move the output file to a permanent location
        const permanentDir = path.join(process.cwd(), 'generated');
        if (!fs.existsSync(permanentDir)) {
            await fs.promises.mkdir(permanentDir);
        }

        await moveFile(outputPath, path.join(permanentDir, outputFileName));        

        // Clean up temp directory
        await fs.promises.rm(tempDir, { recursive: true });

        return NextResponse.json({ url: downloadUrl });

    } catch (error) {
        console.error('Video generation error:', error);
        return NextResponse.json(
            { error: 'Video generation failed' },
            { status: 500 }
        );
    }
} 


async function moveFile(src: string, dest: string) {
  try {
    await fs.promises.copyFile(src, dest); // 複製檔案到目標位置
    await fs.promises.unlink(src); // 刪除原始檔案
    console.log('File moved successfully!');
  } catch (err) {
    console.error('Error moving file:', err);
  }
}


