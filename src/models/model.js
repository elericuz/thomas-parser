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
            name_station: {type: "string"},
            terminal: {type: "string"},
            operation_type: {type: "string"},
            external_number: {type: "string"},
            internal_number: {type: "number"},
            card_transaction_number: {type: "number"},
            former_purse: {type: "number"},
            amount: {type: "number"},
            purse: {type: "number"},
            document_id: {type: "string"},
            fare: {type: "string"},
            json_file: {type: "string"}
        },
        required: [
            "date",
            "name_station",
            "terminal",
            "operation_type",
            "external_number",
            "internal_number",
            "card_transaction_number",
            "former_purse",
            "amount",
            "purse",
            "document_id",
            "fare"
        ],
    },
};

export function validateData(data) {
    if (ajv.validate(schema, data)) {
        return true;
    } else {
        log.error('Err', 'Something went wrong!');
        log.error('Err', ajv.errors);
        return false;
    }
}

export async function sendTransaction(data) {
    log.info('Sending transactions to the endpoint...');
    const endpoint = process.env.ENDPOINT + "/transactions/add/";

    const method = "POST"
    const headers = {
        'Content-type': 'application/x-www-form-urlencoded'
    }

    let dataChunk = _.chunk(data, process.env.BATCH_SIZE ? process.env.BATCH_SIZE : 5000);

    let i = 0;
    for (let dataSet of dataChunk) {
        i = i + dataSet.length;
        log.info(`Sending ${i} of ${data.length} objects`);

        for (let transaction of dataSet) {
            var transactionData = new FormData()
            transactionData.append("date", transaction.date)
            transactionData.append("name_station", transaction.name_station)
            transactionData.append("terminal", transaction.terminal)
            transactionData.append("operation_type", transaction.operation_type)
            transactionData.append("external_number", transaction.external_number)
            transactionData.append("internal_number", transaction.internal_number)
            transactionData.append("card_transaction_number", transaction.card_transaction_number)
            transactionData.append("former_purse", transaction.former_purse)
            transactionData.append("amount", transaction.amount)
            transactionData.append("purse", transaction.purse)
            transactionData.append("document_id", transaction.document_id)
            transactionData.append("fare", transaction.fare)
            transactionData.append("json_file", transaction.json_file)

            var params = new URLSearchParams(transactionData)

            await fetch(endpoint, {method: method, headers: headers, body: params})
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
}