import AWS from "aws-sdk";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
const dynamodb = new AWS.DynamoDB.DocumentClient();

const tableName = process.env.event_data_table;

const handler = async (event) => {
    console.log("event", JSON.stringify(event))
    try {
        const params = {
            TableName: tableName,
            Key: {
                id: event.pathParameters?.id
            }
        };

        await dynamodb.delete(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Event deleted successfully' })
        };
    } catch (error) {
        console.error('Error:', error);
        throw error
    }
};

export const deleteEventPlanner = middy(handler)
  .use(httpErrorHandler());

export default deleteEventPlanner;