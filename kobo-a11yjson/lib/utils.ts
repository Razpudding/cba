//TODO: Had to type object as any because otherwise 'object[key]' throws an error
//	should prob be fixed in a typed way
export function cleanKeys(object:any){
	const keyValues = Object.keys(object).map(key => {
		const newKey = key.includes('_') ? stripNumericalSuffix(key) : key
		return { [newKey]: object[key] };
	})
	return Object.assign({}, ...keyValues);
}

function stripNumericalSuffix(str:string){
	if ( isNaN( Number( str.split('_')[1]) ) ){
		console.log("Parsing invalid suffix", str)
	}
	return str.split('_')[0]
}