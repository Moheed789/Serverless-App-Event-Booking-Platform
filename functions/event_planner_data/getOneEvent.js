import AWS from "aws-sdk";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.events_table_name;
const indexName = process.env.index_name;

const handler = async (event) => {
    console.log('Event', event);

    const userId = event.queryStringParameters.eventPlannerId;

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
    
        return {
            statusCode: 200,
            body: JSON.stringify(res.Items)
        };
    
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }    
};

export const getEvent = middy(handler)
.use(httpErrorHandler());

export default getEvent;