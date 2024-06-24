import AWS from "aws-sdk";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.event_planner_table;

const handler = async (event) => {
    console.log("event", JSON.stringify(event));
    const eventId = event.queryStringParameters.id;
    try {
        const params = {
            TableName: tableName,
            Key: {
                id: eventId
            }
        };
        const res = await dynamodb.get(params).promise();
        if (res && res.Item) {
            return {
                statusCode: 200,
                body: JSON.stringify(res.Item)
            };
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "User not found" })
            };
        }
    } catch (err) {
        console.log('Error', err);
        throw new Error("Internal Server Error");
    }
};

export const getEventPlanner = middy(handler)
    .use(httpErrorHandler());