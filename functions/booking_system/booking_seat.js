import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";

const handler = async (event) => {
    console.log("Event", event);
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const ticketsTableName = process.env.tickets_table_name;
    const userId = event.requestContext.authorizer.claims.sub;
    const { eventId, quantity, totalPrice, bookingTime } = event.body;
    const ticketId = uuidv4();
    const currentDate = new Date().toISOString();

    const params = {
        TableName: ticketsTableName,
        Item: {
            eventId: eventId,
            ticketId: ticketId,
            userId: userId,
            quantity: quantity,
            totalPrice: totalPrice,
            bookingTime: currentDate || bookingTime,
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

export const bookTickets = middy(handler)
    .use(httpJsonBodyParser())
    .use(httpErrorHandler());