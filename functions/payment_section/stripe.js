import stripe from 'stripe';
import middy from '@middy/core';
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from '@middy/http-error-handler';

const stripeClient = stripe('sk_test_51PVwwzF9KYbNnXisY7rZGpkUfoiVNiXhqkT3S5HizIzsUKpkgCxvl7rziVcNUU5U7TFLXQI5UQln6pe1rCKmr7Co00kmjz47vo');

const createCheckoutSession = async (event) => {
    console.log("Events", event);
    try {
        const { product_name, amount, currency, quantity, image_url } = event.body;
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
            mode: 'payment',
            success_url: 'https://google.com',
            cancel_url: 'https://example.com/cancel',
        });

        console.log("Payment Session", session.url);

        return {
            statusCode: 200,
            body: JSON.stringify({ sessionUrl: session.url }),
        };

    } catch (error) {
        console.log("Error", error);
        throw new Error("Internal Server Error");
    }
};

export const createPaymentSession = middy(createCheckoutSession)
    .use(httpJsonBodyParser())
    .use(httpErrorHandler());