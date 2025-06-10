# Robostats MCP Server

**Connect FRC robotics statistics directly to Claude Desktop or Cursor IDE!**

This tool lets you ask Claude or Cursor questions about FIRST Robotics Competition (FRC) teams, matches, and events. Instead of manually looking up stats on websites, you can simply ask your AI assistant questions like "How did team 254 perform in 2024?" or "What are the top teams in California?"

**Perfect for scouting!** Get instant analysis of potential alliance partners, research opponents' strengths and weaknesses, and make data-driven strategic decisions during competitions.

## 🤖 What You Can Do

Once connected, you can ask Claude or Cursor about:

- **Any FRC Team** - "Tell me about team 1678" or "How good is team 254?"
- **Match Results** - "What was team 2056's best match this year?"
- **Event Data** - "How did the stats in the Johnson division compare to the Curie division?"
- **Performance Trends** - "Compare team 3647's performance since they started"
- **Rankings & Stats** - "Who are the top teams in Texas?" or "Show me EPA leaders"

Perfect for FRC teams, mentors, students, and fans who want instant access to robotics competition data through their AI assistant!

## 🔗 Setup Instructions

### Claude Desktop

To use this MCP server with Claude Desktop, you'll need to configure it using the [mcp-remote](https://www.npmjs.com/package/mcp-remote) proxy.

1. **Open Claude Desktop Settings:**
   - Go to Settings > Developer > Edit Config

2. **Add this configuration:**
   ```json
   {
     "mcpServers": {
       "robostats": {
         "command": "npx",
         "args": [
           "-y",
           "mcp-remote@latest",
           "https://robostats-mcp-cloudflare.eric-g4.workers.dev/sse"
         ]
       }
     }
   }
   ```

3. **Restart Claude Desktop**

4. **Verify Connection** - You should see the robostats tools become available in Claude

#### Troubleshooting Claude Desktop

**Issue: Server not connecting when using fnm (Fast Node Manager) on Mac**

If you're using fnm on Mac and encounter connection issues, you may need to explicitly set the PATH environment variable:

```json
{
  "mcpServers": {
    "robostats": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote@latest",
        "https://robostats-mcp-cloudflare.eric-g4.workers.dev/sse"
      ],
      "env": {
        "PATH": "<PATH_TO_NODE_BIN>:/usr/local/bin:/usr/bin"
      }
    }
  }
}
```

To find your Node.js binary path:
1. Run `which node` in your terminal
2. Take the path up to (and including) the `bin` folder, without a trailing slash
3. Add `:/usr/local/bin:/usr/bin` to the end

For example:
- If `which node` returns `/Users/yourname/.fnm/node-versions/v18.17.0/installation/bin/node`
- Use `/Users/yourname/.fnm/node-versions/v18.17.0/installation/bin:/usr/local/bin:/usr/bin` as your PATH value

### Cursor IDE

To use this MCP server with Cursor IDE:

1. **Open Cursor Settings:**
   - Press `Cmd/Ctrl + ,` to open settings
   - Search for "MCP" or go to Features > Model Context Protocol

2. **Add Server Configuration:**
   ```json
   {
     "mcpServers": {
       "robostats": {
        "url": "https://robostats-mcp-cloudflare.eric-g4.workers.dev/sse"
      }
     }
   }
   ```

3. **Save and Restart** Cursor

4. **Verify Connection** - The robostats tools should now be available when using Claude in Cursor

## 🛠️ Available Tools

### Team Tools
- `get-team` - Get detailed information about a specific team
- `get-teams` - Search and filter teams by location, district, activity status
- `get-team-year` - Get a team's performance for a specific competition year
- `get-team-years` - Query multiple years of team data with filters

### Event Tools  
- `get-event` - Get detailed information about a specific event
- `get-events` - Search events by year, location, type, and week
- `get-team-event` - Get a team's performance at a specific event
- `get-team-events` - Query all events a team has participated in

### Match Tools
- `get-match` - Get detailed match information and results
- `get-matches` - Search matches with various filters
- `get-team-match` - Get a team's performance in a specific match  
- `get-team-matches` - Query all matches a team has played

### Statistics Tools
- `get-years` - Get available competition years and statistics
- `get-year-stats` - Get aggregate statistics for a specific year



## 📊 Example Usage

Once connected to Claude Desktop, you can ask questions like:

### Team Analysis
- "How did team 254 perform in 2024?"
- "What are the top teams in California?"
- "Show me team 1678's match history at their last event"

### Competition Insights  
- "What were the highest scoring matches at the 2024 World Championship?"
- "Which teams from the Pacific Northwest had the best EPA in 2023?"
- "Compare team 2056's performance across the last 3 years"

### Event Research
- "What events happened in Week 4 of 2024?"
- "How many teams competed at the 2024 Houston World Championship?"
- "Show me all regional events in Texas for 2024"

## 🏗️ Architecture

```
Claude Desktop ←→ mcp-remote ←→ Cloudflare Worker ←→ Statbotics API
```

- **Cloudflare Worker**: Handles MCP protocol and API requests
- **SSE Endpoint**: `/sse` for real-time communication with MCP clients  
- **MCP Endpoint**: `/mcp` for direct MCP protocol access
- **Statbotics API**: Primary data source for all FRC statistics

## 📚 Data Source

This server uses the [Statbotics API](https://statbotics.io) which provides:
- Comprehensive FRC match and team data
- Advanced analytics like EPA (Expected Points Added)
- Historical data back to 2002
- Real-time updates during competition season

## 🛠️ Development

### Prerequisites

Before developing or running this MCP server locally, you'll need:
- **Node.js 18+** and **npm** installed - [Installation Guide](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

### Local Development Setup

For local testing and development:

```bash
git clone https://github.com/ericg4/robostats-mcp-cloudflare.git
cd robostats-mcp-cloudflare
npm install
npm start
```

This starts the worker locally at `http://localhost:8787`. You can connect to it with Claude or Cursor by adjusting the config link to `http://localhost:8787/sse`. 

```json
   {
     "mcpServers": {
       "robostats": {
         "command": "npx",
         "args": [
           "-y", 
           "mcp-remote@latest",
           "http://localhost:8787/sse"
         ]
       }
     }
   }
   ```

### Project Structure
```
src/
├── index.ts              # Main Cloudflare Worker entry point
├── tools/                # Data formatting and type definitions
│   ├── team.ts           # Team data formatting
│   ├── team-year.ts      # Team yearly data formatting  
│   ├── event.ts          # Event data formatting
│   ├── match.ts          # Match data formatting
│   └── ...
└── utils/
    └── web-requests.ts   # HTTP request utilities
```

### Key Technologies
- **TypeScript** - Type-safe development
- **Zod** - Runtime type validation  
- **MCP SDK** - Model Context Protocol implementation
- **Cloudflare Workers** - Edge computing platform

### Commands
- `npm start` - Start local development server
- `npm run deploy` - Deploy to Cloudflare Workers  
- `npm run format` - Format code with Biome
- `npm run lint:fix` - Fix linting issues
- `npm run type-check` - Check TypeScript types

## 📄 License

This project is open source. Please respect the Statbotics API terms of service when using this tool.

## 🤝 Contributing

Contributions welcome! Please feel free to submit issues and pull requests.

---

**Built with ❤️ for the FRC community**
