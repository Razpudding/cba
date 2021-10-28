import { Accessibility, PlaceInfo } from '@sozialhelden/a11yjson'
import { createReadStream, writeFile} from 'fs'
import csv from 'csv-parser'

const inputSrc = 'kobodata/Toegankelijkheidsscan_gebouwen_test.csv'
const indexOfChosenResponse = 10
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
	//console.log(results.length)
	let chosenItem:object = results[indexOfChosenResponse]
	//NOTE: this is just for testing purposes, empty fields could mean a field is not true in the data
	chosenItem = removeEmptyFields(chosenItem)
	console.log(chosenItem)
	let a11yObjects:PlaceInfo[] = [chosenItem].map(convertToA11y)
}

/**
* @todo for some reason ts wont allow me to type obj as object because then obj[prop]
* throws an error
*/
function convertToA11y(obj:any):PlaceInfo{
	for (const question in obj){
		convertQuestion(question, obj[question])
	}

	// let k: keyof typeof obj;
	// for (const [key, value] of Object.entries(obj)) {
	// 	convertQuestion(key, value)
	// }
	// for (const [key, value] of Object.entries(obj)) {
	//   console.log(`${key}: ${value}`);
	// }
	// for (const prop in obj){
	// 	convertQuestion(obj[prop])
	// }
	return {
		properties: {
			category: '',
		},
		geometry: {
			coordinates: [0,0],
			type: "Point",
		}
	}
}

function convertQuestion(key:string, value:string){
	// console.log(key)
	if (key.startsWith('PlaceInfo')){
		console.log(`${key}`)
	}
}

/**
 * Deletes properties from an object where the value for the prop is null/undefined/''
 * @param item an object to clean
 * @returns the input object without empty fields
 * @todo for some reason ts wont allow me to type item as object because then item[prop]
 * throws an error
 */
function removeEmptyFields(item:any):object{
	for (const prop in item){
		if (item[prop] == '' || item[prop] == null || item[prop] == undefined){
			delete item[prop]
		}
	}
	return item
}

//Structure of a11yjson object
/* A PlaceInfo object with other interfaces nested
{
  geometry: {
    type: 'Point',
    coordinates: [0, 0]
  },
  properties: {
    name: 'An inaccessible place in the middle of an ocean',
    accessibility: {
      accessibleWith: {
        wheelchair: false
      },
      hasInductionLoop: true,
      isQuiet: false,
      media: undefined,
      entrances: [
      {
        door: {
          doorOpensToOutside: true,
          hasErgonomicDoorHandle: false
        },
        hasFixedRamp: false
      }],  
    },
    category: "school"
  },
}











*/