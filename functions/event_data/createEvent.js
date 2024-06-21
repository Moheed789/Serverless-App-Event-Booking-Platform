import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.events_table_name;

const handler = async (event) => {
    console.log("Event", event);
    console.log("Event Authorizer", event.requestContext.authorizer);
    console.log("Event Authorizer Object", event.requestContext.authorizer.claims);
    const { eventName, location, country, city, time, date } = event.body;
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
            date: date,
            time: time,
        },
    };

    try {
        await dynamodb.put(params).promise();
        return {
            statusCode: 201,
            body: JSON.stringify(params.Item),
        };
    } catch (error) {
        console.log("error", error);
        throw error
    }
};

export const addEvents = middy(handler)
.use(httpJsonBodyParser())
.use(httpErrorHandler());

export default addEvents;