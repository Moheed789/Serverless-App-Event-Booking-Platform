import AWS from "aws-sdk";
import middy from "@middy/core";
import { v4 as uuidv4 } from "uuid";
import httpErrorHandler from "@middy/http-error-handler";
const dynamodb = new AWS.DynamoDB.DocumentClient();
const eventTableName = process.env.event_planner_table;
const eventGroupName = process.env.event_group_name;
const userTableName = process.env.user_ticket_purchaser_table;
const userGroupName = process.env.user_ticket_purchaser_group_name;
const profile = "eventplanner";

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
    if (profile === "eventplanner") {
      await dynamodb.put({
        TableName: eventTableName,
        Item: userCreate
      }).promise();
      const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
      const params = {
        GroupName: eventGroupName,
        Username: event.userName,
        UserPoolId: event.userPoolId
      };
      await cognitoIdentityServiceProvider.adminAddUserToGroup(params).promise();
      console.log('User added to group successfully.');
      return event
    } else if (profile === "userTicketPurchaser") {
      await dynamodb.put({
        TableName: userTableName,
        Item: userCreate
      }).promise();
      const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
      const params = {
        GroupName: userGroupName,
        Username: event.userName,
        UserPoolId: event.userPoolId
      };
      await cognitoIdentityServiceProvider.adminAddUserToGroup(params).promise();
      console.log('User added to group successfully.');
      return event
    } else {
      throw err;
    }
  } catch (err) {
    console.error('Error', err)
    throw err;
  }
};

export const postConfirmationTrigger = middy(handler)
  .use(httpErrorHandler());

export default postConfirmationTrigger;