import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { withAuth } from '../lib/withAuth';
import api from '../lib/api';
import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';

const TelegramClientPage = () => {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  const [showCodeInput, setShowCodeInput] = useState(false);

  const { data: status, isLoading } = useQuery({
    queryKey: ['telegramClientStatus'],
    queryFn: async () => {
      const { data } = await api.get('/api/telegram-client/status');
      return data;
    },
  });

  const { register, handleSubmit, setValue } = useForm();
  const { register: registerCode, handleSubmit: handleSubmitCode } = useForm();

  const saveCredentials = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/api/telegram-client/credentials', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegramClientStatus'] });
    },
  });

  const login = useMutation({
    mutationFn: async () => {
      const response = await api.post('/api/telegram-client/login');
      return response.data;
    },
    onSuccess: () => {
      setShowCodeInput(true);
    },
  });

  const submitCode = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/api/telegram-client/submit-code', data);
      return response.data;
    },
    onSuccess: () => {
      setShowCodeInput(false);
      queryClient.invalidateQueries({ queryKey: ['telegramClientStatus'] });
    },
  });

  const disconnect = useMutation({
    mutationFn: async () => {
      const response = await api.post('/api/telegram-client/disconnect');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegramClientStatus'] });
    },
  });

  const onSubmit = (data: any) => {
    saveCredentials.mutate(data);
  };

  const onLogin = () => {
    login.mutate();
  };

  const onSubmitCode = (data: any) => {
    submitCode.mutate(data);
  };

  const onDisconnect = () => {
    disconnect.mutate();
  };

  if (isLoading) {
    return <Layout>Loading...</Layout>;
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">{t('telegramClient')}</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">{t('status')}</h2>
        <p>{t('status')}: {status?.status || t('unknown')}</p>
        <p>{t('phone')}: {status?.phone || t('notSet')}</p>
        <p>{t('active')}: {status?.isActive ? t('yes') : t('no')}</p>
        {status?.lastError && <p className="text-red-500">{t('lastError')}: {status.lastError}</p>}
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">{t('configuration')}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="apiId" className="block mb-1">{t('apiId')}</label>
              <input
                id="apiId"
                type="text"
                {...register('apiId')}
                className="w-full p-2 border rounded"
                defaultValue={status?.apiId}
              />
            </div>
            <div>
              <label htmlFor="apiHash" className="block mb-1">{t('apiHash')}</label>
              <input
                id="apiHash"
                type="text"
                {...register('apiHash')}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block mb-1">{t('phoneNumber')}</label>
              <input
                id="phone"
                type="text"
                {...register('phone')}
                className="w-full p-2 border rounded"
                defaultValue={status?.phone}
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
              {t('saveCredentials')}
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">{t('connection')}</h2>
          <div className="space-x-4">
            <button onClick={onLogin} className="px-4 py-2 bg-green-500 text-white rounded">
              {t('login')}
            </button>
            <button onClick={onDisconnect} className="px-4 py-2 bg-red-500 text-white rounded">
              {t('disconnect')}
            </button>
          </div>
        </div>

        {showCodeInput && (
          <div>
            <h2 className="text-xl font-semibold mb-2">{t('enterPhoneCode')}</h2>
            <form onSubmit={handleSubmitCode(onSubmitCode)} className="space-y-4">
              <div>
                <label htmlFor="code" className="block mb-1">{t('code')}</label>
                <input
                  id="code"
                  type="text"
                  {...registerCode('code')}
                  className="w-full p-2 border rounded"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
                {t('submitCode')}
              </button>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default withAuth(TelegramClientPage);

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || 'en', ['common'])),
  },
});