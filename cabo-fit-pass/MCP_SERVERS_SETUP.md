# MCP Servers Setup for CaboFitPass

## Overview
This document outlines the Model Context Protocol (MCP) servers that have been configured for the CaboFitPass project to enhance Claude Code's capabilities.

## Configured MCP Servers

### 1. Filesystem Server
- **Purpose**: Provides file system access and operations
- **Package**: `@modelcontextprotocol/server-filesystem`
- **Configuration**: Limited to the project directory for security
- **Capabilities**: File reading, writing, directory operations

### 2. ShadCN UI Server
- **Purpose**: Provides access to ShadCN/UI components and templates
- **Package**: `@jpisnice/shadcn-ui-mcp-server`
- **GitHub Token**: Configured for API access
- **Capabilities**: Component generation, UI templates, design system access

### 3. Supabase Server
- **Purpose**: Database operations and Supabase service integration
- **Package**: `@supabase/mcp-server-supabase`
- **Configuration**: Requires SUPABASE_URL and SUPABASE_KEY environment variables
- **Capabilities**: Database queries, table management, authentication

### 4. Memory Server
- **Purpose**: Persistent memory and knowledge graph capabilities
- **Package**: `@modelcontextprotocol/server-memory`
- **Capabilities**: Information storage, retrieval, context persistence

## Configuration Files

### Global MCP Configuration
**Location**: `/mnt/c/Users/mario/.mcp/mcp.json`
Contains all available MCP servers for the entire system.

### Project-Specific Configuration
**Location**: `/mnt/c/Users/mario/cabo-fit-pass/.claude.json`
Contains MCP servers specific to this project with appropriate permissions.

## Required Environment Variables

To fully activate the Supabase MCP server, you need to update the configuration with your actual Supabase credentials:

1. **SUPABASE_URL**: Your Supabase project URL
2. **SUPABASE_KEY**: Your Supabase API key (service role key for full access or anon key for limited access)

## Usage in Claude Code

Once configured, these MCP servers provide the following capabilities:

### ShadCN UI Integration
- Generate UI components using ShadCN/UI library
- Access to component templates and examples
- Design system consistency

### Supabase Integration
- Direct database operations
- Table schema management
- Query execution and data manipulation
- Authentication service integration

### Enhanced File Operations
- Advanced file system operations
- Project-scoped file access
- Safe file manipulation

### Persistent Memory
- Context retention across sessions
- Knowledge graph functionality
- Information persistence

## Next Steps

1. **Configure Supabase Credentials**: Update the Supabase server configuration with your actual project credentials
2. **Test MCP Server Connectivity**: Restart Claude Code to load the new MCP server configurations
3. **Verify Functionality**: Test each MCP server capability to ensure proper operation

## Security Considerations

- File system access is restricted to the project directory
- GitHub token is configured for ShadCN UI server
- Supabase credentials need to be properly secured
- All MCP servers run in isolated environments

## Troubleshooting

If MCP servers are not connecting:

1. Restart Claude Code completely
2. Check that all npm packages are properly installed globally
3. Verify configuration files are valid JSON
4. Ensure environment variables are properly set
5. Check Claude Code's MCP server status in settings

## Installation Commands

For reference, the following commands were used to install the MCP servers:

```bash
npm install -g @jpisnice/shadcn-ui-mcp-server
npm install -g @supabase/mcp-server-supabase
```

The other servers (`@modelcontextprotocol/server-filesystem` and `@modelcontextprotocol/server-memory`) are installed on-demand via npx.