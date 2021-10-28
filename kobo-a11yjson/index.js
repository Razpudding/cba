"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const csv_parser_1 = __importDefault(require("csv-parser"));
const inputSrc = 'kobodata/Toegankelijkheidsscan_gebouwen_test.csv';
let results = [];
loadSurveyData(inputSrc);
/**
 * Loads a csv sourcefile and pipes results to processResults
 * @param src path to the csv file to load
 * @returns nothing for now
 * @todo Remove side-effect and use promises instead
 * @todo check if type can be csvfile 🤔
 */
function loadSurveyData(src) {
    (0, fs_1.createReadStream)(src)
        .pipe((0, csv_parser_1.default)())
        .on('data', (data) => results.push(data))
        .on('end', () => {
        processResults(results);
    });
}
/**
 * Loads processes results and starts conversion to a11yjson
 * @param results survey results
 * @returns nothing for now
 */
function processResults(results) {
    console.log(results.length);
    const lastItem = results.slice(-1);
    console.log(lastItem);
}
