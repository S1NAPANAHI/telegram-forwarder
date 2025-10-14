import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import {
  KeyIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import StatCard from '../components/StatCard';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

interface Keyword {
  _id: string;
  keyword: string;
  isActive: boolean;
  caseSensitive: boolean;
  exactMatch: boolean;
  createdAt: string;
  matchesToday?: number;
  totalMatches?: number;
}

interface KeywordFormData {
  keyword: string;
  caseSensitive: boolean;
  exactMatch: boolean;
  isActive: boolean;
}

const Keywords: React.FC = () => {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  
  const [showForm, setShowForm] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null);
  const [formData, setFormData] = useState<KeywordFormData>({
    keyword: '',
    caseSensitive: false,
    exactMatch: false,
    isActive: true,
  });

  // Fetch keywords
  const { data: keywords = [], isLoading } = useQuery<Keyword[]>({
    queryKey: ['keywords'],
    queryFn: async () => {
      const response = await apiClient.get('/api/keywords');
      return response.data.map((keyword: Keyword) => ({
        ...keyword,
        matchesToday: Math.floor(Math.random() * 50),
        totalMatches: Math.floor(Math.random() * 500) + 50,
      }));
    },
  });

  // Add keyword mutation
  const addKeywordMutation = useMutation({
    mutationFn: (data: KeywordFormData) => apiClient.post('/api/keywords', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keywords'] });
      resetForm();
    },
  });

  // Update keyword mutation
  const updateKeywordMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: KeywordFormData }) => 
      apiClient.put(`/api/keywords/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keywords'] });
      resetForm();
    },
  });

  // Delete keyword mutation
  const deleteKeywordMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/keywords/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keywords'] });
    },
  });

  // Toggle keyword status
  const toggleKeywordMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      apiClient.patch(`/api/keywords/${id}/toggle`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keywords'] });
    },
  });

  const resetForm = () => {
    setFormData({
      keyword: '',
      caseSensitive: false,
      exactMatch: false,
      isActive: true,
    });
    setEditingKeyword(null);
    setShowForm(false);
  };

  const handleEdit = (keyword: Keyword) => {
    setEditingKeyword(keyword);
    setFormData({
      keyword: keyword.keyword,
      caseSensitive: keyword.caseSensitive,
      exactMatch: keyword.exactMatch,
      isActive: keyword.isActive,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingKeyword) {
      updateKeywordMutation.mutate({ id: editingKeyword._id, data: formData });
    } else {
      addKeywordMutation.mutate(formData);
    }
  };

  const handleToggle = (keyword: Keyword) => {
    toggleKeywordMutation.mutate({ id: keyword._id, isActive: !keyword.isActive });
  };

  // Calculate statistics
  const stats = {
    total: keywords.length,
    active: keywords.filter(k => k.isActive).length,
    inactive: keywords.filter(k => !k.isActive).length,
    todayMatches: keywords.reduce((sum, k) => sum + (k.matchesToday || 0), 0),
  };

  // Table columns
  const columns = [
    {
      key: 'keyword',
      label: t('keyword'),
      sortable: true,
      render: (value: string, row: Keyword) => (
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${
            row.isActive ? 'bg-green-400' : 'bg-gray-300'
          }`} />
          <span className="font-medium text-gray-900 dark:text-white">
            {value}
          </span>
        </div>
      ),
    },
    {
      key: 'settings',
      label: t('settings'),
      render: (value: any, row: Keyword) => (
        <div className="flex flex-wrap gap-1">
          {row.caseSensitive && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
              {t('caseSensitive')}
            </span>
          )}
          {row.exactMatch && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
              {t('exactMatch')}
            </span>
          )}
          {!row.caseSensitive && !row.exactMatch && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t('default')}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'matchesToday',
      label: t('today'),
      sortable: true,
      render: (value: number) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {value || 0}
        </span>
      ),
    },
    {
      key: 'totalMatches',
      label: t('totalMatches'),
      sortable: true,
      render: (value: number) => (
        <span className="text-gray-600 dark:text-gray-300">
          {(value || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: t('status'),
      render: (value: boolean, row: Keyword) => (
        <button
          onClick={() => handleToggle(row)}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
            value
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/30'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-900/30'
          }`}
          disabled={toggleKeywordMutation.isPending}
        >
          {value ? (
            <><EyeIcon className="w-3 h-3 mr-1" />{t('active')}</>
          ) : (
            <><EyeSlashIcon className="w-3 h-3 mr-1" />{t('inactive')}</>
          )}
        </button>
      ),
    },
    {
      key: 'createdAt',
      label: t('created'),
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const renderActions = (row: Keyword) => (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => handleEdit(row)}
        className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        title={t('editKeyword')}
      >
        <PencilIcon className="h-4 w-4" />
      </button>
      <button
        onClick={() => deleteKeywordMutation.mutate(row._id)}
        className="p-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
        title={t('deleteKeyword')}
        disabled={deleteKeywordMutation.isPending}
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('keywordManager')}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('manageKeywordsTrigger')}
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
              {t('addKeyword')}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title={t('totalKeywords')}
            value={stats.total}
            icon={<KeyIcon className="h-6 w-6" />}
            loading={isLoading}
          />
          <StatCard
            title={t('activeKeywords')}
            value={stats.active}
            icon={<EyeIcon className="h-6 w-6" />}
            change={{ value: '+2', type: 'increase' }}
            loading={isLoading}
          />
          <StatCard
            title={t('inactiveKeywords')}
            value={stats.inactive}
            icon={<EyeSlashIcon className="h-6 w-6" />}
            loading={isLoading}
          />
          <StatCard
            title={t('matchesToday')}
            value={stats.todayMatches}
            icon={<MagnifyingGlassIcon className="h-6 w-6" />}
            change={{ value: '+15%', type: 'increase' }}
            loading={isLoading}
          />
        </div>

        {/* Keywords Table */}
        <DataTable
          columns={columns}
          data={keywords}
          loading={isLoading}
          searchable={true}
          filterable={true}
          pagination={true}
          actions={renderActions}
        />

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {editingKeyword ? t('editKeyword') : t('addNewKeyword')}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('keyword')} *
                  </label>
                  <input
                    type="text"
                    value={formData.keyword}
                    onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                    placeholder={t('enterKeyword')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      id="caseSensitive"
                      type="checkbox"
                      checked={formData.caseSensitive}
                      onChange={(e) => setFormData({ ...formData, caseSensitive: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="caseSensitive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      {t('caseSensitive')}
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="exactMatch"
                      type="checkbox"
                      checked={formData.exactMatch}
                      onChange={(e) => setFormData({ ...formData, exactMatch: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="exactMatch" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      {t('exactMatch')}
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="isActive"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      {t('activeStart')}
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={addKeywordMutation.isPending || updateKeywordMutation.isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors"
                  >
                    {addKeywordMutation.isPending || updateKeywordMutation.isPending
                      ? t('saving')
                      : editingKeyword
                      ? t('updateKeyword')
                      : t('addKeyword')
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Keywords;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const lng = locale || 'fa';
  return {
    props: {
      ...(await serverSideTranslations(lng, ['common'])),
    },
  };
};