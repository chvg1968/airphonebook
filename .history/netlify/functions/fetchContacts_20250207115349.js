const fetch = require("node-fetch");

exports.handler = async () => {
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
    const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?pageSize=100&sort[0][field]=id&sort[0][direction]=asc`;

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${AIRTABLE_API_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error("❌ Error al obtener contactos:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Error al obtener contactos" })
        };
    }
};