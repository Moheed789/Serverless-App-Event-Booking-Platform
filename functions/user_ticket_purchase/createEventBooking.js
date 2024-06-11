import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import dayjs from "dayjs";

const tableName = process.env.event_booking_table;

const handler = async (event) => {
  console.log("event", JSON.stringify(event));
  const dynamodb = new AWS.DynamoDB.DocumentClient();
  const { name, location } = event.body;
  const id = uuidv4();
  const currentDate = dayjs().format('DD-MM-YYYY');
  const currentTime = dayjs().format('HH:mm:ss');

  const newEventBooking = {
    id,
    name,
    date: currentDate,
    time: currentTime,
    location
  };

  await dynamodb.put({
    TableName: tableName,
    Item: newEventBooking
  }).promise();

  return {
    statusCode: 201,
    body: JSON.stringify(newEventBooking),
  };
};

export const addEventBooking = middy(handler)
  .use(httpJsonBodyParser())
  .use(httpErrorHandler());

export default addEventBooking;
