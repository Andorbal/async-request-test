const AWS = require("aws-sdk"); // must be npm installed to use
const { v4: uuidv4 } = require("uuid")

const todoHandler = async (event, context) => {
  const { title } = JSON.parse(event.body);

  console.log("publishing...")
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
  console.log("Got a message");
  console.dir(event, { depth: null })
  console.dir()
}

module.exports.handler = todoHandler;
module.exports.command = todoCommand;