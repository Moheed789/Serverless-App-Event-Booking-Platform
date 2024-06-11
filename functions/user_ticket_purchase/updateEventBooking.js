import AWS from "aws-sdk";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import dayjs from "dayjs";

const tableName = process.env.event_booking_table;

const handler = async (event) => {
  const dynamodb = new AWS.DynamoDB.DocumentClient();
  const { name, location } = event.body;
  const eventId = event.pathParameters?.id;

  const currentDate = dayjs().format('DD-MM-YYYY');
  const currentTime = dayjs().format('HH:mm:ss');

  await dynamodb.update({
    TableName: tableName,
    Key: {
      id: eventId,
    },
    UpdateExpression: 'set #name = :name, #location = :location',
    ExpressionAttributeNames: {
      '#name': 'name',
      '#location': 'location',
    },
    ExpressionAttributeValues: {
      ':name': name,
      ':date': date || currentDate,
      ':time': time || currentTime,
      ':location': location,
    },
    ReturnValues: "ALL_NEW",
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Event Booking Edit Successfully",
    }),
  };
};

export const updateEventBookins = middy(handler)
  .use(httpJsonBodyParser())
  .use(httpErrorHandler());

export default updateEventBookings;