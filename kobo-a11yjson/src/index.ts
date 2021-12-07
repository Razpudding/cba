//Import utility packages
import { cloneDeep } from 'lodash'
import { createReadStream, writeFile } from 'fs'
import csv from 'csv-parser'
import * as utils from './utils'
//Import typescript packages
import * as a11y from '@sozialhelden/a11yjson'
import { Accessibility } from '@sozialhelden/a11yjson'
import { KoboResult, KoboKey, parseYesNo, parseValue, parseFloatUnit} from './transformKoboToA11y'
import { Floor } from '../types/Floor'

const settings = {
	outputFileName: 'output/a11yjson',
	printResults: true,
	validate: true
}

//I'm extending the some imported interfaces locally so I can safely ammend them
interface PlaceInfoExtended extends a11y.PlaceInfo {
	properties:PlacePropertiesExtended,
}
interface PlacePropertiesExtended extends a11y.PlaceProperties{
  accessibility: AccessibilityExtended
}
interface AccessibilityExtended extends a11y.Accessibility{
	floors?: Floor[] | undefined
}

const inputSrc = 'kobodata/Testformulier_A11yJSON_-_all_versions_-_False_-_2021-12-07-09-28-39.csv'
let results:KoboResult[] = []

loadSurveyData(inputSrc)

// Loads a csv sourcefile and pipes results to processResults
function loadSurveyData(src:string):void{
	createReadStream(src)
	  .pipe(csv({ separator: ';' }))
	  .on('data', (data) => results.push(data))
	  .on('end', () => {
	  	processResults(results)
	  })
}

//Loads processes results and starts conversion to a11yjson
function processResults(results:KoboResult[]){
	// results = results.map(res => utils.cleanKeys(res) as KoboResult)
	results = results.map(res => utils.cleanValues(res) as KoboResult)
	console.log('ater clean', results[0])
	let placeInfoStarter:PlaceInfoExtended = {
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
	const a11yResults:PlaceInfoExtended[] = results.map((result, i) => {
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
function transformToA11y(input:KoboResult, base:PlaceInfoExtended){
	let a11yResult = cloneDeep(base)
	
	// const accessibilityInterface = constructAccessibility(input)
	// a11yResult.properties.accessibility = accessibilityInterface

	const parkingInterface:a11y.Parking = constructParking(input)
	a11yResult.properties.accessibility.parking = parkingInterface

	// const numberOfEntrances = parseValue(input, 'Entrances/count', 'int') as number
	const numberOfEntrances = 6
	//TODO: Test with mount 6
	const entrancesInterface:a11y.Entrance[] = constructEntrances(input, numberOfEntrances)
	// console.log(entrancesInterface)
	a11yResult.properties.accessibility.entrances = entrancesInterface

	const groundInterface:a11y.Ground = constructGround(input)
	// console.log(groundInterface)
	a11yResult.properties.accessibility.ground = groundInterface

	if (parseYesNo(input, 'Floors/HasFloors')){
		const floorInterface:Floor[] = [constructFloor(input)]
		a11yResult.properties.accessibility.floors = floorInterface
	}
	return a11yResult
}

//Constructs a Parking interface
function constructAccessibility(input:KoboResult){
	return {
	}
}

//Constructs a Parking interface
function constructParking(input:KoboResult){
	return {
		count: parseValue(input, 'Parking/count', 'int') as number,
		forWheelchairUsers: parseYesNo(input, 'Parking/forWheelchairUsers') ? {
			count: parseValue(input, 'Parking/WheelchairParking/count', 'int') as number,
			//location
			distanceToEntrance: input['Parking/WheelchairParking/distance'] ? {
				unit: 'meter',
				value: parseValue(input, 'Parking/WheelchairParking/distance', 'int') as number
			}: undefined,
			hasDedicatedSignage: parseYesNo(input, 'Parking/WheelchairParking/hasDedicatedSignage'),
			length: input['Parking/WheelchairParking/length'] ? {
				unit: 'meter',
				value: parseValue(input, 'Parking/WheelchairParking/length', 'int') as number
			}: undefined,
			width: input['Parking/WheelchairParking/width'] ? {
				unit: 'meter',
				value: parseValue(input, 'Parking/WheelchairParking/width', 'int') as number
			}: undefined,
			orientation: input['Parking/WheelchairParking/type'],
			isLocatedInside: parseYesNo(input, 'Parking/WheelchairParking/isLocatedInside'),
			maxVehicleHeight: input['Parking/WheelchairParking/maxVehicleHeight'] ? {
				unit: 'cm',
				value: parseValue(input, 'Parking/WheelchairParking/maxVehicleHeight', 'int') as number
			}: undefined,
			neededParkingPermits: input['Parking/WheelchairParking/neededParkingPermits'] ? 
				[input['Parking/WheelchairParking/neededParkingPermits']
				// {'en': input['Parking/WheelchairParking/neededParkingPermits']}
				] 
				: undefined,
			paymentBySpace: parseYesNo(input, 'Parking/WheelchairParking/paymentBySpace'),
			paymentByZone: parseYesNo(input, 'Parking/WheelchairParking/paymentByZone'),
		} : null,
		kissAndRide: parseYesNo(input, 'Parking/KissAndRide'),
		notes: input['Parking/notes'] ? input['Parking/notes'] : undefined,
	}
}

function constructEntrances(input:KoboResult, amount:number){
	let entrances:a11y.Entrance[] = []

	// Have a loop for either the number of entrances entered
	for (let i = 1; i <= amount; i ++){
		const cleanedResult = utils.cleanKeysStartingWith(input, 'Entrance_00'+i)
		// Pass nesting '/Entrance_00'+index to constructEntrance in loop
		entrances.push(constructEntrance(cleanedResult, 'Entrances/Entrance_00' + i))
	}
	return entrances	
}

//Constructs an Entrance interface
function constructEntrance(input:KoboResult, nesting:string){
	//TODO: The construct function should call the clean function so duplicate fields can be found
	return {
		isMainEntrance: parseYesNo(input, nesting + '/isMainEntrance'),
		name: input[nesting + '/name'],
		isLevel: parseYesNo(input, nesting + '/isLevel'),
		hasFixedRamp:  parseYesNo(input, nesting + '/hasFixedRamp'),
		hasRemovableRamp:  parseYesNo(input, nesting + '/hasRemovableRamp'),
		rampExplanation: input[nesting + '/Ramp/Explanation'],
		hasElevator:  parseYesNo(input, nesting + '/hasElevator'),
		elevatorExplanation: input[nesting + '/ElevatorEquipmentId/Explanation'],
		stairs: parseYesNo(input, nesting + '/hasStairs') ? constructStairs(input, nesting + '/Stairs/') : undefined,
		door: parseYesNo(input, nesting + '/hasDoor') === true ? constructDoor(input, nesting + '/door/') 
			: parseYesNo(input, nesting + '/hasDoor') === false ? null 
			: undefined,
		hasIntercom: parseYesNo(input, nesting + '/hasIntercom')
	}
}

//Constructs a Door interface
function constructDoor(input:KoboResult, nesting:string){
	return {
		width: input[nesting + 'width'] ? {
			unit: 'cm',
			value: parseValue(input, nesting + 'width', 'int') as number
		}: undefined,
		isRevolving: parseYesNo(input, nesting + 'isRevolving'),
		isSliding: parseYesNo(input, nesting + 'isSliding'),
		isAutomaticOrAlwaysOpen: parseYesNo(input, nesting + 'isAutomaticOrAlwaysOpen'),
		isEasyToHoldOpen: parseYesNo(input, nesting + 'isEasyToHoldOpen'),
		hasErgonomicDoorHandle: parseYesNo(input, nesting + 'hasErgonomicDoorHandle'),
		DoorOpensToOutside: parseYesNo(input, nesting + 'DoorOpensToOutside'),
		turningSpaceInFront: input[nesting + 'turningSpaceInFront'] ? {
			unit: 'cm',
			value: parseValue(input, nesting + 'turningSpaceInFront', 'int') as number
		}: undefined,
	}
}

//Constructs a Stairs interface
function constructStairs(input:KoboResult, nesting:string){
	return {
		// count: 8,
		// explanation: notEmpty(input['Entrances/Stairs/Explanation']) ? input['Entrances/Stairs/Explanation'] : undefined,
	}
}

//Constructs a Ground interface
function constructGround(input:KoboResult){
	return {
		distanceToDroppedCurb: input['Ground/distanceToDroppedCurb'] ? {
			unit: 'meter',
			value: parseValue(input, 'Ground/distanceToDroppedCurb', 'int') as number
		}: undefined,
		evenPavement: parseYesNo(input, 'Ground/evenPavement'),
		isLevel: parseYesNo(input, 'Ground/isLevel'),
		sidewalkConditions: parseValue(input, 'Ground/sidewalkConditions', 'int') as number,
		slopeAngle: parseValue(input, 'Ground/slopeAngle', 'int') as number,
		turningSpace: input['Ground/turningSpace'] ? {
			unit: 'cm',
			value: parseValue(input, 'Ground/turningSpace', 'int') as number
		} : undefined,
		notes: input['Parking/notes'],
	}
}

//Constructs a Floor interface
function constructFloor(input:KoboResult){
	return {
		reachableByElevator: parseYesNo(input, 'Floors/elevator'),
		elevatorExplanation: input['Floors/ElevatorEquipmentId/Explanation'],
		reachableByEscalator: parseYesNo(input, 'Floors/escalator'),
		escalatorExplanation: input['Floors/EscalatorEquipmentID/Explanation'],
		hasFixedRamp: parseYesNo(input, 'Floors/fixedRamp'),
		rampExplanation: input['Floors/Ramp/Explanation'],
		stairs: parseYesNo(input, 'Floors/Stairs') ? constructStairs(input, 'Floors/Stairs') : undefined,
		floorExplanation: input['Floors/notes'],
		//TODO: Process the floors as separate objects or as one, either way the count needs to be included somewhere
		// 'Floors/count': string,
		//TODO: Same goes for the stairs info
		// 'Floors/Stairs': YesNoResult,
		// 'Floors/Stairs/Explanation': string,
	}
}

//Checks if the produced data is valid for a certain a11y schema
//Logs any validation errors
function validateAgainstSchema(input:object, index:number, validationContext:any){
	validationContext.validate(input)
	if (!validationContext.isValid()) {
	  let errors = validationContext.validationErrors()
	  errors = errors.filter( (e:any) => e.type !== "keyNotInSchema")
	  // `errors` is a JSON object with detailled validation infos about each field in the input object.
	  console.log("Error(s) for result number", index, errors);
	}
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