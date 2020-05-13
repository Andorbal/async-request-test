const AWS = require("aws-sdk")

// Create the DynamoDB service object
var ddb = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
  endpoint: "http://localhost:4566",
  region: "us-east-1",
});

const saveConnection = async connectionId => {
  try {
    const params = {
      TableName: 'dev-read-model',
      Item: {
        'PK': { S: "CONNECTION" },
        'SK': { S: connectionId },
      }
    };
    console.dir(params);
    await ddb.putItem(params).promise()
  } catch (err) {
    console.log("ERRROR", err)
  }

}

const removeConnection = async connectionId => {
  await ddb.deleteItem({
    TableName: 'dev-read-model',
    Item: {
      'PK': { S: "CONNECTION" },
      'SK': { S: connectionId },
    }
  }).promise()
}

const getConnections = async () => {
  try {
    const response = await ddb.query({
      ExpressionAttributeValues: {
        ':PK': { S: "CONNECTION" },
      },
      KeyConditionExpression: 'PK = :PK',
      TableName: 'dev-read-model'
    }).promise();

    console.dir(response, { depth: null });
    return response.Items.map(x => x.SK.S);
  } catch (err) {
    console.log("ERRRO", err)
  }
}


const sendAcknowledgement = event => sendToConnection("Hello!", event.requestContext.connectionId);

const handler = async (event, context) => {
  console.dir(event);

  switch (event.requestContext.routeKey) {
    case "$connect":
      console.log(`Adding connection ${event.requestContext.connectionId}`)
      await saveConnection(event.requestContext.connectionId);
      console.log("Starting to respond")
      await sendAcknowledgement(event)
      return;
    case "$disconnect":
      console.log(`Removing connection ${event.requestContext.connectionId}`)
      await removeConnection(event.requestContext.connectionId)
      return;
    default:
      console.log("NOOOOOOOOOOOOOO", event.requestContext.routeKey)
  }
}

const send = async message => {
  console.log("Sending responses")
  const connections = await getConnections();

  for (let connectionId of connections) {
    console.log(`Responding to ${connectionId}`)
    await sendToConnection(message, connectionId);
  }
}

const sendToConnection = async (message, connectionId) => {
  try {
    console.log("Responding...")
    const apiGatewayManagementApi = new AWS.ApiGatewayManagementApi({
      apiVersion: '2018-11-29',
      endpoint: 'http://localhost:3001',
    });

    await apiGatewayManagementApi.postToConnection({
      ConnectionId: connectionId,
      Data: JSON.stringify({ message }),
    }).promise();
  } catch (err) {
    console.log("EEEEEEEERRRRRRRRR")
    console.error(err);
  }
}

module.exports.send = send;
module.exports.handler = handler;
