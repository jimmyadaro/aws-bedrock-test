# AWS Bedrock test
I'm testing [AWS Bedrock](https://aws.amazon.com/bedrock/) with JavaScript, and is not surprise that the "_[AWS Code Examples Repository](https://github.com/awsdocs/aws-doc-sdk-examples/tree/main/javascriptv3/example_code/bedrock-runtime#code-examples)_" sucks.

This PDF has better documentation than the repository.

[https://docs.aws.amazon.com/pdfs/bedrock/latest/userguide/bedrock-ug.pdf](https://docs.aws.amazon.com/pdfs/bedrock/latest/userguide/bedrock-ug.pdf)

### Models I'm testing

This repo uses `anthropic.claude-3-haiku-20240307-v1:0`, `meta.llama3-8b-instruct-v1:0`, and `amazon.nova-lite-v1:0`

All 3 of them have different `@aws-sdk/client-bedrock-runtime InvokeModelCommand()` configuration.

**Amazon Nova:** page 114/2562

**Anthropic Claude:** page 174/2562

**Meta Llama:** page 237/2562

## Get started

Basic usage for on-demand Bedrock models.

It requires Node.js installed.

### Step by step

1. Go to [AWS Model Access](https://us-east-1.console.aws.amazon.com/bedrock/home?region=us-east-1#/modelaccess) and **request access to the models you want to use**. Each model has its own EULA (_End-user license agreement_), and the first access request you make will ask you "_what do you want to use this models for?_".

 **Select and use the _Bedrock serverless_ models.** _Marketplace models_ (_Provisioned Throughput_) means you'll deploy those models and that's really, really expensive (we're talking thousands of dollars _per day_). Serverless (on-demand) is **priced by the token**, some models even include caching in and out responses, and all of them are [priced](https://aws.amazon.com/bedrock/pricing/) by _tokens in and out_. They offer [Pricing examples](https://aws.amazon.com/bedrock/pricing/#Pricing_examples) so you can learn to calculate costs.

1. **Get Bedrock permissions.** I'm using a new user (_IAM_) specific for this testing usage, and it is in a group named "_bedrock_test_" with this Policies: `AmazonBedrockFullAccess` and `IAMFullAccess`.

  `IAMFullAccess` allows you to **create and manage [Access keys](https://docs.aws.amazon.com/console/iam/self-accesskeys)**, which you'll need to get `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` variables.

1. **Clone this repo** on your machine and run `npm install` in it.

1. Copy and rename the sample `.env` file so it becomes the main `.env` (`$ cp ./src/.env.sample ./src/.env`) and complete the variables with the info from step 2 (_Access keys_).

1. Check and run the examples inside using Node.

  **First list the available models** using `$ node ./src/1-hello-bedrock.js`

  Expected output for "_hello-bedrock_" is something like:

  ```
  // More results...

  ==========================================
   Model: mistral.mistral-small-2402-v1:0
  ------------------------------------------
   Name: Mistral Small (24.02)
   Provider: Mistral AI
   Model ARN: arn:aws:bedrock:us-east-1::foundation-model/mistral.mistral-small-2402-v1:0
   Input modalities: TEXT
   Output modalities: TEXT
   Supported customizations:
   Supported inference types: ON_DEMAND
   Lifecycle status: ACTIVE
  ==========================================

  There are 59 active and 21 legacy foundation models in us-east-1.
  ```

  If no error, then you can **run the first example** (_claude-3-haiku-testing_) using `$ node ./src/2-claude-3-haiku-testing.js`

  Expected output is something like:

  ```
  Raw Claude API response:  {
    '$metadata': {
      httpStatusCode: 200,
      requestId: 'abc-xyz-123-456-789',
      extendedRequestId: undefined,
      cfId: undefined,
      attempts: 1,
      totalRetryDelay: 0
    },
    contentType: 'application/json',
    body: Uint8ArrayBlobAdapter(379) [Uint8Array] [
      123,  34, 105, 100,  34,  58,  34, 109, 115, 103,  95,  98,
      100, 114, 107,  95,  48,  49,  74, 113, 100,  80, 121, 118,
       71,  52,  97,  54,  55, 106,  53,  55, 114, 111,  70, 120,
       71,  86,  97, 105,  34,  44,  34, 116, 121, 112, 101,  34,
       58,  34, 109, 101, 115, 115,  97, 103, 101,  34,  44,  34,
      114, 111, 108, 101,  34,  58,  34,  97, 115, 115, 105, 115,
      116,  97, 110, 116,  34,  44,  34, 109, 111, 100, 101, 108,
       34,  58,  34,  99, 108,  97, 117, 100, 101,  45,  51,  45,
      104,  97, 105, 107,
      ... 279 more items
    ]
  }
  Parsed API data:  {
    id: 'msg_bdrk_aabbcc',
    type: 'message',
    role: 'assistant',
    model: 'claude-3-haiku-20240307',
    content: [
      {
        type: 'text',
        text: '{\n' +
          '  "name": "Jimmy Adaro",\n' +
          '  "age": 27,\n' +
          '  "job": {\n' +
          '    "role": "CTO",\n' +
          '    "company": "Somos Inmobiliarios"\n' +
          '  }\n' +
          '}'
      }
    ],
    stop_reason: 'end_turn',
    stop_sequence: null,
    usage: { input_tokens: 114, output_tokens: 58 }
  }
  Claude API Response Time: 1.810s
  Claude's response: {
    "name": "Jimmy Adaro",
    "age": 27,
    "job": {
      "role": "CTO",
      "company": "Somos Inmobiliarios"
    }
  }
  ```

  Now try doing the same thing with the other examples (_Llama 3_ and _Nova Lite_).

1. **Try using different user prompts and system prompts.** In this case I'm using a couple functions to remove emojis. spaces, and new lines from prompts before sending them to Bedrock so we can save input tokens cost.
