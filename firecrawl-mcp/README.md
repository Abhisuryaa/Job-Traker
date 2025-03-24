# Firecrawl MCP Server

This is a Model Context Protocol (MCP) server that integrates [Firecrawl](https://www.firecrawl.dev/) web data extraction capabilities with Cursor AI and other MCP-compatible clients.

## Features

- **Web Data Extraction**: Extract structured data from any webpage using natural language prompts
- **Web Scraping**: Get the full HTML content of any webpage
- **MCP Integration**: Works with Cursor AI, Claude Desktop, and other MCP-compatible clients

## Prerequisites

- Node.js v14 or higher
- A Firecrawl API key (sign up at [firecrawl.dev](https://www.firecrawl.dev/))

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/your-username/firecrawl-mcp.git
   cd firecrawl-mcp
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with your Firecrawl API key:
   ```
   FIRECRAWL_API_KEY=your_api_key_here
   PORT=3030
   ```

## Running the Server

Start the server with:

```
npm start
```

The server will be running at http://localhost:3030 with the MCP schema available at http://localhost:3030/.well-known/mcp.

## Setting up with Cursor

1. Open Cursor settings
2. Go to the MCP Servers section
3. Add a new MCP server with:
   - Name: firecrawl
   - URL: http://localhost:3030

## Usage Examples

Once set up, you can use the Firecrawl tools in your Cursor AI or other MCP-compatible clients:

### Example 1: Extract Product Information
```
Can you extract information about the product on this page: https://example.com/product/123
```

### Example 2: Get Website Content
```
Please scrape the blog post at https://example.com/blog/latest and summarize the key points
```

## API Endpoints

- `GET /.well-known/mcp` - MCP schema
- `POST /api/extractWebData` - Extract structured data from a webpage
- `POST /api/scrapeWebpage` - Get the full HTML content of a webpage
- `GET /health` - Health check endpoint

## License

ISC 