import AWS from 'aws-sdk';
import { validateCard } from '/opt/validateCard.js';


export const handler = async (event) => {

    const { name, quantity, creditCard } = event;
    const executionId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    if (!validateCard(creditCard)) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Tarjeta no válida' }) };
    }
    const params = {
        TableName: 'events',
        Key: { "name": name },
        ConditionExpression: "attribute_not_exists(#execId) AND disponibility >= :quantity",
        UpdateExpression: "SET disponibility = disponibility - :quantity, #execId = :execId",
        ExpressionAttributeValues: {
            ":quantity": quantity,
            ":execId": executionId
        },
        ExpressionAttributeNames: {
            "#execId": "executionId"
        },
        ReturnValues: "UPDATED_NEW"
    };

    try {
        const dynamoDB = new AWS.DynamoDB.DocumentClient();
        const result = await dynamoDB.update(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Compra exitosa', data: result.Attributes })
        };
    } catch (error) {
        console.error('Error gestionando la venta:', error.message);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'No se pudo procesar la venta. Verifique disponibilidad o ejecuciones duplicadas.' })
        };
    }
};
