import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import i18nextConfig from '../next-i18next.config';

export default function Home() {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800">{t('welcome')}</h1>
      <p className="mt-4 text-lg text-gray-600">
        <Link href="/dashboard" className="text-blue-500 hover:underline">
          {t('goToDashboard')}
        </Link>
      </p>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const lng = locale || 'fa';
  console.log('getStaticProps: Received locale', locale);
  const translations = await serverSideTranslations(lng, ['common'], i18nextConfig);
  console.log('getStaticProps: Loaded translations for locale', lng, translations);
  return {
    props: {
      ...translations,
    },
  };
};