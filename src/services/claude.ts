import Anthropic from '@anthropic-ai/sdk';
import { mcpService } from './mcpService';
import { ApiValidationResult } from '../types/auth';
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

export class ClaudeService {
    private client: Anthropic;
    private logger = Logger.getInstance();

    constructor(apiKey: string) {
        this.client = new Anthropic({
            apiKey,
            dangerouslyAllowBrowser: true
        });
        this.logger.info('claude', 'Claude service initialized with MCP integration');
    }

    async *streamChatWithHistory(
        chatHistory: ChatMessage[],
        currentMessage: string
    ): AsyncGenerator<string, { stopReason?: string }, unknown> {
        const systemPrompt = this.buildSystemPrompt();
        const tools = this.getMCPTools();
        let messages = this.buildConversationMessages(chatHistory, currentMessage);

        this.logger.info('claude', 'Starting stream chat', {
            messagesCount: messages.length,
            toolsCount: tools.length,
            workspaceRoot: mcpService.getWorkspaceRoot()
        });

        let finalStopReason: string | undefined;

        try {
            // Continue streaming until no more tools are needed
            while (true) {
                const stream = await this.client.messages.create({
                    model: "claude-sonnet-4-20250514",
                    max_tokens: 4000,
                    system: systemPrompt,
                    tools: tools.length > 0 ? tools : undefined,
                    messages: messages,
                    stream: true
                });

                let currentResponseContent: any[] = [];
                let pendingToolUses: any[] = [];
                let hasToolUse = false;
                let streamedText = '';

                for await (const chunk of stream) {
                    if (chunk.type === 'message_delta' && chunk.delta.stop_reason) {
                        finalStopReason = chunk.delta.stop_reason;
                        this.logger.info('claude', `Stream ended with stop_reason: ${finalStopReason}`);
                    } else if (chunk.type === 'content_block_start') {
                        if (chunk.content_block.type === 'tool_use') {
                            hasToolUse = true;
                            pendingToolUses.push({
                                id: chunk.content_block.id,
                                name: chunk.content_block.name,
                                input: {},
                                inputJson: ''
                            });
                            // Show brief tool usage indicator
                            yield `\n\n🔧 Using ${chunk.content_block.name}...\n`;
                        }
                    } else if (chunk.type === 'content_block_delta') {
                        if (chunk.delta.type === 'text_delta') {
                            // Stream text content to user
                            yield chunk.delta.text;
                            streamedText += chunk.delta.text;
                        } else if (chunk.delta.type === 'input_json_delta') {
                            // Accumulate tool input
                            const lastTool = pendingToolUses[pendingToolUses.length - 1];
                            if (lastTool) {
                                lastTool.inputJson += chunk.delta.partial_json;
                            }
                        }
                    } else if (chunk.type === 'content_block_stop') {
                        // Finalize tool input - always set input even if empty
                        const lastTool = pendingToolUses[pendingToolUses.length - 1];
                        if (lastTool) {
                            if (lastTool.inputJson.trim()) {
                                try {
                                    lastTool.input = JSON.parse(lastTool.inputJson);
                                    console.log("Parsed tool input:", lastTool.input);
                                } catch (parseError) {
                                    console.error(`Failed to parse tool input JSON: ${parseError}`);
                                    yield `\n❌ Tool input parsing failed\n`;
                                    lastTool.input = {}; // Default to empty object
                                }
                            } else {
                                // No input provided - set to empty object
                                lastTool.input = {};
                                console.log("Tool requires no input, set to empty object:", lastTool.name);
                            }
                        }
                    }
                }

                // If no tools were used, we're done
                if (!hasToolUse || pendingToolUses.length === 0) {
                    break;
                }

                // Build assistant message content
                const assistantContent: any[] = [];

                // Add text content if we have any
                if (streamedText.trim()) {
                    assistantContent.push({
                        type: 'text',
                        text: streamedText.trim()
                    });
                }

                // Execute all pending tools and add tool uses to content
                const toolResults: any[] = [];
                for (const toolUse of pendingToolUses) {
                    console.log("Processing tool use:", toolUse);

                    // Add tool use to assistant content
                    assistantContent.push({
                        type: 'tool_use',
                        id: toolUse.id,
                        name: toolUse.name,
                        input: toolUse.input || {} // Ensure we always have an object
                    });

                    try {
                        // Execute tool even if input is empty (some tools don't need parameters)
                        const result = await this.executeMCPTool(toolUse.name, toolUse.input || {});
                        toolResults.push({
                            type: 'tool_result',
                            tool_use_id: toolUse.id,
                            content: result
                        });
                        this.logger.info('claude', `Tool executed successfully: ${toolUse.name}`);
                    } catch (toolError: any) {
                        console.log("Tool execution error:", toolError);
                        this.logger.error('claude', `Tool execution failed: ${toolUse.name}`, { error: toolError.message });
                        toolResults.push({
                            type: 'tool_result',
                            tool_use_id: toolUse.id,
                            content: `Error: ${toolError.message}`,
                            is_error: true
                        });
                    }
                }

                // Only add messages if we have content
                if (assistantContent.length > 0) {
                    messages.push({
                        role: 'assistant',
                        content: assistantContent
                    });
                }

                if (toolResults.length > 0) {
                    messages.push({
                        role: 'user',
                        content: toolResults
                    });
                } else {
                    // If no tool results, break to avoid infinite loop
                    break;
                }

                // Clear tool indicator and continue
                yield `\n`;
            }

        } catch (error: any) {
            console.error('Claude Service: API error:', error);
            throw new Error(`Claude API error: ${error.message}`);
        }

        return { stopReason: finalStopReason };
    }

    private buildConversationMessages(chatHistory: ChatMessage[], currentMessage: string): any[] {
        const messages: any[] = [];
        const workspaceRoot = mcpService.getWorkspaceRoot();

        // Add previous conversation history (excluding the current message)
        for (const msg of chatHistory) {
            messages.push({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.content
            });
        }

        // Add workspace context to current message if workspace is open
        let contextualMessage = currentMessage;
        if (workspaceRoot && chatHistory.length === 0) {
            // First message of the conversation - add workspace context
            contextualMessage = `My current folder is: ${workspaceRoot}\n\n${currentMessage}`;
        } else if (workspaceRoot && (currentMessage.toLowerCase().includes('file') || currentMessage.toLowerCase().includes('directory') || currentMessage.toLowerCase().includes('folder'))) {
            // Message mentions files/directories - remind about workspace
            contextualMessage = `(Working in: ${workspaceRoot})\n${currentMessage}`;
        }

        // Add current message
        messages.push({
            role: 'user',
            content: contextualMessage
        });

        // Claude API has limits, so keep only recent messages if too many
        const MAX_MESSAGES = 25; // Adjust based on your needs
        if (messages.length > MAX_MESSAGES) {
            // Keep the most recent messages
            return messages.slice(-MAX_MESSAGES);
        }

        return messages;
    }

    private buildSystemPrompt(): string {
        const workspaceRoot = mcpService.getWorkspaceRoot();
        const availableTools = mcpService.getAvailableTools();

        const folderInfo = workspaceRoot
            ? `\n\nCurrent workspace: ${workspaceRoot}\nIMPORTANT: When users ask about files, directories, or code, they are referring to files in this workspace unless explicitly stated otherwise. Always use the workspace root as your base path for file operations.`
            : '\n\nNo workspace open. User needs to open a folder first to work with files.';

        const toolsInfo = availableTools.length > 0
            ? `\nAvailable tools: ${availableTools.map(st => st.tools.map(t => t.name).join(', ')).join(', ')}`
            : '';

        return `You are a helpful AI assistant specialized in Web3 RWA (Real World Assets) project development using AWS and Chainlink technologies.

You have access to powerful MCP (Model Context Protocol) tools for:
- File system operations (reading, writing, navigating directories)
- Web3 blockchain interactions (Story Protocol, Chainlink, various blockchains)
- AWS cloud services integration
- Smart contract development and deployment

${folderInfo}${toolsInfo}

Focus on:
- Building decentralized applications with real-world asset tokenization
- Integrating Chainlink oracles for reliable data feeds
- Using AWS services for scalable backend infrastructure
- Story Protocol for IP asset management and licensing
- Smart contract development with proper security practices

Be clear, explain what you're doing, and suggest related actions for Web3 RWA development.`;
    }

    // Test connection method
    async testConnection(): Promise<boolean> {
        try {
            await this.client.messages.create({
                model: "claude-sonnet-4-20250514",
                max_tokens: 10,
                messages: [
                    {
                        role: "user",
                        content: "Hello"
                    }
                ]
            });
            return true;
        } catch (error) {
            console.error('Claude connection test failed:', error);
            return false;
        }
    }

    // MCP Tool Integration
    private getMCPTools(): any[] {
        const availableTools = mcpService.getAvailableTools();
        const tools: any[] = [];

        console.log('Available MCP tools:', availableTools);

        for (const serverTools of availableTools) {
            for (const tool of serverTools.tools) {
                const formattedTool = {
                    name: `${serverTools.serverName}_${tool.name}`,
                    description: `[${serverTools.serverName}] ${tool.description}`,
                    input_schema: tool.inputSchema
                };
                tools.push(formattedTool);
                console.log('Added tool for Claude:', formattedTool.name, formattedTool.description);
            }
        }

        console.log('Formatted tools for Claude:', tools);
        return tools;
    }

    private async executeMCPTool(toolName: string, input: any): Promise<string> {
        this.logger.info('claude', `Executing MCP tool: ${toolName}`, { input });

        // Parse server name and tool name from the tool name
        const parts = toolName.split('_');
        if (parts.length < 2) {
            throw new Error('Invalid tool name format');
        }

        const serverName = parts[0];
        const actualToolName = parts.slice(1).join('_');

        this.logger.info('claude', `Parsed MCP tool call`, { serverName, toolName: actualToolName });

        try {
            const result = await mcpService.callTool(serverName, actualToolName, input);

            this.logger.info('claude', `MCP tool result received`, { toolName, resultType: typeof result });

            // Extract text content from the result
            if (result && result.result && result.result.content) {
                const textContent = result.result.content
                    .filter((item: any) => item.type === 'text')
                    .map((item: any) => item.text)
                    .join('\n');
                return textContent || 'Tool executed successfully';
            }

            // Handle direct content array (some MCP servers return this format)
            if (result && Array.isArray(result.content)) {
                const textContent = result.content
                    .filter((item: any) => item.type === 'text')
                    .map((item: any) => item.text)
                    .join('\n');
                return textContent || 'Tool executed successfully';
            }

            return JSON.stringify(result, null, 2);
        } catch (error) {
            console.error(`Failed to execute MCP tool ${toolName}:`, error);
            throw new Error(`Failed to execute tool: ${error}`);
        }
    }
}

export const claudeApiService = new ClaudeApiService();
