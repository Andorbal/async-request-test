const AWS = require("aws-sdk"); // must be npm installed to use


const save = async (input, context) => {
  console.log("LOG-EVENT-SAVE -- Persist the event to the event store");
  console.log(" UP INS", input)
  console.dir(input, { depth: null });
  const data = JSON.parse(input);
  console.log("WHAT THAT", data.requestId)

  const stuff = {
    success: true,
    msg: JSON.stringify({ stonk: "a donk", requestId: data.requestId, entityId: data.entityId, title: data.title })
  };

  console.dir(stuff, { depth: null })
  return stuff;
}

const notify = async (input, context) => {
  console.log("LOG-EVENT-NOTIFY -- Notify the world of the event");
  //const input = JSON.parse(data);
  console.dir(input, { depth: null });
  const { entityId, requestId, title } = JSON.parse(input.msg);

  console.log("    publishing...")
  const sns = new AWS.SNS({
    endpoint: "http://127.0.0.1:4002",
    region: "us-east-1",
  });

  await sns.publish({
    Message: JSON.stringify({ entityId, requestId, title }),
    MessageAttributes: {
      entity: {
        "DataType": "String",
        "StringValue": "todo"
      },
    },
    TopicArn: "arn:aws:sns:us-east-1:123456789012:events",
  }).promise();

  console.log("    Done!")


  return { success: true };
}

module.exports = { save, notify }