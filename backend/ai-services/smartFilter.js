const axios = require('axios');

class SmartFilter {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
  }

  async shouldForwardMessage(message, keyword, context) {
    // Rule-based filtering first
    if (this.isSpam(message)) return false;
    if (this.isIrrelevant(message, keyword)) return false;

    // AI-based filtering for ambiguous cases
    if (await this.isFalsePositive(message, keyword, context)) return false;

    return true;
  }

  isSpam(message) {
    const spamIndicators = [
      'www.', 'http://', 'https://', '.com', '.org',
      'کلیک کنید', 'عضویت', 'خرید', 'فروش'
    ];
    
    return spamIndicators.some(indicator => 
      message.toLowerCase().includes(indicator.toLowerCase())
    );
  }

  isIrrelevant(message, keyword) {
    // Check if keyword appears in irrelevant context
    const irrelevantPatterns = {
      'انقلاب': ['انقلاب اسلامی', 'انقلاب صنعتی'],
      'منیریه': ['خیابان منیریه', 'میدان منیریه']
    };

    const patterns = irrelevantPatterns[keyword];
    if (patterns) {
      return patterns.some(pattern => message.includes(pattern));
    }

    return false;
  }

  async isFalsePositive(message, keyword, context) {
    if (!this.openaiApiKey) {
      console.warn('OPENAI_API_KEY is not set. Skipping AI false positive check.');
      return false; // Default to not false positive if API key is missing
    }
    try {
      const prompt = `
        Analyze if this message is actually about "${keyword}" in the context of Iranian news.
        
        Message: "${message}"
        Context: ${context}
        
        Respond with only "YES" or "NO". Respond "YES" if the message is genuinely about ${keyword} in a news context.
        Respond "NO" if it's a false positive, irrelevant, or spam.
      `;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 10,
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const answer = response.data.choices[0].message.content.trim();
      return answer === 'NO';
    } catch (error) {
      console.error('AI filtering error:', error);
      return false; // Default to forwarding if AI fails
    }
  }

  async extractKeyInformation(message) {
    if (!this.openaiApiKey) {
      console.warn('OPENAI_API_KEY is not set. Skipping AI key information extraction.');
      return null;
    }
    try {
      const prompt = `
        Extract key information from this Persian news message in JSON format:
        
        Message: "${message}"
        
        Return JSON with: {
          "locations": string[],
          "entities": string[],
          "event_type": string,
          "urgency": "high" | "medium" | "low"
        }
      `;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 200,
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return JSON.parse(response.data.choices[0].message.content.trim());
    } catch (error) {
      console.error('AI extraction error:', error);
      return null;
    }
  }
}

module.exports = SmartFilter;