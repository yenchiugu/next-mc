import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const description = formData.get('description') as string;

    if (!file || !description) {
      return NextResponse.json(
        { error: 'File and description are required' },
        { status: 400 }
      );
    }

    // Convert File to Buffer for processing
    const buffer = Buffer.from(await file.arrayBuffer());

    // Create a promise to handle the process
    const processResult = await new Promise((resolve, reject) => {
      const process = spawn('node', ['-e', `
        const fileSize = ${buffer.length};
        const fileName = '${file.name}';
        const description = '${description}';
        console.log(\`filename: \${fileName}, filesize: \${fileSize}, description: \${description}\`);
      `]);

      let result = '';

      process.stdout.on('data', (data) => {
        result += data.toString();
      });

      process.stderr.on('data', (data) => {
        console.error(`Error: ${data}`);
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(result.trim());
        } else {
          reject(new Error(`Process exited with code ${code}`));
        }
      });
    });

    return NextResponse.json({ result: processResult });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};