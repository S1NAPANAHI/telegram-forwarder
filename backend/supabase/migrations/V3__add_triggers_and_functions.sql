-- V3: Add Triggers and Functions

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_keywords_updated_at BEFORE UPDATE ON keywords
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON destinations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_logs_updated_at BEFORE UPDATE ON message_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create functions for common operations
CREATE OR REPLACE FUNCTION get_user_quota_usage(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'keywords_used', (SELECT COUNT(*) FROM keywords WHERE user_id = user_uuid AND is_active = true),
        'channels_used', (SELECT COUNT(*) FROM channels WHERE user_id = user_uuid AND is_active = true),
        'destinations_used', (SELECT COUNT(*) FROM destinations WHERE user_id = user_uuid AND is_active = true),
        'messages_today', (SELECT COUNT(*) FROM message_logs WHERE user_id = user_uuid AND created_at > CURRENT_DATE),
        'messages_this_month', (SELECT COUNT(*) FROM message_logs WHERE user_id = user_uuid AND created_at > DATE_TRUNC('month', CURRENT_DATE))
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_user_quota_usage IS 'Get current usage statistics for a user';
