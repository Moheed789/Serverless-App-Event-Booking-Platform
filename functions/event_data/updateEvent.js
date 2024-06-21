import AWS from "aws-sdk";
import dayjs from "dayjs";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";

const handler = async (event) => {
    console.log("event", event);
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const tableName = process.env.events_table_name;
    const { eventName, location, country, city, date, time } = event.body;

    const currentDate = dayjs().format('DD-MM-YYYY');
    const currentTime = dayjs().format('HH:mm:ss');

    const eventId = event.pathParameters?.eventId;

    try {
        const result = await dynamodb.update({
            TableName: tableName,
            Key: { eventId },
            UpdateExpression: 'set #eventName = :eventName, #location = :location, #country = :country, #city = :city, #date = :date, #time = :time',
            ExpressionAttributeNames: {
                '#eventName': 'eventName',
                '#location': 'location',
                '#country': 'country',
                '#city': 'city',
                '#date': 'date',
                '#time': 'time',
            },
            ExpressionAttributeValues: {
                ':eventName': eventName,
                ':location': location,
                ':country': country,
                ':city': city,
                ':date': currentDate || date,
                ':time': currentTime || time,
            },
            ReturnValues: "ALL_NEW",
        }).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Event Edit Successfully",
                updatedEvent: result.Attributes,
            }),
        };
    } catch (error) {
        console.error(error);
        throw error
    }
};

export const editEventPlanner = middy(handler)
    .use(httpJsonBodyParser())
    .use(httpErrorHandler());

export default editEventPlanner;