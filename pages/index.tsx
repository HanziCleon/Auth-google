import Head from 'next/head';
import AnimeApp from '../components/AnimeApp';

export default function Home() {
  return (
    <>
      <Head>
        <title>AnimeStream+ - Premium Streaming</title>
        <meta name="description" content="Premium anime streaming with admin panel" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </Head>
      <AnimeApp />
    </>
  );
}
