import AWS from "aws-sdk";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";

const tableName = process.env.event_booking_table;

const handler = async (event) => {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    try {
        const res = await dynamodb.scan({TableName: tableName}).promise();
    
        return {
            statusCode: 200,
            body: JSON.stringify(res)
        };
    } catch (error) {
        console.error("Error:", error);
        throw error
    }    
};

export const getAllEventBookings = middy(handler)
  .use(httpErrorHandler());

export default getAllEventBookings;