const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const bucketName = event.Records[0].s3.bucket.name;
    const objectKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const eventName = objectKey.split('.')[0]; 

    const params = {
        TableName: 'events',
        Key: { "name": eventName }
    };

    try {
        const data = await dynamoDB.get(params).promise();
        if (!data.Item) {
            throw new Error(`Evento ${eventName} no existe en la base de datos.`);
        }

        const updateParams = {
            TableName: 'events',
            Key: { "name": eventName },
            UpdateExpression: 'SET flyer = :flyer',
            ExpressionAttributeValues: {
                ':flyer': `s3://${bucketName}/${objectKey}`
            }
        };
        await dynamoDB.update(updateParams).promise();
        console.log(`Flyer del evento ${eventName} actualizado.`);
    } catch (error) {
        console.error('Error actualizando el flyer:', error.message);
    }
};

