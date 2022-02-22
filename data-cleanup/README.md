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

## Notes
- The original data source seems to use 'null' as a standard value for undefined fields. This is a bit tricky while undefined fields are deleted from the json output (making the file more efficient), null is kept in. I can't just convert all null fields to undefined either because in some cases in the a11ysjon standard, null has a different meaning than undefined. It usually means something isn't there while undefined means we simply don't know anything about it, it could still exist in real life.
- Equipmentinfo is nested in 'properties.accessibility.equipment' in the sourceData but should become separate objects which are added to the a11y cloud.
- If we end up adding OSM and Wikidata Id's to the new data we should also add it to this dataset

## Todos
