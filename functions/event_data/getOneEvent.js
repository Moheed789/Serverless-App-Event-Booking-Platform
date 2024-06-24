import AWS from "aws-sdk";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";

const handler = async (event) => {
    console.log('Event', event);

    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const tableName = process.env.events_table_name;
    const indexName = process.env.index_name;

    const userId = event.queryStringParameters?.eventPlannerId;

    if (!userId) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "eventPlannerId is required"
            })
        };
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
            return {
                statusCode: 200,
                body: JSON.stringify(res.Items)
            };
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "Please enter a valid eventPlannerId"
                })
            };
        }
    } catch (error) {
        console.error("Error querying DynamoDB:", error);
        throw new Error("Internal Server Error");
    }
};

export const getEvent = middy(handler)
    .use(httpErrorHandler());