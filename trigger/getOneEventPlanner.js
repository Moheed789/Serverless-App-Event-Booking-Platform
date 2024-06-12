import AWS from "aws-sdk";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.event_planner_table;

const handler = async (event) => {
    console.log("event", JSON.stringify(event));
    const eventPlannerId = event.pathParameters;
    try {
        const params = {
            TableName: tableName,
            key: {
                id: eventPlannerId
            }
        };
            const res = await dynamodb.get(params).promise();
            return {
                statusCode: 200,
                body: JSON.stringify(res.Item)
            };
    } catch (err) {
        console.log('Error', err);
        throw err
    }
};

export const getEventPlanner = middy(handler)
    .use(httpErrorHandler());

export default getEventPlanner;