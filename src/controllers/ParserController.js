import log from "npmlog";
import fs from 'fs';
import lodash from 'lodash';
import * as model from "../models/model.js";
import {sendTransaction} from "../models/model.js";

const _ = lodash;

export async function get(file = null) {

    const jsonDirPath = process.cwd();
    const jsonFile = jsonDirPath + '/' + file;
    let rawdata = fs.readFileSync(jsonFile);

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
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;

        let transaction = {
            date: new Date(date.getTime() - userTimezoneOffset),
            name_station: _.toLower(Buffer.from(item.station_name, "utf-8").toString()),
            reference_id: escape(item.reference_id),
            operation_type: escape(_.toLower(item.operation_type)),
            sw_serial_number: escape(item.sw_serial_number),
            media_serial_number: escape(item.media_serial_number),
            amount: _.toNumber(item.amount),
            purse: _.toNumber(item.pd_purse),
            fare: escape(_.toLower(item.fare_name))
        }

        if (model.validateData([transaction])) {
            sendTransaction([transaction])
        }

        return false;
    }

    console.log(jsonFile);
    return false;
}