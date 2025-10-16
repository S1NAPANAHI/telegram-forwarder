// DiscoveryDashboard.jsx - Phase 3: Frontend Integration
// Enhanced channels page with discovery management and bulk operations

import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, message, Modal, Input, Select, Spin, Tooltip, Space, Divider } from 'antd';
import { 
  ScanOutlined, 
  ReloadOutlined, 
  PlusOutlined, 
  SettingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useApi } from '../hooks/useApi';
import { useTranslation } from 'react-i18next';

const { Option } = Select;
const { confirm } = Modal;

const DiscoveryDashboard = () => {
  const { t } = useTranslation();
  const api = useApi();
  
  // State management
  const [discoveredChats, setDiscoveredChats] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [discoveryStatus, setDiscoveryStatus] = useState(null);
  const [selectedChats, setSelectedChats] = useState([]);
  const [filters, setFilters] = useState({
    adminOnly: false,
    notPromoted: false,
    chatType: 'all',
    search: ''
  });
  const [promotionModal, setPromotionModal] = useState({ visible: false, chatId: null, chatName: '' });

  // Load data on component mount
  useEffect(() => {
    loadDiscoveryData();
    loadDiscoveryStatus();
  }, []);

  // Load discovered chats and channels
  const loadDiscoveryData = async () => {
    setLoading(true);
    try {
      const [discoveryResponse, channelsResponse] = await Promise.all([
        api.get('/api/discovery'),
        api.get('/api/channels')
      ]);
      
      if (discoveryResponse.success) {
        setDiscoveredChats(discoveryResponse.chats || []);
      }
      
      setChannels(channelsResponse.data || []);
    } catch (error) {
      message.error(t('discovery.loadError', 'Failed to load discovery data'));
      console.error('Load discovery data error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load discovery status
  const loadDiscoveryStatus = async () => {
    try {
      const response = await api.get('/api/discovery/status');
      if (response.success) {
        setDiscoveryStatus(response.status);
      }
    } catch (error) {
      console.error('Load discovery status error:', error);
    }
  };

  // Trigger chat discovery scan
  const handleDiscoveryScan = async () => {
    setScanning(true);
    try {
      const response = await api.post('/api/discovery/scan');
      
      if (response.success) {
        message.success(t('discovery.scanSuccess', `Discovered ${response.summary.total_discovered} chats`));
        await loadDiscoveryData();
        await loadDiscoveryStatus();
      } else {
        throw new Error(response.error || 'Scan failed');
      }
    } catch (error) {
      message.error(t('discovery.scanError', 'Discovery scan failed'));
      console.error('Discovery scan error:', error);
    } finally {
      setScanning(false);
    }
  };

  // Refresh admin statuses
  const handleRefreshStatuses = async () => {
    setLoading(true);
    try {
      const response = await api.post('/api/discovery/refresh');
      
      if (response.success) {
        message.success(t('discovery.refreshSuccess', `Updated ${response.checked} chat statuses`));
        await loadDiscoveryData();
      } else {
        throw new Error(response.error || 'Refresh failed');
      }
    } catch (error) {
      message.error(t('discovery.refreshError', 'Failed to refresh statuses'));
      console.error('Refresh error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Promote single chat to channels
  const handlePromoteChat = async (chatId, channelName) => {
    try {
      const response = await api.post(`/api/discovery/${chatId}/promote`, {
        channel_name: channelName
      });
      
      if (response.success) {
        message.success(t('discovery.promoteSuccess', 'Chat promoted successfully'));
        await loadDiscoveryData();
        setPromotionModal({ visible: false, chatId: null, chatName: '' });
      } else {
        throw new Error(response.error || 'Promotion failed');
      }
    } catch (error) {
      if (error.message?.includes('already promoted')) {
        message.warning(t('discovery.alreadyPromoted', 'Chat already promoted'));
      } else {
        message.error(t('discovery.promoteError', 'Failed to promote chat'));
      }
      console.error('Promote chat error:', error);
    }
  };

  // Bulk promote selected chats
  const handleBulkPromote = async () => {
    if (selectedChats.length === 0) {
      message.warning(t('discovery.selectChatsFirst', 'Please select chats to promote'));
      return;
    }

    confirm({
      title: t('discovery.confirmBulkPromote', 'Promote Selected Chats'),
      content: t('discovery.bulkPromoteMessage', `Promote ${selectedChats.length} selected chats to monitored channels?`),
      onOk: async () => {
        try {
          const response = await api.post('/api/discovery/bulk-promote', {
            chat_ids: selectedChats
          });
          
          if (response.success) {
            message.success(
              t('discovery.bulkPromoteSuccess', 
                `Successfully promoted ${response.results.length} of ${selectedChats.length} chats`
              )
            );
            
            if (response.errors.length > 0) {
              message.warning(
                t('discovery.bulkPromotePartial', 
                  `${response.errors.length} chats could not be promoted`
                )
              );
            }
            
            setSelectedChats([]);
            await loadDiscoveryData();
          } else {
            throw new Error(response.error || 'Bulk promotion failed');
          }
        } catch (error) {
          message.error(t('discovery.bulkPromoteError', 'Bulk promotion failed'));
          console.error('Bulk promote error:', error);
        }
      }
    });
  };

  // Filter discovered chats
  const getFilteredChats = () => {
    return discoveredChats.filter(chat => {
      if (filters.adminOnly && !chat.is_admin) return false;
      if (filters.notPromoted && chat.is_promoted) return false;
      if (filters.chatType !== 'all' && chat.chat_type !== filters.chatType) return false;
      if (filters.search && !chat.chat_title?.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  };

  // Table columns configuration
  const columns = [
    {
      title: t('discovery.chatName', 'Chat Name'),
      dataIndex: 'chat_title',
      key: 'chat_title',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          {record.chat_username && (
            <div className="text-sm text-gray-500">@{record.chat_username}</div>
          )}
        </div>
      ),
    },
    {
      title: t('discovery.type', 'Type'),
      dataIndex: 'chat_type',
      key: 'chat_type',
      render: (type) => (
        <Badge 
          color={type === 'channel' ? 'blue' : 'green'}
          text={type.charAt(0).toUpperCase() + type.slice(1)}
        />
      ),
    },
    {
      title: t('discovery.adminStatus', 'Admin Status'),
      dataIndex: 'is_admin',
      key: 'is_admin',
      render: (isAdmin) => (
        <Badge
          status={isAdmin ? 'success' : 'default'}
          text={isAdmin ? t('discovery.admin', 'Admin') : t('discovery.member', 'Member')}
        />
      ),
    },
    {
      title: t('discovery.members', 'Members'),
      dataIndex: 'member_count',
      key: 'member_count',
      render: (count) => count ? count.toLocaleString() : '-',
    },
    {
      title: t('discovery.discoveryMethod', 'Method'),
      dataIndex: 'discovery_method',
      key: 'discovery_method',
      render: (method) => (
        <Badge
          color={method === 'bot_api' ? 'green' : 'orange'}
          text={method === 'bot_api' ? 'Bot API' : 'Client API'}
        />
      ),
    },
    {
      title: t('discovery.status', 'Status'),
      dataIndex: 'is_promoted',
      key: 'is_promoted',
      render: (isPromoted) => (
        <Badge
          status={isPromoted ? 'success' : 'processing'}
          text={isPromoted ? t('discovery.promoted', 'Promoted') : t('discovery.discovered', 'Discovered')}
        />
      ),
    },
    {
      title: t('discovery.actions', 'Actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          {!record.is_promoted && (
            <Tooltip title={t('discovery.promoteTooltip', 'Promote to monitored channel')}>
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => setPromotionModal({ 
                  visible: true, 
                  chatId: record.chat_id, 
                  chatName: record.chat_title 
                })}
              >
                {t('discovery.promote', 'Promote')}
              </Button>
            </Tooltip>
          )}
          
          <Tooltip title={t('discovery.viewDetails', 'View chat details')}>
            <Button
              size="small"
              icon={<InfoCircleOutlined />}
              onClick={() => {
                Modal.info({
                  title: record.chat_title,
                  content: (
                    <div className="space-y-2">
                      <p><strong>Type:</strong> {record.chat_type}</p>
                      <p><strong>Username:</strong> {record.chat_username || 'N/A'}</p>
                      <p><strong>Members:</strong> {record.member_count?.toLocaleString() || 'N/A'}</p>
                      <p><strong>Admin Status:</strong> {record.is_admin ? 'Admin' : 'Member'}</p>
                      <p><strong>Discovery Method:</strong> {record.discovery_method}</p>
                      <p><strong>Last Discovered:</strong> {new Date(record.last_discovered).toLocaleString()}</p>
                    </div>
                  ),
                });
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Row selection configuration
  const rowSelection = {
    selectedRowKeys: selectedChats,
    onChange: setSelectedChats,
    getCheckboxProps: (record) => ({
      disabled: record.is_promoted, // Disable selection for already promoted chats
    }),
  };

  const filteredChats = getFilteredChats();

  return (
    <div className="space-y-6">
      {/* Header with status cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card size="small">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {discoveryStatus?.discovered_chats || 0}
            </div>
            <div className="text-sm text-gray-500">{t('discovery.totalDiscovered', 'Total Discovered')}</div>
          </div>
        </Card>
        
        <Card size="small">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {discoveryStatus?.admin_chats || 0}
            </div>
            <div className="text-sm text-gray-500">{t('discovery.adminChats', 'Admin Chats')}</div>
          </div>
        </Card>
        
        <Card size="small">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {discoveryStatus?.member_chats || 0}
            </div>
            <div className="text-sm text-gray-500">{t('discovery.memberChats', 'Member Chats')}</div>
          </div>
        </Card>
        
        <Card size="small">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {discoveryStatus?.active_channels || 0}
            </div>
            <div className="text-sm text-gray-500">{t('discovery.activeChannels', 'Active Channels')}</div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card title={t('discovery.chatDiscovery', 'Chat Discovery')} size="small">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              type="primary"
              icon={<ScanOutlined />}
              loading={scanning}
              onClick={handleDiscoveryScan}
            >
              {t('discovery.scanChats', 'Scan Chats')}
            </Button>
            
            <Button
              icon={<ReloadOutlined />}
              loading={loading}
              onClick={handleRefreshStatuses}
            >
              {t('discovery.refreshStatuses', 'Refresh Statuses')}
            </Button>
            
            <Button
              type="primary"
              icon={<PlusOutlined />}
              disabled={selectedChats.length === 0}
              onClick={handleBulkPromote}
            >
              {t('discovery.promoteSelected', 'Promote Selected')} ({selectedChats.length})
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Input.Search
              placeholder={t('discovery.searchPlaceholder', 'Search chats...')}
              style={{ width: 200 }}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            
            <Select
              value={filters.chatType}
              style={{ width: 120 }}
              onChange={(value) => setFilters({ ...filters, chatType: value })}
            >
              <Option value="all">{t('discovery.allTypes', 'All Types')}</Option>
              <Option value="group">{t('discovery.groups', 'Groups')}</Option>
              <Option value="supergroup">{t('discovery.supergroups', 'Supergroups')}</Option>
              <Option value="channel">{t('discovery.channels', 'Channels')}</Option>
            </Select>
            
            <Select
              value={filters.adminOnly ? 'admin' : filters.notPromoted ? 'notPromoted' : 'all'}
              style={{ width: 150 }}
              onChange={(value) => {
                if (value === 'admin') {
                  setFilters({ ...filters, adminOnly: true, notPromoted: false });
                } else if (value === 'notPromoted') {
                  setFilters({ ...filters, adminOnly: false, notPromoted: true });
                } else {
                  setFilters({ ...filters, adminOnly: false, notPromoted: false });
                }
              }}
            >
              <Option value="all">{t('discovery.allStatuses', 'All Statuses')}</Option>
              <Option value="admin">{t('discovery.adminOnly', 'Admin Only')}</Option>
              <Option value="notPromoted">{t('discovery.notPromoted', 'Not Promoted')}</Option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Discovered chats table */}
      <Card title={`${t('discovery.discoveredChats', 'Discovered Chats')} (${filteredChats.length})`} size="small">
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredChats}
            rowKey="chat_id"
            rowSelection={rowSelection}
            size="small"
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} chats`,
            }}
          />
        </Spin>
      </Card>

      {/* Promotion Modal */}
      <Modal
        title={t('discovery.promoteChat', 'Promote Chat')}
        visible={promotionModal.visible}
        onCancel={() => setPromotionModal({ visible: false, chatId: null, chatName: '' })}
        onOk={() => {
          handlePromoteChat(promotionModal.chatId, promotionModal.channelName || promotionModal.chatName);
        }}
      >
        <div className="space-y-4">
          <p>{t('discovery.promoteMessage', 'Promote this chat to a monitored channel?')}</p>
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('discovery.chatName', 'Chat Name')}
            </label>
            <Input
              value={promotionModal.channelName || promotionModal.chatName}
              onChange={(e) => setPromotionModal({
                ...promotionModal,
                channelName: e.target.value
              })}
              placeholder={t('discovery.channelNamePlaceholder', 'Enter channel name...')}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DiscoveryDashboard;