/**
 * AWS Bedrock Runtime - Nova Lite API Caller
 *
 * This script connects to AWS Bedrock Runtime to send a prompt to Nova Lite.
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
 * Function to send a prompt to Amazon Nova Lite and get a response.
 * @param {string} prompt - The user input to send to the AI model.
 */
async function getNovaLiteResponse(prompt) {
  // Start response time measurement.
  console.time("Nova API Response Time");

  // Prepare the input payload for the Nova API.
  const input = {
    /**
      * Model ID from Model catalog overview.
      * @link: https://us-east-1.console.aws.amazon.com/bedrock/home?region=us-east-1#/model-catalog/serverless/amazon.nova-lite-v1:0
      */
    modelId: "amazon.nova-lite-v1:0",
    // Send and accept JSON.
    contentType: "application/json",
    accept: "application/json",
    // API request body.
    body: JSON.stringify({
      inferenceConfig: {
        // The maximum number of tokens (words + subwords) that the model can generate in the response.
        max_new_tokens: 512,
        /**
          * Nucleus sampling: controls how the model selects the next token.
          * Lower values (e.g., 0.5) make it choose from a smaller set of likely words,
          * while higher values (e.g., 0.9) allow more diverse responses.
          */
        top_p: 0.5,
        /**
          * Controls how many of the top most probable next tokens the model considers.
          * A lower value (e.g., 50) restricts selection to the 50 most likely tokens,
          * making responses more predictable.
          * A higher value (e.g., 100 or more) allows for more diversity in responses.
          * Setting it to 0 disables filtering by probability ranking.
          */
        top_k: 10,
        /**
          * Controls randomness in the model's output.
          * Lower values (e.g., 0.3) make responses more deterministic and focused,
          * while higher values (e.g., 0.8) make them more creative and diverse.
          */
        temperature: 0.3
      },
      // User prompt.
      messages: [
        {
          role: "user",
          content: [
            {
              "text": `${prompt}`
            }
          ]
        }
      ],
      // System prompt.
      system: [
        {
          "text": "Devuelve la siguiente información del usuario en formato JSON válido (sin comillas invertidas, saltos de línea, ni nada similar): nombre completo (name), edad (age), ocupación (job.role) y empresa (job.company). No sumes datos extra."
        }
      ]
    })
  };

  try {
    // Send the request to Nova using AWS Bedrock.
    const command = new InvokeModelCommand(input);
    const response = await client.send(command);

    // Raw response metadata from AWS.
    console.log("Raw Nova API response: ", response);

    // Parse and process the response body.
    const data = JSON.parse(Buffer.from(response.body).toString("utf-8"));
    console.log("Parsed API data: ", data);

    // End response time measurement.
    console.timeEnd("Nova API Response Time");

    // Display Nova's response.
    console.log("Nova's response:", data.output.message.content);
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
getNovaLiteResponse(cleaned_description);
