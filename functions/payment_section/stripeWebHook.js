import AWS from "aws-sdk";
import Stripe from 'stripe';
import middy from '@middy/core';
import ssm from '@middy/ssm'
import httpErrorHandler from '@middy/http-error-handler';
import { v4 as uuidv4 } from 'uuid';
import { buildResponse } from "../../utils/buildResponses.js";

const stripeSecretKey = process.env.stripe_secret_key;
const stripeWebhookKey = process.env.webhook_secret_key;
const eventsTableName = process.env.events_table_name;
const userBookingsTableName = process.env.user_bookings_table_name;

const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-06-20",
});

const stripeEventWebhook = async (event) => {
    console.log("Event", event);
    try {
        const signature = event.headers["Stripe-Signature"];
        const payload = event.body;

        const stripeEvent = stripe.webhooks.constructEvent(
            payload,
            signature,
            stripeWebhookKey
        );

        if (stripeEvent.type === "checkout.session.completed") {
            const dynamodb = new AWS.DynamoDB.DocumentClient();
            const eventId = stripeEvent.data.object.metadata.eventId;
            const userName = stripeEvent.data.object.customer_details.name;

            const getParams = {
                TableName: eventsTableName,
                Key: {
                    eventId: eventId
                }
            };

            const res = await dynamodb.get(getParams).promise();
            if (res && res.Item) {
                const ticketsAvailable = res.Item.ticketsAvailable;
                if (ticketsAvailable > 0) {
                    const updateParams = {
                        TableName: eventsTableName,
                        Key: {
                            eventId: eventId
                        },
                        UpdateExpression: 'SET ticketsAvailable = ticketsAvailable - :minus',
                        ExpressionAttributeValues: {
                            ':minus': 1
                        },
                        ReturnValues: 'UPDATED_NEW'
                    };

                    await dynamodb.update(updateParams).promise();

                    const bookingParams = {
                        TableName: userBookingsTableName,
                        Item: {
                            bookingId: stripeEvent.id,
                            id: uuidv4(),
                            userName: userName,
                            eventId: eventId,
                            bookingTime: new Date().toISOString(),
                            status: "confirmed"
                        }
                    };

                    await dynamodb.put(bookingParams).promise();

                    return {
                        statusCode: 200,
                        body: JSON.stringify({
                            message: "Tickets booked, ticket count updated, and user booking saved",
                            Event: res.Item
                        }),
                    };
                } else {
                    throw new Error("No tickets available");
                }

            } else {
                throw new Error("Event not found")
            }
        }

        return buildResponse(200, {
            received: true
        })
    } catch (error) {
        console.error("Error", error);
        throw new Error("Webhook Error: " + error.message);
    }
};

export const handler = middy(stripeEventWebhook)
    .use(ssm({
        cache: true,
        cacheExpiry: 60000,
        fetchData: {
            config: "/moheed/stripe/secret",
            config: "/moheed/stripe/webhook/secret"
        }
    })).use(httpErrorHandler());