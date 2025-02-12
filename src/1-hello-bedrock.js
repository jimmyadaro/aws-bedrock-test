/**
 * AWS Bedrock Model Listing Script
 *
 * This script connects to AWS Bedrock using environment variables for credentials,
 * retrieves a list of foundation models, and displays detailed information about them.
 * It uses the AWS SDK v3 for JavaScript.
 */

// Load environment variables from .env file.
require('dotenv').config();

// Retrieve AWS credentials from environment variables.
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

// Set AWS region.
const REGION = "us-east-1";

// AWS Bedrock client.
const { BedrockClient, ListFoundationModelsCommand } = require("@aws-sdk/client-bedrock");

// Create an AWS Bedrock client instance.
const client = new BedrockClient({
  region: REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  }
});

/**
  * Main function to list available Bedrock foundation models.
  * It fetches and displays detailed information about each model.
  */
const main = async () => {
  // Create a command to list foundation models.
  const command = new ListFoundationModelsCommand({});

  // Send request to AWS Bedrock and get the response.
  const response = await client.send(command);

  // Extract model summaries.
  const models = response.modelSummaries;

  console.log("Listing the available Bedrock foundation models:");

  // Iterate through each model and display relevant details.
  for (const model of models) {
    console.log("=".repeat(42));
    console.log(` Model: ${model.modelId}`);
    console.log("-".repeat(42));
    console.log(` Name: ${model.modelName}`);
    console.log(` Provider: ${model.providerName}`);
    console.log(` Model ARN: ${model.modelArn}`);
    console.log(` Input modalities: ${model.inputModalities}`);
    console.log(` Output modalities: ${model.outputModalities}`);
    console.log(` Supported customizations: ${model.customizationsSupported}`);
    console.log(` Supported inference types: ${model.inferenceTypesSupported}`);
    console.log(` Lifecycle status: ${model.modelLifecycle.status}`);
    console.log(`${"=".repeat(42)}\n`);
  }

  // Count the number of active and legacy models.
  const active = models.filter(m => m.modelLifecycle.status === "ACTIVE").length;
  const legacy = models.filter(m => m.modelLifecycle.status === "LEGACY").length;

  console.log(`There are ${active} active and ${legacy} legacy foundation models in ${REGION}.`);

  return response;
};

// If this script is run directly (not imported as a module), execute main().
if (require.main === module) {
  main();
}

// Export main function for external use (e.g., unit tests).
module.exports = { main };
