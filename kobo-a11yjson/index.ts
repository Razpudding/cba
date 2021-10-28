import { Accessibility, PlaceInfo } from '@sozialhelden/a11yjson'
import { createReadStream, writeFile} from 'fs'
import csv from 'csv-parser'

const inputSrc:string = 'kobodata/Toegankelijkheidsscan_gebouwen_test.csv'
let results:object[] = []

loadSurveyData(inputSrc)

/**
 * Loads a csv sourcefile and pipes results to processResults
 * @param src path to the csv file to load
 * @returns nothing for now
 * @todo Remove side-effect and use promises instead
 * @todo check if type can be csvfile 🤔
 */
function loadSurveyData(src:string):void{
	createReadStream(src)
	  .pipe(csv())
	  .on('data', (data) => results.push(data))
	  .on('end', () => {
	  	processResults(results)
	  })
}

/**
 * Loads processes results and starts conversion to a11yjson
 * @param results survey results
 * @returns nothing for now
 */
function processResults(results:object[]){
	console.log(results.length)
	const lastItem:object = results.slice(-1)
	console.log(lastItem)
}