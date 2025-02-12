/**
 * AWS Bedrock Runtime - Claude 3 Haiku API Caller
 *
 * This script connects to AWS Bedrock Runtime to send a prompt to Claude 3 Haiku.
 * It retrieves credentials from a `.env` file, formats user input, and processes the AI response.
 * The script includes utility functions to remove emojis and clean up text before sending it.
 */

// Load environment variables from .env file.
require('dotenv').config();

// Retrieve AWS credentials from environment variables.
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

// Set AWS region.
const REGION = "us-east-1";

// Import required AWS SDK modules.
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

// Configure AWS Bedrock Runtime client with credentials (for testing purposes).
const client = new BedrockRuntimeClient({
  region: REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  }
});

/**
 * Function to send a prompt to Claude 3 Haiku and get a response.
 * @param {string} prompt - The user input to send to the AI model.
 */
async function getClaudeResponse(prompt) {
  // Start response time measurement
  console.time("Claude API Response Time");

  // Prepare the input payload for the Claude API.
  const input = {
    /**
      * Model ID from Model catalog overview.
      * @link: https://us-east-1.console.aws.amazon.com/bedrock/home?region=us-east-1#/model-catalog/serverless/anthropic.claude-3-haiku-20240307-v1:0
      */
    modelId: "anthropic.claude-3-haiku-20240307-v1:0",
    // Send and accept JSON.
    contentType: "application/json",
    accept: "application/json",
    // API request body.
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      // User prompt.
      messages: [
        {
          role: "user",
          content: [
            {
              "type": "text",
              "text": `${prompt}`
            }
          ]
        }
      ],
      // System prompt.
      system: [
        {
          "type": "text",
          "text": "Devuelve la siguiente información del usuario en formato JSON válido (sin comillas invertidas ni nada similar): nombre completo (name), edad (age), ocupación (job.role) y empresa (job.company). No sumes datos extra."
        }
      ],
      // The maximum number of tokens (words + subwords) that the model can generate in the response.
      max_tokens: 512,
      /**
        * Controls randomness in the model's output.
        * Lower values (e.g., 0.3) make responses more deterministic and focused,
        * while higher values (e.g., 0.8) make them more creative and diverse.
        */
      temperature: 0.3,
      /**
        * Nucleus sampling: controls how the model selects the next token.
        * Lower values (e.g., 0.5) make it choose from a smaller set of likely words,
        * while higher values (e.g., 0.9) allow more diverse responses.
        */
      top_p: 0.5
    }),
  };

  try {
    // Send the request to Claude using AWS Bedrock.
    const command = new InvokeModelCommand(input);
    const response = await client.send(command);

    // Parse and process the response.
    console.log("Raw Claude API response: ", response);

    // Parse and process the response body.
    const data = JSON.parse(Buffer.from(response.body).toString("utf-8"));
    console.log("Parsed API data: ", data);

    // End response time measurement.
    console.timeEnd("Claude API Response Time");

    // Display Claude's response.
    console.log("Claude's response:", data.content[0].text);
  } catch (error) {
    console.error("Error calling AWS Bedrock:", error);
  }
}

// Sample description with user details.
const real_description = `👋 Hola, me llamo Jimmy Adaro, tengo 27 años, nací en Buenos Aires (Argentina 🇦🇷) y trabajo como CTO en una startup (Somos Inmobiliarios 🏡).`;

/**
 * Function to remove emojis from a given string.
 * Why? It reduces input token count.
 * @param {string} str - The input string containing emojis.
 * @returns {string} - The cleaned string without emojis.
 */
function removeEmojis(str) {
  return str.replace(/([\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Extended_Pictographic})/gu, '');
}

// Remove emojis
const cleaned_description_no_emojis = removeEmojis(real_description);

/**
 * Function to clean a string by removing extra spaces and new lines.
 * Why? It reduces input token count.
 * @param {string} str - The input string.
 * @returns {string} - The cleaned string with no extra whitespace.
 */
function cleanString(str) {
  return str.replace(/\s+/g, ' ').trim();
}

// Remove extra spaces and new lines.
const cleaned_description = cleanString(cleaned_description_no_emojis);

// Call the API with the cleaned description.
getClaudeResponse(cleaned_description);
