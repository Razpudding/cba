# Data Cleanup
Small project to convert old a11yjson data to the correct format and clean up unused properties.

## Changes
- elevatorEquipmentId and intercomEquipmentId values have been replaced with undefined. They were either true or false in the original data, neither of which are valid values as this field should have an actual id or be undefined. 
- slopeAngle values had a trailing '%' symbol which I have removed. Then I changed the string values to numbers
- Both a washBasin and a WashBasin property where present in restrooms. I've simply nested the info in Washbasin inside washBasin and deleted the WashBasin property.
- wheelchairPlaces values never described a wheelchairPlaces object so I've set them to undefined
- The stairs property was incorrectly named Stairs
- The properties.address info was inside a StructuredAddress property
- The properties.phoneNumber info was inside a StructuredAddress property
- The properties.placeWebsiteUrl was inside a StructuredAddress property
- properties.category was built from originalDat.functie using a mapping table (included in input folder)
- Wheelchair a11y data was added using a wheelchair mapping table (included in input folder)

## Todos
- Equipmentinfo is nested in 'properties.accessibility.equipment' in the sourceData but should become separate objects which are added to the a11y cloud.
- If we end up adding OSM and Wikidata Id's to the new data we should also add it to this dataset
- Check why some category values end up being "" (informatiecentra)
	+ Category should never be an empty string as it causes issues with wheelmap. Instead make it "unknown":string or "undefined":string. Have this as default value for category instead of null in source data.
- Remove unnecessary " ?? undefined" for property lookups