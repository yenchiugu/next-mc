import { NextRequest, NextResponse } from 'next/server';
import { createReadStream, statSync } from 'fs';
import path from 'path';

export async function GET(
    request: NextRequest,
    { params }: { params: { filename: string } }
) {
    const filename = params.filename;
    const videoPath = path.join(process.cwd(), 'generated', filename);

    try {
        const stat = statSync(videoPath);
        const fileSize = stat.size;
        const range = request.headers.get('range');

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = createReadStream(videoPath, { start, end });
            
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
                'Content-Disposition': `attachment; filename="${filename}"`,
            };
            
            return new NextResponse(file as any, { 
                status: 206,
                headers: head
            });
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
                'Content-Disposition': `attachment; filename="${filename}"`,
            };
            
            const file = createReadStream(videoPath);
            return new NextResponse(file as any, { 
                status: 200,
                headers: head
            });
        }
    } catch (error) {
        console.error('Error serving video:', error);
        return NextResponse.json(
            { error: 'Video not found' },
            { status: 404 }
        );
    }
} 