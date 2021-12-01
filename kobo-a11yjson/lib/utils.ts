//TODO: Had to type object as any because otherwise 'object[key]' throws an error
//	should prob be fixed in a typed way
export function cleanKeys(object:any){
	const keyValues = Object.keys(object).map(key => {
		//Remove all numerical suffixes generated by Kobo
		const newKey = key.replace(/_0../g, '')
		return { [newKey]: object[key] };
	})
	return Object.assign({}, ...keyValues);
}