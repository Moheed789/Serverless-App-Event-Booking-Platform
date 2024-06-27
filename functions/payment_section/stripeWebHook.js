import stripe from 'stripe';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';

const stripeClientWebHook = stripe('sk_test_51PVwwzF9KYbNnXisY7rZGpkUfoiVNiXhqkT3S5HizIzsUKpkgCxvl7rziVcNUU5U7TFLXQI5UQln6pe1rCKmr7Co00kmjz47vo');

const handler = async (event) => {
    console.log("Event Body", event);

    try {
        const sig = event.headers['Stripe-Signature'];
        const endpointSecret = 'whsec_e78b090912643dd9d950a3b5935f76a5cbe6a2c3becabdfc3cb8436dd6b3c0ef';
        const eventBody = event.body;

        if (!eventBody) {
            throw new Error("No webhook payload was provided.");
        }

        let stripeEvent;

        try {
            stripeEvent = stripeClientWebHook.webhooks.constructEvent(eventBody, sig, endpointSecret);
        } catch (err) {
            console.log(`Webhook signature verification failed.`, err.message);
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: `Webhook Error ${err.message}`
                }),
            }
        }

        switch (stripeEvent.type) {
            case 'checkout.session.completed':
                const checkoutSessionCompleted = stripeEvent.data.object;
                console.log(`Payment for session ${checkoutSessionCompleted.id} completed.`);
                break;
            default:
                console.log(`Unhandled event type ${stripeEvent.type}`);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ received: true }),
        };
    } catch (error) {
        console.log(error);
        throw new Error("Internal Server Error");
    }
};

export const stripeWebhook = middy(handler)
    .use(httpErrorHandler());