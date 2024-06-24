import AWS from "aws-sdk";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";

const handler = async (event) => {
    console.log('event', event);

    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const tableName = process.env.events_table_name;
    const eventId = event.pathParameters?.eventId;

    if (!eventId) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "eventId is required"
            })
        };
    }

    try {
        const params = {
            TableName: tableName,
            Key: { eventId }
        };
        const res = await dynamodb.delete(params).promise();
        if (res) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: "Event Deleted Successfully"
                })
            };
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Event Not Deleted"
                })
            };
        }
    } catch (err) {
        console.error('Error', err);
        throw new Error("Internal Server Error");
    }
};

export const deleteEventItem = middy(handler)
    .use(httpErrorHandler());