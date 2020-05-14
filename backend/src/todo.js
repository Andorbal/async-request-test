const AWS = require("aws-sdk"); // must be npm installed to use
const { v4: uuidv4 } = require("uuid")
//const { send } = require("./socket");

const todoHandler = async (event, context) => {
  const { title } = JSON.parse(event.body);

  console.log("TODO-HANDLER -- quick validation");
  console.log("    publishing...")
  const sns = new AWS.SNS({
    endpoint: "http://127.0.0.1:4002",
    region: "us-east-1",
  });

  const requestId = uuidv4();
  const entityId = uuidv4();

  await sns.publish({
    Message: JSON.stringify({ entityId, requestId, title }),
    TopicArn: "arn:aws:sns:us-east-1:123456789012:todo-create",
  }).promise();

  console.log("Done!")
  return {
    statusCode: 200,
    body: JSON.stringify({ requestId, entityId, title })
  }
}

const todoCommand = async (event) => {
  console.log("TODO-COMMAND -- Perform server logic");
  console.log(`Got ${event.Records.length} message(s)`);
  //console.dir(event, { depth: null })


  const lambda = new AWS.Lambda({
    apiVersion: '2031',

    // endpoint needs to be set only if it deviates from the default, e.g. in a dev environment
    // process.env.SOME_VARIABLE could be set in e.g. serverless.yml for provider.environment or function.environment
    endpoint: process.env.IS_OFFLINE
      ? 'http://localhost:8014'
      : 'https://lambda.us-east-1.amazonaws.com',
  });
  const stepfunctions = new AWS.StepFunctions({ apiVersion: '2016-11-23', endpoint: 'http://localhost:8014' });


  for (let record of event.Records) {
    console.dir(record, { depth: null })
    const { entityId, requestId, title } = JSON.parse(record.Sns.Message);

    const params = {
      // FunctionName is composed of: service name - stage - function name, e.g.
      FunctionName: 'async-request-backend-dev-log-event',
      InvocationType: 'Event',
      Payload: JSON.stringify({ input: JSON.stringify({ entityId, requestId, title }), stateMachineArn: "" }),
    }

    console.log("    Invoking log-event step function");
    try {
      await stepfunctions.startExecution({
        stateMachineArn: 'arn:aws:sns:us-east-1:123456789012:log-event', /* required */
        input: JSON.stringify({ entityId, requestId, title }),
      }).promise();
      //await lambda.invoke(params).promise()
    } catch (err) {
      console.log("ERROR", err)
    }

    console.log("    Done!")





    //await send({ data: { entityId, requestId } })
  }
}

module.exports.handler = todoHandler;
module.exports.command = todoCommand;