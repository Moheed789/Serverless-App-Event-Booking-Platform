import AWS from "aws-sdk";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import { buildResponse } from "../../utils/buildResponses.js";

const deleteEventItem = async (event) => {
    console.log('Received event:', JSON.stringify(event));

    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const tableName = process.env.events_table_name;
    const eventId = event.pathParameters?.eventId;
    const eventPlannerId = event.requestContext?.authorizer?.claims?.sub;

    if (!eventId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "eventId is required" })
        };
    }

    if (!eventPlannerId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "eventPlannerId is required" })
        };
    }

    try {
        const getParams = {
            TableName: tableName,
            Key: { eventId, eventPlannerId }
        };

        const eventItem = await dynamodb.get(getParams).promise();

        if (!eventItem.Item) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: `This eventId is not your event list. ${eventId}.` })
            };
        }

        const deleteParams = {
            TableName: tableName,
            Key: { eventId, eventPlannerId }
        };

        await dynamodb.delete(deleteParams).promise();

        return buildResponse(200, {
            message: "Event Deleted Successfully"
        })
    } catch (err) {
        console.error('Error', err);
        throw new Error("Internal Server Error");
    }
};

export const handler = middy(deleteEventItem)
    .use(httpErrorHandler());