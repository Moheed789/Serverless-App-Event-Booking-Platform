import AWS from "aws-sdk";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";

const tableName = process.env.event_data_table;

const handler = async (event) => {
  const dynamodb = new AWS.DynamoDB.DocumentClient()
  const {title, description, date, time, venue} = event.body;
  const eventId = event.pathParameters?.id;

  await dynamodb.update({
    TableName: tableName,
    Key: {
        id: eventId
    },
    UpdateExpression: 'set #title = :title, #description = :description, #date = :date, #time = :time, #venue = :venue',
    ExpressionAttributeNames: {
      '#title': 'title',
      '#description': 'description',
      '#date': 'date',
      '#time': 'time',
      '#venue': 'venue',
  },
    ExpressionAttributeValues: {
        ':title': title,
        ':description': description,
        ':date': date,
        ':time': time,
        ':venue': venue,
    },
    ReturnValues: "ALL_NEW"
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({
        message: "Event Edit Successfully"
    }),
  };
};

export const updateEventPlanner = middy(handler)
  .use(httpJsonBodyParser())
  .use(httpErrorHandler());

export default updateEventPlanner;