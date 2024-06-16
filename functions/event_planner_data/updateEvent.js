import AWS from "aws-sdk";
import middy from "@middy/core";
import dayjs from "dayjs";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.events_table_name;

const handler = async (event) => {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    const {name, location, country, city } = event.body;
    const eventId = event.queryStringPathParameters?.eventId;

    const currentDate = dayjs().format('DD-MM-YYYY');
    const currentTime = dayjs().format('HH:mm:ss');

    await dynamodb.update({
        TableName: tableName,
        Key: {
            id: eventId,
        },
        UpdateExpression: 'set #title = :title, #description = :description, #date = :date, #time = :time, #venue = :venue',
        ExpressionAttributeNames: {
            '#title': 'title',
            '#description': 'description',
            '#date': 'date',
            '#time': 'time',
            '#venue': 'venue',
        },
        ExpressionAttributeValues: {
            ':title': title,
            ':description': description,
            ':date': date || currentDate,
            ':time': time || currentTime,
            ':venue': venue,
        },
        ReturnValues: "ALL_NEW",
    }).promise();

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Event Edit Successfully",
        }),
    };
};

export const editEventPlanner = middy(handler)
    .use(httpJsonBodyParser())
    .use(httpErrorHandler());

export default editEventPlanner;