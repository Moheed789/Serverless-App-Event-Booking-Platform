import dayjs from 'dayjs';

export const generateUpdateQuery = (data) => {
    const exp = {
        UpdateExpression: "set",
        ExpressionAttributeNames: {},
        ExpressionAttributeValues: {},
    };

    Object.entries(data).forEach(([key, item], index) => {
        exp.UpdateExpression += ` #${key} = :${key},`;
        exp.ExpressionAttributeNames[`#${key}`] = key;
        exp.ExpressionAttributeValues[`:${key}`] = item;
    });

    exp.UpdateExpression += " #updatedAt = :updatedAt";
    exp.ExpressionAttributeNames["#updatedAt"] = "updatedAt";
    exp.ExpressionAttributeValues[":updatedAt"] = dayjs().unix();

    return exp;
};
