import log from "npmlog";
import fs from 'fs';
import lodash from 'lodash';
import moment from 'moment';
import tz from 'moment-timezone';
import * as model from "../models/model.js";
import {sendTransaction} from "../models/model.js";
import path from "path";

const _ = lodash;

export async function get(file = null) {
    const jsonFile = file;

    if (!fs.existsSync(jsonFile)) {
        return false;
    }

    log.info("Crawling...");
    log.info("Parsing new data");

    let rawdata = fs.readFileSync(jsonFile);

    let transactions = [];
    let items = [];
    try {
        let transactions = JSON.parse(rawdata);
        items = _.first(transactions.results).items
    } catch (e) {
        log.warn(`Error while parsing file ${jsonFile}`);
        log.warn(e);
        return false;
    }

    for (let item of items) {
        let dateString = item.fecha + " " + item.hora;

        let former_purse = 0
        if (/(^[\d]*)((\.)([\d]){1,2})?$/.test(item.saldo_anterior)) {
            former_purse = _.toNumber(item.saldo_anterior)
        }

        let purse = 0
        if (/(^[\d]*)((\.)([\d]){1,2})?$/.test(item.saldo_actual)) {
            purse = _.toNumber(item.saldo_actual)
        }

        let transaction = {
            date: moment(new Date(dateString)).add(process.env.ADD_HOURS, 'hours').tz("America/Lima").format(),
            name_station: _.toLower(Buffer.from(item.estacion, "utf-8").toString()),
            terminal: _.toLower(item.equipo),
            operation_type: _.toLower(item.tipo_operacion),
            external_number: _.toLower(item.nro_externo),
            internal_number: _.parseInt(item.nro_interno),
            card_transaction_number: _.toNumber(item.num_trx_tarjeta),
            former_purse: former_purse,
            amount: _.toNumber(item.importe),
            purse: purse,
            document_id: _.isEmpty(_.trim(item.dni)) ? "0" : _.trim(item.dni),
            fare: _.toLower(item.perfil),
            json_file: path.basename(file)
        }

        if (model.validateData([transaction])
        ) {
            transactions.push(transaction)
            log.info("Validating " + transaction.document_id + " : " + transaction.internal_number)
        } else {
            log.warn("Error Validating " + transaction.document_id + " : " + transaction.internal_number)
        }
    }
    log.info("File being processed: " + path.basename(file));

    sendTransaction(transactions)

    return false;
}