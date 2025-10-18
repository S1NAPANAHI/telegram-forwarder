import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { withAuth } from '../../lib/withAuth';
import api from '../../lib/api';
import { useState } from 'react';

const TelegramClientPage = () => {
  const queryClient = useQueryClient();
  const [showCodeInput, setShowCodeInput] = useState(false);

  const { data: status, isLoading } = useQuery('telegramClientStatus', async () => {
    const { data } = await api.get('/api/telegram-client/status');
    return data;
  });

  const { register, handleSubmit, setValue } = useForm();
  const { register: registerCode, handleSubmit: handleSubmitCode } = useForm();

  const saveCredentials = useMutation(
    async (data: any) => {
      const response = await api.post('/api/telegram-client/credentials', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('telegramClientStatus');
      },
    }
  );

  const login = useMutation(
    async () => {
      const response = await api.post('/api/telegram-client/login');
      return response.data;
    },
    {
      onSuccess: () => {
        setShowCodeInput(true);
      },
    }
  );

  const submitCode = useMutation(
    async (data: any) => {
      const response = await api.post('/api/telegram-client/submit-code', data);
      return response.data;
    },
    {
      onSuccess: () => {
        setShowCodeInput(false);
        queryClient.invalidateQueries('telegramClientStatus');
      },
    }
  );

  const disconnect = useMutation(
    async () => {
      const response = await api.post('/api/telegram-client/disconnect');
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('telegramClientStatus');
      },
    }
  );

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
      <h1 className="text-2xl font-bold mb-4">Telegram Client</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Status</h2>
        <p>Status: {status?.status || 'Unknown'}</p>
        <p>Phone: {status?.phone || 'Not set'}</p>
        <p>Active: {status?.isActive ? 'Yes' : 'No'}</p>
        {status?.lastError && <p className="text-red-500">Last Error: {status.lastError}</p>}
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">Configuration</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="apiId" className="block mb-1">API ID</label>
              <input
                id="apiId"
                type="text"
                {...register('apiId')}
                className="w-full p-2 border rounded"
                defaultValue={status?.apiId}
              />
            </div>
            <div>
              <label htmlFor="apiHash" className="block mb-1">API Hash</label>
              <input
                id="apiHash"
                type="text"
                {...register('apiHash')}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block mb-1">Phone Number</label>
              <input
                id="phone"
                type="text"
                {...register('phone')}
                className="w-full p-2 border rounded"
                defaultValue={status?.phone}
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
              Save Credentials
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Connection</h2>
          <div className="space-x-4">
            <button onClick={onLogin} className="px-4 py-2 bg-green-500 text-white rounded">
              Login
            </button>
            <button onClick={onDisconnect} className="px-4 py-2 bg-red-500 text-white rounded">
              Disconnect
            </button>
          </div>
        </div>

        {showCodeInput && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Enter Phone Code</h2>
            <form onSubmit={handleSubmitCode(onSubmitCode)} className="space-y-4">
              <div>
                <label htmlFor="code" className="block mb-1">Code</label>
                <input
                  id="code"
                  type="text"
                  {...registerCode('code')}
                  className="w-full p-2 border rounded"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
                Submit Code
              </button>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default withAuth(TelegramClientPage);