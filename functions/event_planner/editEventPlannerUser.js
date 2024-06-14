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

export const updateResume = async (userId, args) => {
    const expression = generateUpdateQuery(args);
    console.log("args,,,", args);
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
        console.log("xxxxxxxxxx resume not updated xxxxxxxxxxxxx", error);
        throw error;
    }
};

const handler = async (event) => {
    console.log("Event", JSON.stringify(event));
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
        const updatedUser = await updateResume(userId, args);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Edit Event Planner User Successfully done.",
                data: updatedUser
            }),
        };
    } catch (error) {
        console.log("error", error);
        throw error;
    }
};

export const eventPlannerUser = middy(handler)
    .use(httpJsonBodyParser())
    .use(httpErrorHandler());

export default eventPlannerUser;