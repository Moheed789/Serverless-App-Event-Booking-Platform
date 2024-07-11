import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import { buildResponse } from "../../utils/buildResponses.js";

const addEvents = async (event) => {
    console.log("Event", event);
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const tableName = process.env.events_table_name;
    const { 
        eventName, 
        location, 
        country, 
        city, 
        eventDate,
        eventTime,
        createdAt, 
        updatedAt, 
        tickets, 
        bookingTime, 
        bookingDate, 
        payment,
        quantity,
        price,
        ticketType,
        ticketsAvailable
    } = event.body;
    const userId = event.requestContext.authorizer.claims.sub;
    const eventId = uuidv4();

    const ticketsArray = Array.isArray(tickets) ? tickets.map(ticket => ({
        ...ticket,
        bookingTime: bookingTime,
        bookingDate: bookingDate,
        payment: payment,
        quantity: quantity,
        price: price,
        ticketType: ticketType
    })) : [];

    const cuuretTime = dayjs().unix();

    const params = {
        TableName: tableName,
        Item: {
            eventId: eventId,
            eventPlannerId: userId,
            eventName: eventName,
            location: location,
            country: country,
            city: city,
            createdAt: createdAt || cuuretTime,
            updatedAt: updatedAt || cuuretTime,
            eventDate: eventDate,
            eventTime: eventTime,
            ticketsAvailable: ticketsAvailable,
            tickets: ticketsArray
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

export const handler = middy(addEvents)
    .use(httpJsonBodyParser())
    .use(httpErrorHandler());