import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";

const handler = async (event) => {
    console.log("Event", event);
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const tableName = process.env.events_table_name;
    const { eventName, location, country, city, eventTime, eventDate } = event.body;
    const userId = event.requestContext.authorizer.claims.sub;
    const eventId = uuidv4();

    const params = {
        TableName: tableName,
        Item: {
            eventId: eventId,
            eventPlannerId: userId,
            eventName: eventName,
            location: location,
            country: country,
            city: city,
            eventDate: eventDate,
            eventTime: eventTime,
        },
    };

    try {
        await dynamodb.put(params).promise();
        return {
            statusCode: 201,
            body: JSON.stringify(params.Item),
        };
    } catch (error) {
        console.error("Error:", error.message);
        throw new Error("Could not create event");
    }
};

export const addEvents = middy(handler)
    .use(httpJsonBodyParser())
    .use(httpErrorHandler());