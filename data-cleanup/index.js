import { promises } from 'fs' //.promises
import csv from 'neat-csv'
import a11y from '@sozialhelden/a11yjson'

const fs = promises

//This settigns object controls the global settings for this programme
const settings = {
	inputFileName: 'input/CBA2016A11y.json',
	outputFileName: 'output/CBA2016_cleaned',
	categoriesFileName: 'input/categories.csv',
	wheelchairFileName: 'input/wheelchair.csv',
	wheelchairToiletFileName: 'input/wheelchairToilet.csv',
	addFields: true,
	printData: true,
	selection: false,
	validation: false,
	dedupingLocation: false,
}

main()
// Main run loop
async function main(){
	const inputDataFile = await fs.readFile(settings.inputFileName, {encoding: 'utf-8'})
	let inputData = JSON.parse(inputDataFile)
	let categories = null
	let wheelChairMapping = null
	let wheelChairToiletMapping = null

	//If addFields, add mappings for specific fields
	if (settings.addFields){
		const catFile = await fs.readFile(settings.categoriesFileName, {encoding: 'utf-8'})
		categories = await csv(catFile)
		const wheelchairFile = await fs.readFile(settings.wheelchairFileName, {encoding: 'utf-8'})
		wheelChairMapping = await csv(wheelchairFile)
		const wheelchairToiletFile = await fs.readFile(settings.wheelchairToiletFileName, {encoding: 'utf-8'})
		wheelChairToiletMapping = await csv(wheelchairToiletFile)
	}

	let a11yData = convertToA11y(inputData, categories, wheelChairMapping, wheelChairToiletMapping)
	
	//Add a negligible number to the lat and long so they're never identical for any two items 
	//TODO: This is a workaround for a problem Wheelmap has with two items with identical geolocations and should
	//			be removed when the bug is fixed as it can potentially cause issues. Ideally the real location of the placeInfo item would
	//			be used. Which should not be the same as any other placeInfo item (I think).
	if (settings.dedupingLocation){
		console.log("Changing geolocs slightly to work around Wheelmap bug ")
		a11yData.forEach( (item, i) => {
			item.geometry.coordinates[0] =  Math.round( (item.geometry.coordinates[0] + Number("0.000000" + i)) * 1000000000) / 1000000000
			item.geometry.coordinates[1] =  Math.round( (item.geometry.coordinates[1] + Number("0.000000" + i)) * 1000000000) / 1000000000
		})
	}

	if (settings.validation){
		a11yData.forEach((result, i) => validateAgainstSchema(result, i, a11y.PlaceInfoSchema.newContext()))
	}
	if (settings.printData){
		writeDataFile(a11yData)
	}
}

//Parsedata takes a source and manipulates it the way we want it
function convertToA11y(inputData, categories, wheelChairMapping, wheelChairToiletMapping){
	console.log("#Entries in data: ", inputData.length)

	const selection = settings.selection ? inputData.slice(0,10) : inputData
	const cleanedData = selection.map(item => mapA11yProperties(item, categories, wheelChairMapping, wheelChairToiletMapping))
	cleanedData.forEach( (d, i) => d.properties.originalId = i.toString())
	
	console.log(cleanedData[0].properties.accessibility.restrooms[0])
	return cleanedData
}

//Use the original data to create proper A11y data
function mapA11yProperties(item, categories, wheelchair, wheelChairToilet){
	if (settings.addFields){
		item.properties.category = categories.find(cat => cat.typ_naam === item.properties.originalData?.Functie?.trim())?.categoryWheelmap
		item.properties.category = item.properties.category === '' ? 'unknown' : item.properties.category
		
		//Find the relevant wheelchairStatus and use it to set the right a11y property
		const wheelchairStatus = wheelchair.find(status => status.Totaalscore === item.properties.originalData?.Totaalscore?.trim())?.accessibleWithWheelchair
		if (wheelchairStatus === 'accessibleWithWheelchairTrue'){
			if (item.properties.accessibility.accessibleWith === undefined){
				item.properties.accessibility.accessibleWith = {}
			}
			item.properties.accessibility.accessibleWith.wheelchair = true
		} else if (wheelchairStatus === 'accessibleWithWheelchairFalse'){
			if (item.properties.accessibility.accessibleWith === undefined){
				item.properties.accessibility.accessibleWith = {}
			}
			item.properties.accessibility.accessibleWith.wheelchair = false
		} else if (wheelchairStatus === 'partiallyAccessibleWithWheelchairTrue'){
			if (item.properties.accessibility.accessibleWith === undefined){
				item.properties.accessibility.partiallyAccessibleWith = {}
			}
			item.properties.accessibility.partiallyAccessibleWith.wheelchair = true
		}

		//Determine isAccessibleWithWheelchair property
		//Because current data source only has one restroom, that's the one we hardcode for
		let wheelchairToiletStatus = wheelChairToilet.find(status => status.sanitair === item.properties.originalData?.["Bruikbaarheid sanitair"]?.trim())?.isAccessibleWithWheelchair
		wheelchairToiletStatus = wheelchairToiletStatus === 'true' ? true : (wheelchairToiletStatus === 'false' ? false : undefined)
		item.properties.accessibility.restrooms[0].isAccessibleWithWheelchair = wheelchairToiletStatus
	}
	//Put the phoneNumber info in the right place
	item.properties.phoneNumber = item.properties.StructuredAddress?.phoneNumber ?? undefined
	delete item.properties.StructuredAddress?.phoneNumber
	//Put the placeWebsiteUrl info in the right place
	item.properties.placeWebsiteUrl = item.properties.StructuredAddress?.placeWebsiteUrl ?? undefined
	delete item.properties.StructuredAddress?.placeWebsiteUrl
	//Nest the StructuredAddress info inside the proper PlaceProperties.address property
	item.properties.address = item.properties.StructuredAddress
	delete item.properties.StructuredAddress

	//Delete the CBS related properties dump
	if (item.properties.originalData !== undefined){
 		delete item.properties.originalData
	}
	if (item.properties.accessibility.entrances !== undefined){
 		item.properties.accessibility.entrances.forEach(entrance => {
 			//Change elevatorEquipmentId to undefined if false or true to match the a11yjson standard
 			if (entrance.elevatorEquipmentId === false || entrance.elevatorEquipmentId === true){
 				entrance.elevatorEquipmentId = undefined
 			}
 			//Change intercomEquipmentId to undefined if false or true to match the a11yjson standard
 			if (entrance.intercomEquipmentId === false || entrance.intercomEquipmentId === true){
 				entrance.intercomEquipmentId = undefined
 			}
 			//Change slopeAngle to a number to match the a11yjson standard
 			entrance.slopeAngle = typeof entrance.slopeAngle === 'string' ? parseInt(entrance.slopeAngle.replace('%', ''), 10) : entrance.slopeAngle	
 			
 			//The stairs property is incorrectly named Stairs, this fixes that
 			entrance.stairs = entrance.Stairs
 			delete entrance.Stairs
 		})
	}

	//Nest the info of WashBasin inside the proper washBasin property.
	if (item.properties.accessibility.restrooms !== undefined){
		item.properties.accessibility.restrooms.forEach(restroom => {
			restroom.washBasin = restroom.WashBasin ?? restroom.washBasin
			delete restroom.WashBasin
		})
	}

	//As none of the wheelchairPlaces values is correct, set them to undefined
	item.properties.accessibility.wheelchairPlaces = undefined

	return item
}

//Checks if the produced data is valid for a certain a11y schema
//Logs any validation errors
function validateAgainstSchema(input, index, validationContext){
	validationContext.validate(input)
	if (!validationContext.isValid()) {
	  let errors = validationContext.validationErrors()
	  // errors = errors.filter( (e) => e.type !== "keyNotInSchema")
	  // `errors` is a JSON object with detailled validation infos about each field in the input object.
	 
	  console.log("Error(s) for result number", index, errors);
	}
}

//Write json data to a file with an index in the filename preventing duplicate filename errrors
function writeDataFile(data, fileIndex = 0)
{
	fs.writeFile(
			settings.outputFileName +"_"+ fileIndex +".json",
			JSON.stringify(data, null, 4),
			{ encoding:'utf8', flag:'wx' }
			)
	.then(data => console.log("The file was saved!", (settings.outputFileName +"_"+ fileIndex +".json")))
	.catch(err => {
		//Check if filename already exists, if it does, increase the number at the end by 1
		if (err.code == "EEXIST") {	
			// console.log("file already exists, trying with higher fileIndex", fileIndex)
			writeDataFile(data, ++fileIndex)
		} else {
		    return console.log(err)
		  }
	})
}