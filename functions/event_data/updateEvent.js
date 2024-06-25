import AWS from "aws-sdk";
import dayjs from "dayjs";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";

const handler = async (event) => {
    console.log("event", event);
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const tableName = process.env.events_table_name;
    const { eventName, location, country, city, eventDate, eventTime } = event.body;
    const eventId = event.pathParameters?.eventId;

    if (!eventId) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "eventId is required"
            })
        };
    }

    const currentDate = dayjs().format('DD-MM-YYYY');
    const currentTime = dayjs().format('HH:mm:ss');

    try {
        const result = await dynamodb.update({
            TableName: tableName,
            Key: { eventId },
            UpdateExpression: 'set #eventName = :eventName, #location = :location, #country = :country, #city = :city, #eventDate = :eventDate, #eventTime = :eventTime',
            ExpressionAttributeNames: {
                '#eventName': 'eventName',
                '#location': 'location',
                '#country': 'country',
                '#city': 'city',
                '#eventDate': 'eventDate',
                '#eventTime': 'eventTime',
            },
            ExpressionAttributeValues: {
                ':eventName': eventName,
                ':location': location,
                ':country': country,
                ':city': city,
                ':eventDate': currentDate || eventDate,
                ':eventTime': currentTime || eventTime,
            },
            ReturnValues: "ALL_NEW",
        }).promise();
        if (result) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: "Event Edit Successfully",
                    updatedEvent: result.Attributes,
                }),
            };
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Event Not Update",
                }),
            };
        }
    } catch (error) {
        console.error(error);
        throw new Error("Internal Server Error");
    }
};

export const editEventPlanner = middy(handler)
    .use(httpJsonBodyParser())
    .use(httpErrorHandler());