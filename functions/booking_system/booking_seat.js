import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import { buildResponse } from "../../utils/buildResponses.js";

const bookTickets = async (event) => {
    console.log("Event", event);
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const ticketsTableName = process.env.tickets_table_name;
    const userId = event.requestContext.authorizer.claims.sub;
    const { eventId, quantity, totalPrice, bookingDate, bookingTime } = event.body;
    const ticketId = uuidv4();
    const currentDate = new Date().toDateString();
    const currentTime = new Date().toTimeString();

    const params = {
        TableName: ticketsTableName,
        Item: {
            eventId: eventId,
            ticketId: ticketId,
            userId: userId,
            quantity: quantity,
            totalPrice: totalPrice,
            bookingDate: currentDate || bookingDate,
            bookingTime: currentTime || bookingTime
        },
    };

    try {
        await dynamodb.put(params).promise();
        return buildResponse(201, {
            Item: params.Item
        })
    } catch (error) {
        console.error("Error:", error.message);
        throw new Error("Could not create event");
    }
};

export const handler = middy(bookTickets)
    .use(httpJsonBodyParser())
    .use(httpErrorHandler());