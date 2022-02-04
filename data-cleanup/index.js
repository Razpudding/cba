import { promises } from 'fs' //.promises
import csv from 'neat-csv'
import a11y from '@sozialhelden/a11yjson'

const fs = promises

//This settigns object controls the global settings for this programme
const settings = {
	inputFileName: 'input/CBA2016A11y.json',
	outputFileName: 'output/CBA2016_cleaned',
	categoriesFileName: 'input/categories.csv',
	printData: false,
	selection: true,
	validation: false,
	categorize: true,
}

main()

async function main(){
	const inputDataFile = await loadFile()
	const inputData = JSON.parse(inputDataFile)


	// createReadStream(src)
	//   .pipe(csv({ separator: ';' }))
	//   .on('data', (data) => results.push(data))
	//   .on('end', () => {
	//   	processResults(results)
	//   })

	if (settings.categorize){
		const catData = await csv(settings.categoriesFileName)
		console.log("catdata", catData)
		// categorizeData(inputData)
		// createReadStream(src)
		//   .pipe(csv())
		//   .on('data', (data) => results.push(data))
		//   .on('end', () => {
		//   	processResults(results)
		//   })
	}

	const a11yData = convertToA11y(inputData)

	if (settings.validation){
		a11yData.forEach((result, i) => validateAgainstSchema(result, i, a11y.PlaceInfoSchema.newContext()))
	}
	if (settings.printData){
		writeDataFile(a11yData)
	}
}

//Load a file using the fs package, then call parseData
async function loadFile(){
	return await fs.readFile(settings.inputFileName, {encoding: 'utf-8'})
	// return [inputData, categoryData]
}

//Parsedata takes a source and manipulates it the way we want it
function convertToA11y(inputData){
	console.log("#Entries in data: ", inputData.length)

	const selection = settings.selection ? inputData.slice(0,10) : inputData
	const cleanedData = selection.map(item => cleanup(item))
	cleanedData.forEach( (d, i) => d.properties.originalId = i.toString())
	
	console.log(cleanedData[0].properties.accessibility.restrooms[0])
	return cleanedData
}


function cleanup(item){
	//Put the phoneNumber info in the right place
	item.properties.phoneNumber = item.properties.StructuredAddress?.phoneNumber ?? undefined
	delete item.properties.StructuredAddress?.phoneNumber
	//Put the placeWebsiteUrl info in the right place
	item.properties.placeWebsiteUrl = item.properties.StructuredAddress?.placeWebsiteUrl ?? undefined
	delete item.properties.StructuredAddress?.placeWebsiteUrl
	//Nest the StructuredAddress info inside the proper PlaceProperties.address property
	item.properties.address = item.properties.StructuredAddress ?? undefined
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
 			entrance.stairs = entrance.Stairs ?? undefined
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
	fs.writeFile(settings.outputFileName +"_"+ fileIndex +".json",
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