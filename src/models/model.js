import fetch from "node-fetch";
import log from "npmlog";
import lodash from 'lodash';
import Ajv from "ajv";
const ajv = new Ajv();
const _ = lodash;

const schema = {
    type: "array",
    items: {
        type: "object",
        properties: {
            name_station: { type: "string"},
            reference_id: { type: "string"},
            operation_type: { type: "string" },
            sw_serial_number: { type: "string" },
            media_serial_number: { type: "string"},
            amount: { type: "number" },
            purse: { type: "number"},
            fare: { type: "string"}
        },
        required: [
            "date",
            "name_station",
            "reference_id",
            "operation_type",
            "sw_serial_number",
            "media_serial_number",
            "amount",
            "purse",
            "fare"
        ],
    },
};

export function validateData(data) {
    log.info(data);
    if (ajv.validate(schema, data)) {
        return true;
    } else {
        log.error('Err', 'Something went wrong!');
        log.error('Err', ajv.errors);
        return false;
    }
}

export async function sendTransaction(data) {
    log.info('Sending transactions to the endoint...');
    const endpoint = process.env.ENDPOINT + "/transactions/add/";

    const method = "PUT"
    const headers = { 'Content-type': 'application/json' }

    let dataChunk = _.chunk(data, process.env.BATCH_SIZE ? process.env.BATCH_SIZE : 5000);

    let i = 0;
    for(let dataSet of dataChunk) {
        i = i + dataSet.length;
        log.info(`Sending ${i} of ${data.length} objects`);
        console.log(JSON.stringify(dataSet.shift()))
        await fetch(endpoint, {method: method, headers: headers, body: JSON.stringify(dataSet)})
            .then(response => {
                let nowInJson = {};
                try {
                    nowInJson = response.json();
                } catch (e) {
                    log.error(e)
                }
                return nowInJson;
            })
            .then(result => {
                if (!_.isUndefined(result.detail)) {
                    log.warn(`Could not save: ${JSON.stringify(dataSet)}`);
                    log.warn(result.detail);
                }
            })
            .catch(err => {
                log.error('Something went wrong!');
                log.error(err);
            });

    }
}