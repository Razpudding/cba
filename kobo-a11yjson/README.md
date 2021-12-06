# kobo-a11yjson
Code to convert kobo data to a11yjson using the typescript interfaces provided by SozialHelden.

## Notes

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
- Strings are not localizedstring yet. Can't figure out the format but it should look something like this `"nl": <string>input['Parking/WheelchairParking/neededParkingPermits']`
  + The language questions at the start of the survey can be used to determine the language tag of all localizedStrings
- Maybe change fieldTypes to proper TS types so the parsevalue function can infer export type better
- Make repo public
- Calculate slope angle
- Update floors interface
- Figure out what to do with all the description texts
- Implement multiple entries
- Convert Sidewalkconditions from 1-4 to 0-1

## Data conversion
My current strategy is to transform the Kobo data to PlaceInfo objects. Each object will have all of the kobo fields nested in it. Anything relevant to a11yjson will be transformed to properly match the relevant interface. The rest of the kobo data I'll probably yeet to a custom additional info interface nested in PlaceInfo.

Surveys can be either 'basic' or 'extended'. Because a11yjson is fine with undefined values for properties I've decided to process basic surveys the same as extended ones, for now. Might be cleaner in the future to not even output these properties so there is no irrelevant data. Ont he other hand it's nice to have uniform data.

## Resources
- [a11yjson interfaces](https://github.com/sozialhelden/a11yjson/blob/main/docs/3-interfaces.md)