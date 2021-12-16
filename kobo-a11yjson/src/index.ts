//Import utility packages
import { cloneDeep, isEmpty } from 'lodash'
import { createReadStream, writeFile } from 'fs'
import csv from 'csv-parser'
import * as utils from './utils'
//Import typescript packages
import * as a11y from '@sozialhelden/a11yjson'
import { Accessibility } from '@sozialhelden/a11yjson'
import { KoboResult, parseYesNo, parseNumber} from './transformKoboToA11y'
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
interface LanguageTags {
  [key: string]: string;
}

const languageTags:LanguageTags = {
	'Dutch': 'nl',
	'English': 'en',
}
let currentLanguage:string

const inputSrc = 'kobodata/Testformulier_A11yJSON_-_latest_version_-_False_-_2021-12-14-12-00-02.csv'
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
	console.log('ater clean', results[1])
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

	//TODO: finish this
	const cleanedA11yResults = a11yResults

	if (settings.printResults){
		writeDataFile(cleanedA11yResults)
	} 
	// console.log(a11yResults)
}

//Transform a KoboResult to an a11y PlaceInfo interface with nested data
function transformToA11y(input:KoboResult, base:PlaceInfoExtended){
	let a11yResult = cloneDeep(base)
	currentLanguage = languageTags[input['Survey/Language']] || ''
	if (currentLanguage === '') { console.log("ERROR: invalid survey language")} 
	// const accessibilityInterface = constructAccessibility(input)
	// a11yResult.properties.accessibility = accessibilityInterface

	const parkingData = getInterfaceData(input, 'Parking/')
	const parkingInterface = constructParking(parkingData)
	a11yResult.properties.accessibility.parking = parkingInterface

	//Note: The numberOfEntrances is parsed from the survey. If it was undefined it will be 0.
	//			If the survey type is basic, the number is set to 1. This is a business rule
	let numberOfEntrances = parseNumber(input['Entrances/count_002']) || 0
	if (input['Survey/Survey_Type'] === 'basic') { numberOfEntrances = 1 }
	const entrancesInterface:a11y.Entrance[] = constructEntrances(input, numberOfEntrances)
	// console.log(entrancesInterface)
	a11yResult.properties.accessibility.entrances = entrancesInterface

	const groundData = getInterfaceData(input, 'Ground/')
	console.log("GroundData", groundData)
	const groundInterface:a11y.Ground = constructGround(groundData)
	// console.log(groundInterface)
	a11yResult.properties.accessibility.ground = groundInterface

	if (parseYesNo(input['Floors/HasFloors'])){
		const floorData = getInterfaceData(input, 'Floors/')
		const floorInterface:Floor[] = [constructFloor(floorData)]
		a11yResult.properties.accessibility.floors = floorInterface
	}
	return a11yResult
}

//Returns a clean object with only properties starting with the target string
function getInterfaceData(source:Object, target:string){
	const isolatedObject = utils.formIsolatedObject(source, target)
	return utils.cleanKeysOneLevel(isolatedObject) 
}

//Constructs a Parking interface
function constructAccessibility(input:KoboResult){
	return {
	}
}

//Constructs a Parking interface
function constructParking(input:KoboResult){
	let result = {
		// count: parseValue(input, 'count', 'int') as number,
		count: parseNumber(input['count']),
		forWheelchairUsers: parseYesNo(input['forWheelchairUsers']) ? {
			count: parseNumber(input['WheelchairParking/count']),
			//location
			distanceToEntrance: input['WheelchairParking/distance'] ? {
				unit: 'meter',
				value: parseNumber(input['WheelchairParking/distance']) as number
			}: undefined,
			hasDedicatedSignage: parseYesNo(input['WheelchairParking/hasDedicatedSignage']),
			length: input['WheelchairParking/length'] ? {
				unit: 'meter',
				value: parseNumber(input['WheelchairParking/length']) as number
			}: undefined,
			width: input['WheelchairParking/width'] ? {
				unit: 'meter',
				value: parseNumber(input['WheelchairParking/width']) as number
			}: undefined,
			orientation: input['WheelchairParking/type'] ?
				{ [currentLanguage]: input['WheelchairParking/type'] }
				: undefined,
			isLocatedInside: parseYesNo(input['WheelchairParking/isLocatedInside']),
			maxVehicleHeight: input['WheelchairParking/maxVehicleHeight'] ? {
				unit: 'cm',
				value: parseNumber(input['WheelchairParking/maxVehicleHeight']) as number
			}: undefined,
			neededParkingPermits: input['WheelchairParking/neededParkingPermits'] ? 
				// [input['WheelchairParking/neededParkingPermits']]
				[
					{ [currentLanguage]: input['WheelchairParking/neededParkingPermits']}
				]
				: undefined,
			paymentBySpace: parseYesNo(input['WheelchairParking/paymentBySpace']),
			paymentByZone: parseYesNo(input['WheelchairParking/paymentByZone']),
		} : null,
		kissAndRide: parseYesNo(input['KissAndRide']),
		notes: input['notes'] ? { [currentLanguage]: input['notes'] } : undefined,
	}
	return result
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

//Constructs an Entrance interface
function constructEntrance(entranceData:any){
	let result = {
		isMainEntrance: parseYesNo(entranceData['isMainEntrance']),
		name: entranceData['name'] ?
			{ [currentLanguage]: entranceData['name'] }
			: undefined,
		isLevel: parseYesNo(entranceData['isLevel']),
		hasFixedRamp:  parseYesNo(entranceData['hasFixedRamp']),
		hasRemovableRamp:  parseYesNo(entranceData['hasRemovableRamp']),
		rampExplanation: entranceData['Ramp/Explanation'] ?
			{ [currentLanguage]: entranceData['Ramp/Explanation'] }
			: undefined,
		hasElevator:  parseYesNo(entranceData['hasElevator']),
		elevatorExplanation: entranceData['ElevatorEquipmentId/Explanation'] ?
			{ [currentLanguage]: entranceData['ElevatorEquipmentId/Explanation'] }
			: undefined,
		stairs: parseYesNo(entranceData['hasStairs']) ? constructStairs( getInterfaceData( entranceData, 'Stairs/') ) : undefined,
		door: parseYesNo(entranceData['hasDoor']) === true ? constructDoor( getInterfaceData (entranceData, 'door/') ) 
			: parseYesNo(entranceData['hasDoor']) === false ? null 
			: undefined,
		hasIntercom: parseYesNo(entranceData['hasIntercom'])
	}
	return result
}

//Constructs a Door interface
function constructDoor(input:any){
	console.log("doorData", input)
	let result = {
		width: input['width'] ? {
			unit: 'cm',
			value: parseNumber(input['width']) as number
		}: undefined,
		isRevolving: parseYesNo(input['isRevolving']),
		isSliding: parseYesNo(input['isSliding']),
		isAutomaticOrAlwaysOpen: parseYesNo(input['isAutomaticOrAlwaysOpen']),
		isEasyToHoldOpen: parseYesNo(input['isEasyToHoldOpen']),
		hasErgonomicDoorHandle: parseYesNo(input['hasErgonomicDoorHandle']),
		DoorOpensToOutside: parseYesNo(input['DoorOpensToOutside']),
		turningSpaceInFront: input['turningSpaceInFront'] ? {
			unit: 'cm',
			value: parseNumber(input['turningSpaceInFront']) as number
		}: undefined,
	}
	return result
}

//Constructs a Stairs interface
function constructStairs(input:any){
	let result = {
		// count: 8,
		// explanation: notEmpty(input['Entrances/Stairs/Explanation']) ? input['Entrances/Stairs/Explanation'] : undefined,
	}
	return result
}

//Constructs a Ground interface
function constructGround(input:KoboResult){
	let result = {
		distanceToDroppedCurb: input['distanceToDroppedCurb'] ? {
			unit: 'meter',
			value: parseNumber(input['distanceToDroppedCurb']) as number
		}: undefined,
		evenPavement: parseYesNo(input['evenPavement']),
		isLevel: parseYesNo(input['isLevel']),
		sidewalkConditions: parseNumber(input['sidewalkConditions']),
		slopeAngle: parseNumber(input['slopeAngle']),
		turningSpace: input['turningSpace'] ? {
			unit: 'cm',
			value: parseNumber(input['turningSpace']) as number,
		} : undefined,
		notes: input['notes'] ? { [currentLanguage]: input['notes']} : undefined,
	}
	return result
}

//Constructs a Floor interface
function constructFloor(input:KoboResult){
	// console.log("constructing floor")
	// console.log(input)
	let result = {
		reachableByElevator: parseYesNo(input['elevator']),
		elevatorExplanation: input['ElevatorEquipmentId/Explanation'] ?
			{ [currentLanguage]: input['ElevatorEquipmentId/Explanation']}
			: undefined,
		reachableByEscalator: parseYesNo(input['escalator']),
		escalatorExplanation: input['EscalatorEquipmentID/Explanation'] ?
			{ [currentLanguage]: input['EscalatorEquipmentID/Explanation'] }
			: undefined,
		hasFixedRamp: parseYesNo(input['fixedRamp']),
		rampExplanation: input['Ramp/Explanation'] ?
			{ [currentLanguage]: input['Ramp/Explanation']}
			: undefined,
		stairs: parseYesNo(input['Stairs']) ? constructStairs( getInterfaceData( input, 'Stairs/') ) : undefined,
		floorExplanation: input['notes'] ?
			{ [currentLanguage]: input['notes'] }
			: undefined,
		//TODO: Process the floors as separate objects or as one, either way the count needs to be included somewhere
		// 'Floors/count': string,
		//TODO: Same goes for the stairs info
		// 'Floors/Stairs': YesNoResult,
		// 'Floors/Stairs/Explanation': string,
	}
	return result
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