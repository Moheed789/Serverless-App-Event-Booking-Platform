import AWS from "aws-sdk";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import { buildResponse } from "../../utils/buildResponses.js";
import { generateUpdateQuery } from "../../src/services/generateUpdateQuery.js";
const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.events_table_name;

const updateEvent = async (eventId, args) => {
    const expression = generateUpdateQuery(args);
    const params = {
        TableName: tableName,
        Key: {
            id: eventId
        },
        ...expression,
        ReturnValues: "ALL_NEW",
    };

    try {
        const response = await dynamodb.update(params).promise();
            return response.Attributes;
    } catch (error) {
        console.error("Error updating Event Planner User:", error);
        throw new Error("Failed to update Event Planner User");
    }
};

const editEvent = async (event) => {
    console.log("event", event);
    const eventId = event.pathParameters?.eventId;
    const { 
        eventName, 
        location, 
        country, 
        city, 
        eventDate, 
        eventTime 
    } = event.body;

    if (!eventId) {
        throw new Error("eventId is required");
    }

    const args = {
        eventName: eventName,
        location: location,
        country: country,
        city: city,
        eventDate: eventDate,
        eventTime: eventTime
    };
    try {
        const updatedEvent = await updateEvent(eventId, args);
        if (updatedEvent) {
            return buildResponse(200, {
                message: "Event Update Successfully",
                UpdateEvent: result.Attributes
            })
        } else {
            throw new Error("Event Not Update");
        }
    } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error");
    }
};

export const handler = middy(editEvent)
    .use(httpJsonBodyParser())
    .use(httpErrorHandler());