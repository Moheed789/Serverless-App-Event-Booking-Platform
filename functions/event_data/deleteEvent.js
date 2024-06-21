import AWS from "aws-sdk";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.events_table_name;

const handler = async (event) => {
    console.log('event', event);
    try {
        const eventId = event.pathParameters?.eventId;

        const params = {
            TableName: tableName,
            Key: {eventId}
        };

            await dynamodb.delete(params).promise();

            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: "Item Deleted Successfully"
                })
            };
    } catch (err) {
        console.error('Error', err);
        throw err;
    }
};

export const deleteEventItem = middy(handler)
.use(httpErrorHandler());

export default deleteEventItem;