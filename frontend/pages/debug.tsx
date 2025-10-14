import Head from 'next/head';
import Link from 'next/link';

export default function Debug() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const isTelegram = typeof window !== 'undefined' && !!(window as any)?.Telegram?.WebApp?.initData;

  return (
    <>
      <Head>
        <title>Debug</title>
        <script src="https://telegram.org/js/telegram-web-app.js" async></script>
      </Head>
      <div className="min-h-screen p-6 space-y-4 text-gray-800">
        <h1 className="text-2xl font-bold">WebApp Debug</h1>
        <div className="space-y-2">
          <div><b>NEXT_PUBLIC_API_URL:</b> {apiUrl || 'undefined'}</div>
          <div><b>Telegram initData detected:</b> {String(isTelegram)}</div>
          <div>
            <b>Links:</b> <Link className="text-blue-600 underline" href="/webapp">/webapp</Link> |{' '}
            <Link className="text-blue-600 underline" href="/dashboard">/dashboard</Link>
          </div>
        </div>
      </div>
    </>
  );
}
