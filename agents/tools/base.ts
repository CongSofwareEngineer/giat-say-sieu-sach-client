import { type TOOL_NAME as ToolName } from '@/constants/tools'

// JSON schema subset used by OpenAI-style function tools
export type ToolParameterSchema = {
  type: 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array'
  description?: string
  enum?: Array<string | number>
  items?: ToolParameterSchema
  properties?: Record<string, ToolParameterSchema>
  required?: string[]
}

// A function declaration for a custom tool
export type FunctionDeclaration = {
  name: string
  description: string
  parameters?: ToolParameterSchema
}

// OpenAI-style function tool entry sent in the "tools" array
export type OpenAIFunction = {
  type: 'function'
  function: {
    name: string
    description: string
    parameters?: ToolParameterSchema
  }
}

export type ToolDefinition<Args extends Record<string, any> = Record<string, any>, Result = unknown> = {
  name: string
  description: string
  parameters?: ToolParameterSchema
  handler: (args: Args) => Promise<Result> | Result
}

// Shared options for every tool set class: register only the given tool names
export type ToolSetOptions = {
  only?: readonly ToolName[]
}

// Keep only the definitions whose names are in the `only` allowlist
export const pickTools = (definitions: ToolDefinition<any, unknown>[], only?: readonly ToolName[]): ToolDefinition<any, unknown>[] =>
  only?.length ? definitions.filter((tool) => (only as readonly string[]).includes(tool.name)) : definitions

// Generic registry that turns business functions into OpenAI-style function tools
export class BaseTools {
  private registry = new Map<string, ToolDefinition<any, unknown>>()

  // Register one or more custom function tools
  register<T extends ToolDefinition<any, unknown>>(...tools: T[]): this {
    for (const tool of tools) {
      if (this.registry.has(tool.name)) {
        throw new Error(`Tool "${tool.name}" is already registered`)
      }
      this.registry.set(tool.name, tool)
    }

    return this
  }

  // Merge multiple tool sets (classes or raw definitions) into one registry
  static compose(...sets: Array<BaseTools | ToolDefinition<any, unknown>[]>): BaseTools {
    const combined = new BaseTools()

    for (const set of sets) {
      if (set instanceof BaseTools) {
        combined.register(...set.list())
      } else {
        combined.register(...set)
      }
    }

    return combined
  }

  // List every registered tool definition
  list(): ToolDefinition<any, unknown>[] {
    return Array.from(this.registry.values())
  }

  // Remove a tool from the registry
  unregister(name: string): boolean {
    return this.registry.delete(name)
  }

  // Check whether a tool exists
  has(name: string): boolean {
    return this.registry.has(name)
  }

  // Plain function declarations of all custom tools
  declarations(): FunctionDeclaration[] {
    return Array.from(this.registry.values()).map(({ name, description, parameters }) => ({
      name,
      description,
      ...(parameters ? { parameters } : {}),
    }))
  }

  // OpenAI-format tools list sent to the chat completions API
  tools(): OpenAIFunction[] {
    return this.declarations().map(({ name, description, parameters }) => ({
      type: 'function',
      function: {
        name,
        description,
        // parameters is required by vLLM-based providers (e.g. tokenrouter)
        parameters: parameters ?? { type: 'object', properties: {} },
      },
    }))
  }

  // Execute a custom function by name with its arguments.
  // Optional context is merged into the args (e.g. { locale } from the client).
  async execute(name: string, args: Record<string, any> = {}, context?: Record<string, any>): Promise<unknown> {
    const tool = this.registry.get(name)

    if (!tool) {
      throw new Error(`Unknown tool: ${name}`)
    }

    return tool.handler({ ...args, ...context })
  }

  // Execute a tool but never throw; errors are returned as data so the model can rephrase
  async safeExecute(name: string, args: Record<string, any> = {}, context?: Record<string, any>): Promise<unknown> {
    try {
      return await this.execute(name, args, context)
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) }
    }
  }
}

export { TOOL_NAME, type TOOL_NAME as ToolName } from '@/constants/tools'
