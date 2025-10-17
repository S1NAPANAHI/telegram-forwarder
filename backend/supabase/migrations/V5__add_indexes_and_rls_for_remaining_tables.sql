-- V5: Add Indexes and RLS Policies for Remaining Tables

-- Indexes
CREATE INDEX IF NOT EXISTS idx_message_filters_user_id ON message_filters(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_id ON rate_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_discovered_chats_user_id ON discovered_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_message_feed_user_id ON message_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_message_queue_user_id ON message_queue(user_id);

-- RLS Policies
ALTER TABLE message_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovered_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own message_filters" ON message_filters
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own notifications" ON notifications
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own rate_limits" ON rate_limits
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own audit_logs" ON audit_logs
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own discovered_chats" ON discovered_chats
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own message_feed" ON message_feed
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own message_queue" ON message_queue
    FOR ALL USING (auth.uid() = user_id);
