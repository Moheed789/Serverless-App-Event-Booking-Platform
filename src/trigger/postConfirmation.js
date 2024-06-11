import AWS from "aws-sdk";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import dayjs from "dayjs";
const dynamodb = new AWS.DynamoDB.DocumentClient();
const eventTableName = process.env.event_planner_table;
const eventGroupName = process.env.event_group_name;
const userTableName = process.env.user_ticket_purchaser_table;
const userGroupName = process.env.group_name;

const handler = async (event) => {
  console.log("event", JSON.stringify(event));
  const profile = "userTicketPurchaser";
  const currentDate = dayjs().toISOString();
  try {
    const eventCreate = {
      id: event.request.userAttributes.sub,
      name: event.userName,
      firstName: event.request.userAttributes.given_name,
      lastName: event.request.userAttributes.family_name,
      email: event.request.userAttributes.email,
      profile_status: 'incomplete',
      phone_number: '',
      company_name: '',
      bio: '',
      website: '',
      social_media: '',
      event_planned: event.request.userAttributes.given_name,
      rating: '',
      reviews: '',
      createdAt: currentDate,
      updatedAt: currentDate
    };
    const userCreate = {
      id: event.request.userAttributes.sub,
      name: event.userName,
      firstName: event.request.userAttributes.given_name,
      lastName: event.request.userAttributes.family_name,
      email: event.request.userAttributes.email,
      phone_number: '',
      tickets_bought: '',
      ticket_ids: '',
      payment_information: '',
      event_details: '',
      purchase_date: '',
      status: '',
      createdAt: currentDate,
      updatedAt: currentDate
    };
    if(profile === "eventplanner") {
      await dynamodb.put({
        TableName: eventTableName,
        Item: eventCreate
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