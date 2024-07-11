import AWS from "aws-sdk";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import { buildResponse } from "../../utils/buildResponses.js";

const deleteEvents = async (event) => {
    console.log('Event:', event);

    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const tableName = process.env.events_table_name;
    const indexName = process.env.index_name;

    const userId = event.requestContext.authorizer.claims.sub;

    if (!userId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "EventPlannerId is required." })
        };
    }

    try {
        const queryParams = {
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

        const queryResult = await dynamodb.query(queryParams).promise();

        if (!queryResult.Items || queryResult.Items.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "No events found for the provided eventPlannerId" })
            };
        }

        const deletePromises = queryResult.Items.map(async (item) => {
            const deleteParams = {
                TableName: tableName,
                Key: {
                    eventId: item.eventId,
                    eventPlannerId: item.eventPlannerId
                }
            };

            return dynamodb.delete(deleteParams).promise();
        });

        await Promise.all(deletePromises);

        return buildResponse(200, {
            message: "All Events Deleted Successfully"
        })
    } catch (error) {
        console.error("Error deleting events from DynamoDB:", error);
        throw new Error("Internal Server Error");
    }
};

export const handler = middy(deleteEvents)
    .use(httpErrorHandler());