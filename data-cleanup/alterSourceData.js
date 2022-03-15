import { promises } from 'fs' //.promises
import csv from 'neat-csv'

const fs = promises

//This settigns object controls the global settings for this programme
const settings = {
	inputFileName: 'input/CBA2016A11y.json',
  updateFileName: 'input/updates.csv',
	outputFileName: 'input/CBA2016_updated',
	printData: true,
	selection: false,
}

main()
// Main run loop
async function main(){
	const inputDataFile = await fs.readFile(settings.inputFileName, {encoding: 'utf-8'})
	let inputData = JSON.parse(inputDataFile)
  inputData = settings.selection? inputData.slice(0,10) : inputData

  const updatesFile = await fs.readFile(settings.updateFileName, {encoding: 'utf-8'})
  const updates = await csv(updatesFile)
  console.log(updates[0])

  inputData.forEach( (item, i) => {
    item.properties.description = updates[i]['properties/description']
    item.properties.name = updates[i]['properties/name']
    item.properties.StructuredAddress.phoneNumber = updates[i]['properties/phoneNumber']
    item.properties.StructuredAddress.city = updates[i]['properties/address/city']
    item.properties.StructuredAddress.house = updates[i]['properties/address/house']
    item.properties.StructuredAddress.postalCode = updates[i]['properties/address/postalCode']
    item.properties.StructuredAddress.street = updates[i]['properties/address/street']
    item.properties.StructuredAddress.placeWebsiteUrl = updates[i]['properties/placeWebsiteUrl']    
  })
  console.log(inputData.map(i => i.properties.StructuredAddress))
	if (settings.printData){
		writeDataFile(inputData)
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