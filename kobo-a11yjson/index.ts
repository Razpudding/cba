import { Accessibility, PlaceInfo } from '@sozialhelden/a11yjson'
import { createReadStream, writeFile} from 'fs'
import csv from 'csv-parser'
import { KoboResult, KoboKey, parseYesNo, parseValue, parseFloatUnit } from './lib/transformKoboToA11y'

const inputSrc = 'kobodata/Testformulier_A11yJSON_-_all_versions_-_False_-_2021-11-23-11-30-02.csv'
//'kobodata/Toegankelijkheidsscan_gebouwen_test.csv'
const indexOfChosenResponse = 1
let results:KoboResult[] = []

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
	  .pipe(csv({ separator: ';' }))
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
function processResults(results:KoboResult[]){
	//console.log(results.length)
	let chosenItem = results[indexOfChosenResponse]
	//NOTE: this is just for testing purposes, empty fields could mean a field is not true in the data
	// let CBAItem:KoboResult = removeEmptyFields(chosenItem)
	console.log(chosenItem)
	let placeInfoStarter:PlaceInfo = {
		formatVersion: '11.0.0',
		geometry: {
			coordinates: [0,0],
			type: "Point",
		},
		properties: {
			category: '',
			accessibility: {}

		}
	}
	if (chosenItem['Survey/Survey_Type'] === 'basic'){
		return transformBasicToA11y(chosenItem, placeInfoStarter)
	} else {
		return transformCompleteToA11y(chosenItem, placeInfoStarter)
	}
	

	// let a11yObjects:PlaceInfo[] = [chosenItem].map(convertToA11y)
}

function transformBasicToA11y(input:KoboResult, base:PlaceInfo){
	return base
}

function transformCompleteToA11y(input:KoboResult, base:PlaceInfo){
	let result = base
	//TODO: Construct each interface separately
	result.properties.accessibility!.parking = constructParking(input)
	// result.properties.accessibility!.ground!.distanceToDroppedCurb = input['PlaceInfo/Explanation']
	console.log("current result", result)
	return result
}

function constructParking(input:KoboResult){
	return {
		count: parseInt(input['Parking/count'], 10),
		forWheelchairUsers: parseYesNo(input, 'Parking/forWheelchairUsers') ? {
			count: parseValue(input, 'Parking/WheelchairParking/count_001', 'int') as number,
			//location
			// distanceToEntrance: {
			// 	unit: 'mt',
			// 	value: parseFloatUnit(input, 'Parking/WheelchairParking/count_001', 'mt') as number
			// },

			//   'Parking/WheelchairParking/count_001': '12',
			//   'Parking/WheelchairParking/location': '',
			//   'Parking/WheelchairParking/distance': '22',
			//   'Parking/WheelchairParking/hasDedicatedSignage': 'true',
			//   'Parking/WheelchairParking/length': '4',
			//   'Parking/WheelchairParking/width': '',
			//   'Parking/WheelchairParking/type': 'parking_at_right_angles',
			//   'Parking/WheelchairParking/isLocatedInside': 'true',
			//   'Parking/WheelchairParking/maxVehicleHeight': '123',
			//   'Parking/WheelchairParking/neededParkingPermits': '',
			//   'Parking/WheelchairParking/paymentBySpace': 'true',
			//   'Parking/WheelchairParking/paymentByZone': 'false',
		} : null
	}
	// 'Parking/count': '123',
	//   'Parking/forWheelchairUsers': 'true',
	//   'Parking/WheelchairParking/count_001': '12',
	//   'Parking/WheelchairParking/location': '',
	//   'Parking/WheelchairParking/distance': '22',
	//   'Parking/WheelchairParking/hasDedicatedSignage': 'true',
	//   'Parking/WheelchairParking/length': '4',
	//   'Parking/WheelchairParking/width': '',
	//   'Parking/WheelchairParking/type': 'parking_at_right_angles',
	//   'Parking/WheelchairParking/isLocatedInside': 'true',
	//   'Parking/WheelchairParking/maxVehicleHeight': '123',
	//   'Parking/WheelchairParking/neededParkingPermits': '',
	//   'Parking/WheelchairParking/paymentBySpace': 'true',
	//   'Parking/WheelchairParking/paymentByZone': 'false',
	//   'Parking/KissAndRide': 'true',
	//   'Parking/notes': '',

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
		},

	}
}

//A function that will call the right transformation logic for each question
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
function removeEmptyFields(item:any):KoboResult{
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