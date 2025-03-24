require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3030;
const apiKey = process.env.FIRECRAWL_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());

// MCP Protocol requirements
app.get('/.well-known/mcp', (req, res) => {
  res.json({
    schema_version: '1.0.0',
    name: 'firecrawl',
    description: 'Extract data from the web using Firecrawl',
    vendor: 'Custom',
    version: '1.0.0',
    tools: [
      {
        name: 'extractWebData',
        description: 'Extract structured data from a webpage using Firecrawl',
        input_schema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'The URL of the webpage to extract data from'
            },
            prompt: {
              type: 'string',
              description: 'A natural language prompt describing what data to extract'
            }
          },
          required: ['url', 'prompt']
        },
        output_schema: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              description: 'The extracted data from the webpage'
            }
          }
        }
      },
      {
        name: 'scrapeWebpage',
        description: 'Get the full HTML content of a webpage',
        input_schema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'The URL of the webpage to scrape'
            }
          },
          required: ['url']
        },
        output_schema: {
          type: 'object',
          properties: {
            html: {
              type: 'string',
              description: 'The HTML content of the webpage'
            }
          }
        }
      }
    ]
  });
});

// Firecrawl Extract endpoint
app.post('/api/extractWebData', async (req, res) => {
  try {
    const { url, prompt } = req.body;
    
    if (!url || !prompt) {
      return res.status(400).json({ error: 'URL and prompt are required' });
    }
    
    const response = await axios.post(
      'https://api.firecrawl.dev/extract',
      {
        url,
        prompt
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.json({ data: response.data });
  } catch (error) {
    console.error('Error extracting data:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to extract data',
      details: error.response?.data || error.message
    });
  }
});

// Firecrawl Scrape endpoint
app.post('/api/scrapeWebpage', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    const response = await axios.post(
      'https://api.firecrawl.dev/crawl',
      { url },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.json({ html: response.data.html });
  } catch (error) {
    console.error('Error scraping webpage:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to scrape webpage',
      details: error.response?.data || error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Firecrawl MCP server is running' });
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Firecrawl MCP server running at http://localhost:${port}`);
  console.log(`MCP Schema available at http://localhost:${port}/.well-known/mcp`);
  console.log(`Server is listening on all interfaces (0.0.0.0)`);
}); 