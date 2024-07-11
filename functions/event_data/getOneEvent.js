import AWS from "aws-sdk";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import { buildResponse } from "../../utils/buildResponses.js";

const getEvent = async (event) => {
    console.log('Event', event);

    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const tableName = process.env.events_table_name;
    const indexName = process.env.index_name;

    const userId = event.queryStringParameters?.eventPlannerId;

    if (!userId) {
        throw new Error("eventPlannerId is required");
    }

    try {
        const params = {
            TableName: tableName,
            IndexName: indexName,
            KeyConditionExpression: "#eventPlannerId = :eventPlannerIdValue",
            ExpressionAttributeNames: {
                "#eventPlannerId": 'eventPlannerId',
            },
            ExpressionAttributeValues: {
                ":eventPlannerIdValue": userId,
            }
        };

        const res = await dynamodb.query(params).promise();
        if (res && res.Items && res.Items.length > 0) {
            return buildResponse(200, {
                Events: res.Items
            })
        } else {
            throw new Error("Please enter a valid eventPlannerId");
        }
    } catch (error) {
        console.error("Error querying DynamoDB:", error);
        throw new Error("Internal Server Error");
    }
};

export const handler = middy(getEvent)
    .use(httpErrorHandler());