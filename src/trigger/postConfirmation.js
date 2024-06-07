import AWS from "aws-sdk";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import hhtpErrorHandler from "@middy/http-error-handler";
import { v4 as uuidv4 } from "uuid";
import httpErrorHandler from "@middy/http-error-handler";
const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.event_planner_table;
const groupName = process.env.event_group_name;

const handler = async (event) => {
  console.log("event", JSON.stringify(event));
  const id = uuidv4();
  try {
    const userCreate = {
      id,
      name: event.userName,
      fatherName: event.request.userAttributes.family_name,
      email: event.request.userAttributes.email
    };
    await dynamodb.put({
      TableName: tableName,
      Item: userCreate
    }).promise();
    const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
    const params = {
      GroupName: groupName,
      Username: event.userName,
      UserPoolId: event.userPoolId
    };
    await cognitoIdentityServiceProvider.adminAddUserToGroup(params).promise();
    console.log('User added to group successfully.');
    return event
  } catch (err) {
    console.error('Error', err)
    throw err;
  }
};

export default {
  handler: middy(handler)
  .use(httpJsonBodyParser())
  .use(httpErrorHandler())
}