const natural = require('natural');
const persianPreprocess = require('persian-preprocess');
const supabase = require('../database/supabase');

class DuplicateDetector {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.similarityThreshold = 0.8;
  }

  async isDuplicate(userId, newMessage, keywordId) {
    const { data: recentLogs, error } = await supabase
      .from('message_logs')
      .select('original_message_text')
      .eq('user_id', userId)
      .eq('keyword_id', keywordId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(50);

    if (error) {
      throw new Error(error.message);
    }

    const processedNewMessage = this.preprocessText(newMessage);

    for (const log of recentLogs) {
      const similarity = this.calculateSimilarity(
        processedNewMessage,
        this.preprocessText(log.original_message_text)
      );

      if (similarity >= this.similarityThreshold) {
        return true;
      }
    }

    return false;
  }

  preprocessText(text) {
    if (!text) return '';

    const processedText = persianPreprocess(text)
      .normalize()
      .stopword()
      .toString();

    const tokens = this.tokenizer.tokenize(processedText);

    return tokens.join(' ');
  }

  calculateSimilarity(text1, text2) {
    if (!text1 || !text2) return 0;

    return natural.JaroWinklerDistance(text1, text2, {});
  }

  async updateSimilarityThreshold(userId, feedback) {
    if (feedback === 'too_many_duplicates') {
      this.similarityThreshold = Math.min(0.9, this.similarityThreshold + 0.05);
    } else if (feedback === 'missed_duplicates') {
      this.similarityThreshold = Math.max(0.6, this.similarityThreshold - 0.05);
    }

    const { error } = await supabase
      .from('users')
      .update({ similarity_threshold: this.similarityThreshold })
      .eq('id', userId);

    if (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = DuplicateDetector;