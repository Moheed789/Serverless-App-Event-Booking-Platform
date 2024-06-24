import AWS from "aws-sdk";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpJsonBodyParser from "@middy/http-json-body-parser";

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.event_planner_table;

const generateUpdateQuery = (data) => {
    const exp = {
        UpdateExpression: "set",
        ExpressionAttributeNames: {},
        ExpressionAttributeValues: {},
    };

    Object.entries(data).forEach(([key, value]) => {
        exp.UpdateExpression += ` #${key} = :${key},`;
        exp.ExpressionAttributeNames[`#${key}`] = key;
        exp.ExpressionAttributeValues[`:${key}`] = value;
    });

    exp.UpdateExpression = exp.UpdateExpression.slice(0, -1);

    return exp;
};

const updateEventPlanner = async (userId, args) => {
    const expression = generateUpdateQuery(args);
    const params = {
        TableName: tableName,
        Key: {
            id: userId
        },
        ...expression,
        ReturnValues: "ALL_NEW",
    };

    try {
        const response = await dynamoDB.update(params).promise();
            return response.Attributes;
    } catch (error) {
        console.error("Error updating Event Planner User:", error);
        throw new Error("Failed to update Event Planner User");
    }
};

const handler = async (event) => {
    console.log("Event:", JSON.stringify(event));

    const userId = event.queryStringParameters.id;
    const {
        bio,
        company_name,
        phone_number,
        profile_status,
        rating,
        reviews,
        social_media,
        website
    } = event.body;

    const args = {
        bio,
        company_name,
        phone_number,
        profile_status,
        rating,
        reviews,
        social_media,
        website
    };

    try {
        const updatedUser = await updateEventPlanner(userId, args);
        if (updatedUser) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: "Edit Event Planner User Successfully done.",
                    data: updatedUser
                }),
            };
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "Please enter a valid id"
                })
            };
        }
    } catch (error) {
        console.error('Error:', error);
        throw new Error("Internal Server Error");
    }
};

export const eventPlannerUser = middy(handler)
    .use(httpJsonBodyParser())
    .use(httpErrorHandler());