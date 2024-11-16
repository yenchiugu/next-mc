import VideoGenerator from './components/VideoGenerator';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-8 text-center">Video Generator</h1>
      <VideoGenerator />
    </main>
  );
}
