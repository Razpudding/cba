# kobo-a11yjson
Code to convert kobo data to a11yjson using the typescript interfaces provided by SozialHelden.

## Features
- Loads and cleans raw Kobo csv data
  + Removes numerical suffixes from duplicate data column names
  + Changes empty strings to `undefined``
- Cleaned Kobo data is used to generate valid [A11yJSON](https://github.com/sozialhelden/a11yjson) objects
- Constructs each top level interface object separately, like 'Parking', by using the Kobo path ('Parking/[key]')
- Sub interface objects, like 'Door' can be created dynamically
- All data is typed using the '@sozialhelden/a11yjson' npm typescript package
- All generated data is validated against the A11yJSON standard and deviations from the standard are logged.

## TODO
- FormatVersion should be pulled from the package.json
- The restrooms and floors interface still have double numerical suffixes that need to be fixed.
  + When fixing this, also fix the other issues in the kobo survey
- Can the same survey be filled in twice for different language entries for the same building? If so we need to handle that because the code will just output almost identical a11y objects that will need to be merged later.
- Calculate slope angle (wait for data, then use calc previously used)
- Update floors interface
- Figure out what to do with all the description texts
- Convert Sidewalk conditions from 1-4 to 0-1
  + Look into [OST-smoothness]
- Document usage instructions of repo
- Replace the PlaceInfo filler info with real data from survey
- Resulting JSON can have empty object (for instance when no data is filled in for an entrance). Might be better to remove those before outputting (or change output settings)
  + Maybe solve with a stringify replacer function, or just use lodash `_.isEmpty({}); // true` before printing to file
  + Turns out none of the solution I found work reliably, tried everything [here](https://stackoverflow.com/questions/38275753/how-to-remove-empty-values-from-object-using-lodash)
  + Might be better to leave them in (the a11yjson data platform might remove them?) or do a check when an object is constructed because there's no need for recursion then.
  + Tried to use `return Object.values(result).every(el => el === undefined) ? undefined : result` which works well, however it messes up the return type of the construction functions because undefined is not a valid 'Parking' interface for instance. It's solvable but not in an elegant way. So for now I'll leave the mepty objects because the alternative is not typing the interfaces...
  + I also wrote a working snippet which recursively checks for empty objects, however it can cause objects to be empty and those will not be removed from the output ```var test = {
  name: "brrt", t: {}, p: { a: { s: undefined} }
};
var testStringified = JSON.stringify(dude, (key, value) => {
  if (value instanceof Object){
      if (value && Object.keys(value).length === 0 && Object.getPrototypeOf(value) === Object.prototype){
        return
      }
  }
  return value
})```
-   'Floors/Stairs_001': 'false', 'Floors/Stairs_002/Explanation_007': undefined, first should prob be hasStairs?
-   Feature: Add support for  'EquipmentInfo' objects. It could work like this
  +   If data is found while parsing KoboResults that needs to be constructed into an EquipmentInfo, call a constructor function with the relevant fields and the building Id
  +   The EquipmentInfo result should not be stored in a property on the current PlaceInfo object but instead be pushed to a EquipmentInfo array.
  +   When the data is being printed to a file, the EquipmentInfo should be printed on the top level as PlaceInfo objects
  +   EquipmentInfo is linked to a place using the primary key of 'originalPlaceInfoId'
  +   When the data is imported in the accessibility.cloud platform, the 'originalPlaceInfoId's are used to generate 'placeInfoId's which reference the 'PlaceInfo' object the EquipmentInfo belongs to in the cloud. This should be documented under Data Conversion.

## Notes
Kobo adds numerical suffixes, starting with `_001` to duplicate field names. First I just removed all suffixes but that makes it impossible to distinguish multiple objects (e.g. several entrances) from one another. The current fix is extract only the relevant fields from the kobo survey object, remove suffixes from this object and then turn it into a11y. So when an Entrance is processed, everything from Entrance_001/ is cleaned. When a Stairs object is constructed, the Entrance_001/Stairs object is cleaned.

## Data conversion
Raw survey data is loaded from a csv file and parsed into KoboResult describing a survey result each. The KoboResults are deconstructed into smaller objects describing fields relevant to a certain A11yJSON interface. These cleaned objects are fed into functions which return "valid" A11yJSON objects. These objects are mostly nested inside a PlaceInfo object for each survey result.

Certain fields describing equipment, like an elevator, are instead used to construct EquipmentInfo A11yJSON objects. These objects have a 'originalPlaceInfoId' which references the building the equipment is found in. Practically this means that when a survey describing a building is processed, all info is stored inside one PlaceInfo object except for equipment which is constructed into separate objects referencing the building they are found in.
Later when the data is imported into accessibility.cloud, the Places and Equipments are stored separately and linked using the 'originalPlaceInfoId'.

Surveys can be either 'basic' or 'extended'. Because a11yjson is fine with undefined values for properties I've decided to process basic surveys the same as extended ones, for now. Might be cleaner in the future to not even output these properties so there is no irrelevant data. Ont he other hand it's nice to have uniform data.

## Resources
- [a11yjson interfaces](https://github.com/sozialhelden/a11yjson/blob/main/docs/3-interfaces.md)