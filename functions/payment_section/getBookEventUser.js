import AWS from "aws-sdk";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import { buildResponse } from "../../utils/buildResponses.js";

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.events_table_name;

const getEventPlanner = async (event) => {
    console.log("Event", event);
    const eventId = event.pathParameters.eventId;
    try {
        const params = {
            TableName: tableName,
            Key: {
                eventId: eventId
            }
        };
        const res = await dynamodb.get(params).promise();
        if (res && res.Item) {
            return buildResponse(200, {
                Item: params.Item
            })
        } else {
            throw new Error("User not found");
        }
    } catch (err) {
        console.log('Error', err);
        throw new Error("Internal Server Error");
    }
};

export const handler = middy(getEventPlanner)
    .use(httpErrorHandler());