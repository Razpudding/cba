import * as a11y from '@sozialhelden/a11yjson'
import { cloneDeep } from 'lodash';
import { createReadStream, writeFile} from 'fs'
import csv from 'csv-parser'
import { KoboResult, KoboKey, parseYesNo, parseValue, parseFloatUnit} from './lib/transformKoboToA11y'

const settings = {
	outputFileName: 'output/a11yjson',
	printResults: false,
	validate: true
}

const inputSrc = 'kobodata/Testformulier_A11yJSON_-_all_versions_-_False_-_2021-11-23-11-30-02.csv'
let results:KoboResult[] = []

loadSurveyData(inputSrc)

/**
 * Loads a csv sourcefile and pipes results to processResults
 * @param src path to the csv file to load
 * @returns nothing for now
 * @todo Remove side-effect and use promises instead
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
	console.log(results[1])
	let placeInfoStarter:a11y.PlaceInfo = {
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
	const a11yResults:a11y.PlaceInfo[] = results.map((result, i) => {
		if (result['Survey/Survey_Type'] === 'basic'){
			console.log("Processing basic survey", i)
			return transformToA11y(result, placeInfoStarter)
		} else if (result['Survey/Survey_Type'] === 'extended'){
			console.log("Processing extended survey", i)
			return transformToA11y(result, placeInfoStarter)
		}
		else {
			console.log("Error: survey type not valid", result['Survey/Survey_Type'])
			return placeInfoStarter
		}
	})

	if (settings.validate){
		//Run a11yjson validation on each of the produced results
		a11yResults.forEach((result, i) => validateAgainstSchema(result, i, a11y.PlaceInfoSchema.newContext()))
	}
	
	if (settings.printResults) writeDataFile(a11yResults)
	// console.log(a11yResults)
}

//Transform a KoboResult to an a11y PlaceInfo interface with nested data
function transformToA11y(input:KoboResult, base:a11y.PlaceInfo){
	let a11yResult = cloneDeep(base)
	const parkingInterface:a11y.Parking = constructParking(input)
	a11yResult.properties.accessibility!.parking = parkingInterface

	const entrancesInterface:a11y.Entrance[] = [constructEntrance(input)]
	console.log(entrancesInterface)
	a11yResult.properties.accessibility!.entrances = entrancesInterface
	return a11yResult
}

//Constructs a Parking interface
function constructParking(input:KoboResult){
	return {
		count: notEmpty(input['Parking/count']) ? parseInt(input['Parking/count']): undefined,
		forWheelchairUsers: parseYesNo(input, 'Parking/forWheelchairUsers') ? {
			count: parseValue(input, 'Parking/WheelchairParking/count_001', 'int') as number,
			//location
			distanceToEntrance: notEmpty(input['Parking/WheelchairParking/maxVehicleHeight']) ? {
				unit: 'meter',
				value: parseValue(input, 'Parking/WheelchairParking/count_001', 'int') as number
			}: undefined,
			hasDedicatedSignage: parseYesNo(input, 'Parking/WheelchairParking/hasDedicatedSignage'),
			length: notEmpty(input['Parking/WheelchairParking/length']) ? {
				unit: 'meter',
				value: parseValue(input, 'Parking/WheelchairParking/length', 'int') as number
			}: undefined,
			width: notEmpty(input['Parking/WheelchairParking/width']) ? {
				unit: 'meter',
				value: parseInt(input['Parking/WheelchairParking/width'], 10)
			}: undefined,
			orientation: <string>input['Parking/WheelchairParking/type'],
			isLocatedInside: parseYesNo(input, 'Parking/WheelchairParking/isLocatedInside'),
			maxVehicleHeight: notEmpty(input['Parking/WheelchairParking/maxVehicleHeight']) ? {
				unit: 'cm',
				value: parseValue(input, 'Parking/WheelchairParking/maxVehicleHeight', 'int') as number
			}: undefined,
			neededParkingPermits: notEmpty(input['Parking/WheelchairParking/neededParkingPermits']) ? 
				input['Parking/WheelchairParking/neededParkingPermits'] : undefined,
			paymentBySpace: parseYesNo(input, 'Parking/WheelchairParking/paymentBySpace'),
			paymentByZone: parseYesNo(input, 'Parking/WheelchairParking/paymentByZone'),
		} : null,
		kissAndRide: parseYesNo(input, 'Parking/KissAndRide'),
		notes: notEmpty(input['Parking/notes']) ? input['Parking/notes'] : undefined,
	}
}

//Constructs an Entrance interface
function constructEntrance(input:KoboResult){
	return {
		// count: notEmpty(input['Entrances/count_002']) ? parseInt(input['Entrances/count_002']): undefined,
		isMainEntrance: parseYesNo(input, 'Entrances/isMainEntrance'),
		name: notEmpty(input['Entrances/name']) ? input['Entrances/name'] : undefined,
		isLevel: parseYesNo(input, 'Entrances/isLevel_001'),
		hasFixedRamp:  parseYesNo(input, 'Entrances/hasFixedRamp'),
		hasRemovableRamp:  parseYesNo(input, 'Entrances/hasRemovableRamp'),
		rampExplanation: notEmpty(input['Entrances/Ramp/Explanation_001']) ? input['Entrances/Ramp/Explanation_001'] : undefined,
		hasElevator:  parseYesNo(input, 'Entrances/hasElevator'),
		elevatorExplanation: notEmpty(input['Entrances/ElevatorEquipmentId/Explanation_002']) ? input['Entrances/ElevatorEquipmentId/Explanation_002'] : undefined,
		stairs: parseYesNo(input, 'Entrances/hasStairs') ? constructStairs(input, 'Entrances/Stairs/') : undefined,
		door: parseYesNo(input, 'Entrances/hasDoor') ? constructDoor(input, 'Entrances/door/') : null,
		hasIntercom: parseYesNo(input, 'Entrances/hasIntercom')
	}
}

//Constructs a Door interface
function constructDoor(input:KoboResult, nesting:string){
	return {
		width: notEmpty(input[nesting + 'width_001']) ? {
			unit: 'cm',
			value: parseValue(input, nesting + 'width_001', 'int') as number
		}: undefined,
		isRevolving: parseYesNo(input, nesting + 'isRevolving'),
		isSliding: parseYesNo(input, nesting + 'isSliding'),
		isAutomaticOrAlwaysOpen: parseYesNo(input, nesting + 'isAutomaticOrAlwaysOpen'),
		isEasyToHoldOpen: parseYesNo(input, nesting + 'isEasyToHoldOpen'),
		hasErgonomicDoorHandle: parseYesNo(input, nesting + 'hasErgonomicDoorHandle'),
		DoorOpensToOutside: parseYesNo(input, nesting + 'DoorOpensToOutside'),
		turningSpaceInFront: notEmpty(input[nesting + 'turningSpaceInFront']) ? {
			unit: 'cm',
			value: parseValue(input, nesting + 'turningSpaceInFront', 'int') as number
		}: undefined,
	}
}

//Constructs a Stairs interface
function constructStairs(input:KoboResult, nesting:string){
	return {
		// count: 8,
		// explanation: notEmpty(input['Entrances/Stairs/Explanation_003']) ? input['Entrances/Stairs/Explanation_003'] : undefined,
	}
}

//Checks if the produced data is valid for a certain a11y schema
//Logs any validation errors
function validateAgainstSchema(input:object, index:number, validationContext:any){
	validationContext.validate(input)
	if (!validationContext.isValid()) {
	  const errors = validationContext.validationErrors();
	  // `errors` is a JSON object with detailled validation infos about each field in the input object.
	  console.log("Error(s) for result number", index, errors);
	}
}

//Helper function to check if a value isn't an empty string
//TODO move this to a helper module
function notEmpty(value:string){
	return value !== ''
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

//Write the data to a json file
function writeDataFile(data:object[], fileIndex = 0)
{
	writeFile(settings.outputFileName + "_" + fileIndex +".json",
				JSON.stringify(data, null, 4),
				{ encoding:'utf8', flag:'wx' },
				function (err) {
	    //Check if filename already exists, if it does, increase the number at the end by 1
	    if (err && err.code == "EEXIST") {	
	    	writeDataFile(data, ++fileIndex)
	    } else if(err){
	        return console.log(err)
	    } else {
	    	console.log("The file was saved!", (settings.outputFileName +"_"+ fileIndex +".json"))
	    }
	})
}