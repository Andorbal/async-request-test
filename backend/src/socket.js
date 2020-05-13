const AWS = require("aws-sdk")

const sendAcknowledgement = async event => {
  try {
    console.log("Responding...")
    const apiGatewayManagementApi = new AWS.ApiGatewayManagementApi({
      apiVersion: '2018-11-29',
      endpoint: 'http://localhost:3001',
    });

    await apiGatewayManagementApi.postToConnection({
      ConnectionId: event.requestContext.connectionId,
      Data: JSON.stringify({ message: "Hello!" }),
    }).promise();
  } catch (err) {
    console.log("EEEEEEEERRRRRRRRR")
    console.error(err);
  }

}

const handler = async (event, context) => {
  console.dir(event);

  switch (event.requestContext.routeKey) {
    case "$connect":
      await sendAcknowledgement(event)
      return;
    default:
      console.log("NOOOOOOOOOOOOOO", event.requestContext.routeKey)
  }
}

module.exports.handler = handler;
