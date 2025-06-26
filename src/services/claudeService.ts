import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { mcpService } from './mcpService';
import { agentChatService } from './agentChatService';
import { Agent } from '../types/agent';
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
  private currentAgent: Agent | null = null;

  constructor() {
    const awsConfig = this.getAwsConfig();

    this.client = new BedrockRuntimeClient({
      region: awsConfig.awsRegion,
      credentials: {
        accessKeyId: awsConfig.awsAccessKey,
        secretAccessKey: awsConfig.awsSecretKey,
      }
    });
    this.logger.info('claude', 'Claude Bedrock service initialized with MCP support');
    
    // Register with AgentChatService
    agentChatService.registerClaudeService(this);
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
    const systemPrompt = this.buildSystemPrompt();
    const tools = this.getMCPTools();
    let messages = this.buildConversationMessages(chatHistory, currentMessage);

    console.log('Claude Service: Starting stream with', messages.length, 'messages and', tools.length, 'MCP tools');

    let finalStopReason: string | undefined;

    try {
      // Continue streaming until no more tools are needed
      while (true) {
        // Prepare the payload for the model
        const payload = {
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 4000,
          system: systemPrompt,
          tools: tools.length > 0 ? tools : undefined,
          messages: messages,
        };

        // Invoke Claude with streaming
        const command = new InvokeModelWithResponseStreamCommand({
          contentType: "application/json",
          body: JSON.stringify(payload),
          modelId: "apac.anthropic.claude-sonnet-4-20250514-v1:0",
        });

        const apiResponse: any = await this.client.send(command);

        let currentResponseContent: any[] = [];
        let pendingToolUses: any[] = [];
        let hasToolUse = false;
        let streamedText = '';

        // Process the response stream
        for await (const item of apiResponse.body) {
          if (item.chunk?.bytes) {
            try {
              const chunk = JSON.parse(new TextDecoder().decode(item.chunk.bytes));
              const chunkType = chunk.type;

              if (chunkType === "message_delta" && chunk.delta?.stop_reason) {
                finalStopReason = chunk.delta.stop_reason;
                this.logger.info('claude', `Stream ended with stop_reason: ${finalStopReason}`);
              } else if (chunkType === "content_block_start") {
                if (chunk.content_block?.type === 'tool_use') {
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
              } else if (chunkType === "content_block_delta") {
                if (chunk.delta?.type === 'text_delta' && chunk.delta?.text) {
                  // Stream text content to user
                  yield chunk.delta.text;
                  streamedText += chunk.delta.text;
                } else if (chunk.delta?.type === 'input_json_delta' && chunk.delta?.partial_json) {
                  // Accumulate tool input
                  const lastTool = pendingToolUses[pendingToolUses.length - 1];
                  if (lastTool) {
                    lastTool.inputJson += chunk.delta.partial_json;
                  }
                }
              } else if (chunkType === "content_block_stop") {
                // Finalize tool input - always set input even if empty
                const lastTool = pendingToolUses[pendingToolUses.length - 1];
                if (lastTool) {
                  if (lastTool.inputJson.trim()) {
                    try {
                      lastTool.input = JSON.parse(lastTool.inputJson);
                      console.log("Parsed tool input:", lastTool.input);
                    } catch (parseError) {
                      this.logger.error('claude', `Failed to parse tool input JSON: ${parseError}`);
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
            } catch (parseError) {
              console.error('Failed to parse chunk:', parseError);
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

    // Add previous conversation history
    for (const msg of chatHistory) {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: [{ type: 'text', text: msg.content }]
      });
    }

    // Add workspace context to current message if workspace is open
    let contextualMessage = currentMessage;
    // if (workspaceRoot && chatHistory.length === 0) {
    //   // First message of the conversation - add workspace context
    //   contextualMessage = `My current folder is: ${workspaceRoot}\n\n${currentMessage}`;
    // } else if (workspaceRoot && (currentMessage.toLowerCase().includes('file') || currentMessage.toLowerCase().includes('directory') || currentMessage.toLowerCase().includes('folder'))) {
    //   // Message mentions files/directories - remind about workspace
    //   contextualMessage = `(Working in: ${workspaceRoot})\n${currentMessage}`;
    // }

    // Add current message
    messages.push({
      role: 'user',
      content: [{ type: 'text', text: contextualMessage }]
    });

    // Keep only recent messages to stay within API limits
    const MAX_MESSAGES = 25;
    if (messages.length > MAX_MESSAGES) {
      return messages.slice(-MAX_MESSAGES);
    }

    return messages;
  }
 
  private buildSystemPrompt(): string {
    const workspaceRoot = mcpService.getWorkspaceRoot();
    
    const folderInfo = workspaceRoot
      ? `\n\nCurrent workspace: ${workspaceRoot}\nIMPORTANT: When users ask about files, directories, or code, they are referring to files in this workspace unless explicitly stated otherwise. Always use the workspace root as your base path for file operations.`
      : '\n\nNo workspace open. User needs to open a folder first to work with files.';

    // Use agent-specific system prompt if available
    if (this.currentAgent) {
      const agentSystemPrompt = agentChatService.getAgentSystemPrompt(this.currentAgent.id);
      return `${agentSystemPrompt}${folderInfo}`;
    }

    // Default system prompt when no agent is active
    const availableTools = mcpService.getAvailableTools();
    const toolsInfo = availableTools.length > 0
      ? `\nAvailable MCP tools: ${availableTools.map(st => st.tools.map(t => t.name).join(', ')).join(', ')}`
      : '';

    return `You are Claude, an expert AI assistant specializing in Real World Asset (RWA) tokenization
  
  **Working with Project Files:**
  ${folderInfo}
  
  When users share documents, always:
  1. Read and analyze the content thoroughly
  2. Identify key requirements, constraints, and opportunities
  3. Suggest specific implementation approaches
  4. Highlight potential legal/regulatory considerations
  5. Recommend next steps and related files to create/review
  
  **Available Tools:**
  ${toolsInfo}
   
  Remember: Every RWA project must balance innovation with regulatory compliance. Always consider both technical feasibility and legal requirements in your recommendations.`;
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
        modelId: "apac.anthropic.claude-sonnet-4-20250514-v1:0",
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      console.error('Claude connection test failed:', error);
      return false;
    }
  }

  // Set active agent for tool filtering
  setActiveAgent(agent: Agent | null): void {
    this.currentAgent = agent;
    this.logger.info('claude', `Active agent set to: ${agent?.name || 'none'}`);
  }

  // MCP Tool Integration - filtered by current agent
  private getMCPTools(): any[] {
    // If no agent is active, return no tools
    if (!this.currentAgent) {
      this.logger.info('claude', 'No active agent, returning no tools');
      return [];
    }

    const availableTools = mcpService.getAvailableTools();
    const agentServerNames = this.currentAgent.mcpServers;
    const tools: any[] = [];

    console.log('Available MCP tools:', availableTools);
    console.log('Agent MCP servers:', agentServerNames);

    for (const serverTools of availableTools) {
      // Only include tools from servers that the agent is connected to
      if (agentServerNames.includes(serverTools.serverName)) {
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
    }

    console.log('Formatted tools for Claude (agent-filtered):', tools);
    return tools;
  }

  private async executeMCPTool(toolName: string, input: any): Promise<string> {
    console.log('Executing MCP tool:', toolName, 'with input:', input);

    // Parse server name and tool name from the tool name
    const parts = toolName.split('_');
    if (parts.length < 2) {
      throw new Error('Invalid tool name format');
    }

    const serverName = parts[0];
    const actualToolName = parts.slice(1).join('_');

    console.log('Parsed server:', serverName, 'tool:', actualToolName);

    try {
      const result = await mcpService.callTool(serverName, actualToolName, input);
      
      // Record tool usage for agent metrics
      if (this.currentAgent) {
        agentChatService.recordToolUsage(this.currentAgent.id);
      }

      console.log('MCP tool result:', result);

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
