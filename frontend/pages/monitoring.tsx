import RouteGuard from '../components/auth/RouteGuard';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import Layout from '../components/Layout';

function Monitoring() {
  const { t } = useTranslation('common');
  
  return (
    <RouteGuard>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('monitoringControl')}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('monitorBotPerformance')}
            </p>
          </div>
          
          {/* Content will be implemented later */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <p className="text-gray-500 dark:text-gray-400">
              {t('monitoringComingSoon') || 'Real-time monitoring coming soon...'}
            </p>
          </div>
        </div>
      </Layout>
    </RouteGuard>
  );
}

export default Monitoring;

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || 'fa', ['common'])),
  },
});