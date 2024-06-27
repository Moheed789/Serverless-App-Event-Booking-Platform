import stripe from 'stripe';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';

const stripeClient = stripe('sk_test_51MXQSyHXd9MVqwiMTk84eP6MeSxcFySjsLIFRTFtFZEXxfoCjrWasrGDFtmfqROLlHwxAgH9xXoX1DtgtBqDdo4O00es6GXXKl');

const createWebhookEndpoint = async (event) => {
    console.log("Event", event)
    try {
        const webhookEndpoint = await stripeClient.webhookEndpoints.create({
            enabled_events: ['charge.succeeded', 'charge.failed'],
            url: 'https://example.com/my/webhook/endpoint',
        });
        console.log('Webhook endpoint created:', webhookEndpoint);
        return {
            statusCode: 200,
            body: JSON.stringify({ webhookEndpoint: webhookEndpoint.url})
        };
    } catch (error) {
        console.error('Error creating webhook endpoint:', error);
        throw new Error("Internal Server Error");
    }
};

export const createWebHook = middy(createWebhookEndpoint)
    .use(httpErrorHandler());