import { ApiValidationResult } from '../types/auth';

class ClaudeApiService {
  private baseUrl = 'https://api.anthropic.com/v1';

  async validateApiKey(apiKey: string): Promise<ApiValidationResult> {
    if (!apiKey || !apiKey.startsWith('sk-ant-')) {
      return {
        isValid: false,
        error: 'Invalid API key format. Claude API keys start with "sk-ant-"'
      };
    }

    try {
      // Test the API key with a simple request
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [
            {
              role: 'user',
              content: 'Test connection'
            }
          ]
        })
      });

      if (response.ok) {
        return {
          isValid: true,
          userInfo: {
            usage: {
              requests: 1,
              tokens: 10
            }
          }
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = 'Failed to validate API key';
        
        if (response.status === 401) {
          errorMessage = 'Invalid API key or insufficient permissions';
        } else if (response.status === 429) {
          errorMessage = 'API rate limit exceeded. Please try again later';
        } else if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }

        return {
          isValid: false,
          error: errorMessage
        };
      }
    } catch (error) {
      console.error('API validation error:', error);
      return {
        isValid: false,
        error: 'Network error. Please check your internet connection.'
      };
    }
  }

  async testConnection(apiKey: string): Promise<boolean> {
    const result = await this.validateApiKey(apiKey);
    return result.isValid;
  }
}

export const claudeApiService = new ClaudeApiService();
