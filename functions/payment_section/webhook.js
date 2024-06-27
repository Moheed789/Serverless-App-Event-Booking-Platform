import stripe from 'stripe';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';

const stripeClient = stripe('sk_test_51PVwwzF9KYbNnXisY7rZGpkUfoiVNiXhqkT3S5HizIzsUKpkgCxvl7rziVcNUU5U7TFLXQI5UQln6pe1rCKmr7Co00kmjz47vo');

const createWebhookEndpoint = async (event) => {
    console.log("Event", event)
    try {
        const webhookEndpoint = await stripeClient.webhookEndpoints.create({
            enabled_events: ['charge.succeeded', 'charge.failed'],
            url: 'https://google.com/my/webhook/endpoint',
        });
        console.log('Webhook endpoint created:', webhookEndpoint);
    } catch (error) {
        console.error('Error creating webhook endpoint:', error);
        throw new Error("Internal Server Error");
    }
};

export const createWebHook = middy(createWebhookEndpoint)
    .use(httpErrorHandler());