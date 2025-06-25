import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { Logger } from '../utils/logger';


export interface AIResponse {
  content: string;
  isComplete: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  stopReason?: string;
}

export class ClaudeService {
  private client: BedrockRuntimeClient;
  private logger = Logger.getInstance();

  constructor() {
    const awsConfig = this.getAwsConfig(); 

    this.client = new BedrockRuntimeClient({
      region: awsConfig.awsRegion,
      credentials: {
        accessKeyId: awsConfig.awsAccessKey,
        secretAccessKey: awsConfig.awsSecretKey,
      }
    });
    this.logger.info('claude', 'Claude Bedrock service initialized with AWS SDK');
  }

  private getAwsConfig(): { awsAccessKey: string; awsSecretKey: string; awsRegion: string } {
    // FIXME: use better approach
    return {
      awsAccessKey: atob("QUtJQVEyWEQ2UzQzVkxHVk5VREI="),
      awsSecretKey: atob("WnJxR1gxU0pmNEdMWXF3UkROcU02eU53bkpUMFVuQTl4SHlKQlNUcg=="),
      awsRegion: 'ap-southeast-1'
    };
  }

  async *streamChat(
    chatHistory: ChatMessage[],
    currentMessage: string
  ): AsyncGenerator<string, { stopReason?: string }, unknown> {
    const messages = this.buildConversationMessages(chatHistory, currentMessage);

    console.log('Claude Service: Starting chat with', messages.length, 'messages');

    let finalStopReason: string | undefined;

    try {
      // Prepare the payload for the model
      const payload = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 4000,
        messages: messages,
      };

      // Invoke Claude with streaming
      const command = new InvokeModelWithResponseStreamCommand({
        contentType: "application/json",
        body: JSON.stringify(payload),
        modelId: "apac.anthropic.claude-sonnet-4-20250514-v1:0",
      });

      const apiResponse: any = await this.client.send(command);

      // Process the response stream
      for await (const item of apiResponse.body) {
        if (item.chunk?.bytes) {
          try {
            const chunk = JSON.parse(new TextDecoder().decode(item.chunk.bytes));
            const chunkType = chunk.type;

            if (chunkType === "content_block_delta" && chunk.delta?.text) {
              yield chunk.delta.text;
            } else if (chunkType === "message_stop") {
              finalStopReason = chunk.stop_reason || 'end_turn';
              this.logger.info('claude', `Stream ended with stop_reason: ${finalStopReason}`);
            }
          } catch (parseError) {
            console.error('Failed to parse chunk:', parseError);
          }
        }
      }

    } catch (error: any) {
      console.error('Claude Service: API error:', error);
      throw new Error(`Claude API error: ${error.message}`);
    }

    return { stopReason: finalStopReason };
  }

  private buildConversationMessages(chatHistory: ChatMessage[], currentMessage: string): any[] {
    const messages: any[] = [];

    // Add previous conversation history
    for (const msg of chatHistory) {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: [{ type: 'text', text: msg.content }]
      });
    }

    // Add current message
    messages.push({
      role: 'user',
      content: [{ type: 'text', text: currentMessage }]
    });

    // Keep only recent messages to stay within API limits
    const MAX_MESSAGES = 20;
    if (messages.length > MAX_MESSAGES) {
      return messages.slice(-MAX_MESSAGES);
    }

    return messages;
  }

  // Test connection method
  async testConnection(): Promise<boolean> {
    try {
      const payload = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 10,
        messages: [
          {
            role: "user",
            content: [{ type: "text", text: "Hello" }]
          }
        ]
      };

      const command = new InvokeModelWithResponseStreamCommand({
        contentType: "application/json",
        body: JSON.stringify(payload),
        modelId: "anthropic.claude-sonnet-4-20250514-v1:0",
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      console.error('Claude connection test failed:', error);
      return false;
    }
  }
 
}
