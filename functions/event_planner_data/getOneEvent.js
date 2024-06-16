import AWS from "aws-sdk";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.events_table_name;

const handler = async (event) => {
    const params = {
        TableName: tableName
    };

    try {
        const result = await dynamodb.scan(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    } catch (error) {
        console.log("error", error);
        throw error;
    }
};

export const getEvent = middy(handler)
    .use(httpErrorHandler());

export default getEvent;