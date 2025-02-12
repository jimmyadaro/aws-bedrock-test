/**
 * AWS Bedrock Runtime - Llama 3 API Caller
 *
 * This script connects to AWS Bedrock Runtime to send a prompt to Llama 3.
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
 * Function to send a prompt to Llama 3 and get a response.
 * @param {string} user_prompt - The user input to send to the AI model. Param cannot be named "prompt".
 */
async function getLlamaResponse(user_prompt) {
  // Start response time measurement.
  console.time("Llama API Response Time");

  // Format the prompt with system instructions and user input.
  const prompt = `
<|begin_of_text|><|start_header_id|>system<|end_header_id|>
Devuelve la siguiente información del usuario en formato JSON válido (sin comillas invertidas ni nada similar): nombre completo (name), edad (age), ocupación (job.role) y empresa (job.company). No sumes datos extra.<|eot_id|><|
start_header_id|>user<|end_header_id|>
${user_prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>
`;

  /**
    * Model ID from Model catalog overview.
    * @link: https://us-east-1.console.aws.amazon.com/bedrock/home?region=us-east-1#/model-catalog/serverless/meta.llama3-8b-instruct-v1:0
    */
  const modelId = "meta.llama3-8b-instruct-v1:0"

  try {
    const input = {
      // Send and accept JSON.
       contentType: "application/json",
       accept: "application/json",
       // API request body.
       body: JSON.stringify({
         // The formatted prompt containing system instructions and user input.
         prompt,
         // The maximum number of tokens (words + subwords) that the model can generate in the response.
         max_gen_len: 512,
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
       // Set model ID.
       modelId
    }

    // Send the request to Llama using AWS Bedrock.
    const command = new InvokeModelCommand(input);
    const response = await client.send(command);

    // Raw response metadata from AWS.
    console.log("Raw Llama API response: ", response);

    // Parse and process the response body.
    const response_body = JSON.parse(Buffer.from(response.body).toString("utf-8"));
    console.log("Parsed API data: ", response_body);

    // End response time measurement.
    console.timeEnd("Llama API Response Time");

    // Display Llama's response.
    console.log("Llama's response:", response_body.generation);
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

// Remove emojis.
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
getLlamaResponse(cleaned_description);
