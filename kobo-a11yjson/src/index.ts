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
	printResults: false,
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

	console.log("Constructing parking")
	const interfaceData = getInterfaceData(input, 'Parking/')
	const parkingInterface:a11y.Parking = constructParking(interfaceData)
	a11yResult.properties.accessibility.parking = parkingInterface	
	console.log(parkingInterface)

	//TODO: Change to dynamic code that doesn't rely on the count suffix not changing! See notes.
	const numberOfEntrances = parseValue(input, 'Entrances/count_002', 'int') as number
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

//Constructs multiple entrances based on amount parameter
function constructEntrances(input:KoboResult, amount:number){
	console.log("constructing entrances")
	let entrances:a11y.Entrance[] = []
	// For each entrance in the survey, get the relevant data, clean it and use it to construct an Entrance
	for (let i = 1; i <= amount; i ++){
		const interfaceData = getInterfaceData(input, 'Entrances/Entrance_00' + i + '/')
		const a11yEntrance:a11y.Entrance = constructEntrance(interfaceData)
		console.log(a11yEntrance)
		entrances.push(a11yEntrance)
	}
	return entrances	
}

function getInterfaceData(source:Object, nesting:string){
	console.log("Isolating with", nesting)
	const isolatedObject = utils.formIsolatedObject(source, nesting)
	console.log("isolated", isolatedObject)
	const cleanedObject = utils.cleanKeysOneLevel(isolatedObject)
	console.log("cleaned", cleanedObject)
	return cleanedObject
}

//Constructs an Entrance interface
function constructEntrance(entranceData:any){
	return {
		isMainEntrance: parseYesNo(entranceData, 'isMainEntrance'),
		name: entranceData['name'],
		isLevel: parseYesNo(entranceData, 'isLevel'),
		hasFixedRamp:  parseYesNo(entranceData, 'hasFixedRamp'),
		hasRemovableRamp:  parseYesNo(entranceData, 'hasRemovableRamp'),
		rampExplanation: entranceData['Ramp/Explanation'],
		hasElevator:  parseYesNo(entranceData, 'hasElevator'),
		elevatorExplanation: entranceData['ElevatorEquipmentId/Explanation'],
		stairs: parseYesNo(entranceData, 'hasStairs') ? constructStairs( getInterfaceData( entranceData, 'Stairs/') ) : undefined,
		door: parseYesNo(entranceData, 'hasDoor') === true ? constructDoor( getInterfaceData (entranceData, 'door/') ) 
			: parseYesNo(entranceData, 'hasDoor') === false ? null 
			: undefined,
		hasIntercom: parseYesNo(entranceData, 'hasIntercom')
	}
}

//Constructs a Door interface
function constructDoor(input:any){
	return {
		width: input['width'] ? {
			unit: 'cm',
			value: parseValue(input, 'width', 'int') as number
		}: undefined,
		isRevolving: parseYesNo(input, 'isRevolving'),
		isSliding: parseYesNo(input, 'isSliding'),
		isAutomaticOrAlwaysOpen: parseYesNo(input, 'isAutomaticOrAlwaysOpen'),
		isEasyToHoldOpen: parseYesNo(input, 'isEasyToHoldOpen'),
		hasErgonomicDoorHandle: parseYesNo(input, 'hasErgonomicDoorHandle'),
		DoorOpensToOutside: parseYesNo(input, 'DoorOpensToOutside'),
		turningSpaceInFront: input['turningSpaceInFront'] ? {
			unit: 'cm',
			value: parseValue(input, 'turningSpaceInFront', 'int') as number
		}: undefined,
	}
}

//Constructs a Stairs interface
function constructStairs(input:any){
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
		stairs: parseYesNo(input, 'Floors/Stairs') ? constructStairs( getInterfaceData( input, 'Stairs/') ) : undefined,
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