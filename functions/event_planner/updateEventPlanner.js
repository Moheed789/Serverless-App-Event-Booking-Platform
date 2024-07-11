import AWS from "aws-sdk";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { buildResponse } from "../../utils/buildResponses.js";
import { generateUpdateQuery } from "../../src/services/generateUpdateQuery.js";

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.event_planner_table;

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

const eventPlannerUser = async (event) => {
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
            return buildResponse(200, {
                message: "Edit Event Planner User Successfully done.",
                data: updatedUser
            })
        } else {
            throw new Error("Please enter a valid id");
        }
    } catch (error) {
        console.error('Error:', error);
        throw new Error("Internal Server Error");
    }
};

export const handler = middy(eventPlannerUser)
    .use(httpJsonBodyParser())
    .use(httpErrorHandler());