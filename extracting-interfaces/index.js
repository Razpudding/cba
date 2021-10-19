//Workaround to get a list of all the interfaces and their fields
//Grab the typedoc output file. Host that file locally or copy it somewhere.

//Get all the interfaces using this filter
const interfaces = json.children.filter(c => c["kindString"] ==  "Interface")

//Map to filter out relevant fields
const structuredInterfaces = interfaces.map(i => {
	return {
		name: i.name,
		children: i.children,
		comment: i.comment
	}
})

//Dump to JSON string
JSON.stringify(structuredInterfaces)

//Get each interface's children
const interfaceFields = structuredInterfaces.map(s => {
    return {
        interface: s.name,
        fields: s.children.map(c => c.name)
    }
})

//Bit of spaghetti code to format the strings so they can be directly pasted into excel
var outputArrays = interfaceFields.map(i => i.fields.map(f => i.interface + "\t" + f + "\n"))
var newLineOuputStringJoined = newLineOuputString.join("\n")
console.log(newLineOuputStringJoined)