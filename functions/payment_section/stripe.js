import stripe from 'stripe';
import middy from '@middy/core';
import ssm from '@middy/ssm';
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from '@middy/http-error-handler';
import { buildResponse } from "../../utils/buildResponses.js";

const stripeClient = stripe(process.env.stripe_secret_key);

const createCheckoutSession = async (event) => {
    console.log("Events", event);
    try {
        const { product_name, amount, currency, quantity, image_url, eventId } = event.body;
        const session = await stripeClient.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: currency,
                        product_data: {
                            name: product_name,
                            images: [image_url],
                        },
                        unit_amount: amount,
                    },
                    quantity: quantity,
                },
            ],
            metadata: {
                eventId: eventId
            },
            mode: 'payment',
            success_url: `https://lm89nhl3bc.execute-api.us-east-1.amazonaws.com/dev/get-user-book-events/${eventId}`,
            cancel_url: 'https://example.com/cancel',
        });

        return buildResponse(200, {
            sessionUrl: session.url
        })

    } catch (error) {
        console.log("Error", error);
        throw new Error("Internal Server Error");
    }
};

export const handler = middy(createCheckoutSession)
    .use(ssm({
        cache: true,
        cacheExpiry: 60000,
        fetchData: {
            config: "/moheed/stripe/secret"
        }
    })).use(httpJsonBodyParser())
    .use(httpErrorHandler());