const AWS = require("aws-sdk")
const todoPrefix = "TODO-";

// Create the DynamoDB service object
var ddb = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
  endpoint: "http://localhost:4566",
  region: "us-east-1",
});

const saveTodo = async (entityId, title) => {
  try {
    const params = {
      TableName: 'dev-read-model',
      Item: {
        'PK': { S: "CUSTOMER-1" },
        'SK': { S: todoPrefix + entityId },
        'title': { S: title }
      }
    };
    console.dir(params);
    await ddb.putItem(params).promise()
  } catch (err) {
    console.log("ERROR", err)
  }

}

const update = async (event, context) => {
  console.log("READ-MODEL-UPDATE -- Update read model with the event")
  console.dir(event);

  console.log(`    Got ${event.Records.length} message(s)`);
  console.dir(event, { depth: null })

  for (let record of event.Records) {
    console.dir(record, { depth: null })
    const { entityId, requestId, title } = JSON.parse(record.Sns.Message);

    await saveTodo(entityId, title)
  }
}

module.exports.update = update;