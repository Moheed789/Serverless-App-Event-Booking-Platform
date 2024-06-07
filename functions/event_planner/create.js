import AWS from "aws-sdk";
import {v4 as uuidv4} from "uuid";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";

const tableName = process.env.event_data_table;

const handler= async (event) => {
  console.log("event", JSON.stringify(event));
  const dynamodb = new AWS.DynamoDB.DocumentClient()
  const {title, description, date, time, venue} = event.body;
  const id = uuidv4();

  const newEventPlanner = {
    id,
    title,
    description,
    date,
    time,
    venue
  };
  
  await dynamodb.put({
    TableName: tableName,
    Item: newEventPlanner
  }).promise();

    return {
        statusCode: 200,
        body: JSON.stringify(newEventPlanner),
  }
};

export const createEventPlanner = middy(handler)
  .use(httpJsonBodyParser())
  .use(httpErrorHandler());

export default createEventPlanner;