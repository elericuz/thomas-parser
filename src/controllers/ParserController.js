import log from "npmlog";
import fs from 'fs';
import lodash from 'lodash';
import * as model from "../models/model.js";
import {sendTransaction} from "../models/model.js";

const _ = lodash;

export async function get(file = null) {
    const jsonFile = file;
    let rawdata = fs.readFileSync(jsonFile);

    let transactions = [];
    let items = [];
    try {
        let transactions = JSON.parse(rawdata);
        items = _.first(transactions.results).items
    } catch (e) {
        log.warn(`Error while parsing file ${jsonFile}`);
        log.warn(e);
    }

    for (let item of items) {
        let dateString = item.fecha + " " + item.hora;
        let date = new Date(dateString)

        let transaction = {
            date: new Date(date.getTime()),
            name_station: _.toLower(Buffer.from(item.estacion, "utf-8").toString()),
            terminal: _.toLower(item.equipo),
            operation_type: _.toLower(item.tipo_operacion),
            external_number: _.toLower(item.nro_externo),
            internal_number: _.parseInt(item.nro_interno),
            card_transaction_number: _.parseInt(item.num_trx_tarjeta),
            former_purse: _.isNumber(item.saldo_anterior) ? _.toNumber(item.saldo_anterior) : 0,
            amount: _.toNumber(item.importe),
            purse: _.isNumber(item.saldo_actual) ? _.toNumber(item.saldo_actual) : 0,
            document_id: _.isEmpty(_.trim(item.dni)) ? "0" : _.trim(item.dni),
            fare: _.toLower(item.perfil)
        }

        if (model.validateData([transaction])
        ) {
            transactions.push(transaction)
            log.info("Validating " + transaction.document_id + " : " + transaction.internal_number)
        } else {
            log.warn("Error Validating " + transaction.document_id + " : " + transaction.internal_number)
        }
    }

    sendTransaction(transactions)

    return false;
}