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
- Strings are not localizedstring yet. Can't figure out the format but it should look something like this `"nl": <string>input['Parking/WheelchairParking/neededParkingPermits']`
  + The language questions at the start of the survey can be used to determine the language tag of all localizedStrings
- Maybe change fieldTypes to proper TS types so the parsevalue function can infer export type better
- Calculate slope angle (wait for data, then use calc previously used)
- Update floors interface
- Figure out what to do with all the description texts
- Implement multiple entrances
  + Because num.suf. are stripped when the data is loaded, Entrances/Entrance_001 can no longer be distinguished from Entrance_002.
  + To solve this, either split up the sourcedata by a unique field present in every Entrance like 'isMainEntrance' (And reapply a suffix)
  + Or look at the total number of entrances and use that
  + Or don't remove suffixes until an Interface's object(s) have been constructed.
  + Last option is prob best. Suffixes still need to be removed from fields like 'count' or 'stairs' in order to find the relevant data. Right before an Interface is constructed, that part of the data should be cleaned of its suffixes. Everything starting with '/Parking' could be cleaned for instance. Or everything starting with /Entrances/Entrance001
- Convert Sidewalkconditions from 1-4 to 0-1
- Document usage instructions
- Replace the PlaceInfo filler info with real data from survey
- Look at language question to determine language for localizedStrings
- Resulting JSON can have empty object (for instance when no data is filled in for an entrance). Might be better to remove those before outputting (or change output settings)

## Notes
Kobo adds numerical suffixes, starting with `_001` to duplicate field names. First I just removed all suffixes but that makes it impossible to distinguish multiple objects (e.g. several entrances) from one another. The current fix is to delete suffixes from a specific object when it is processed. So when an Entrance is processed, everything from Entrance_001/ is cleaned.
**This solution doesn't work when an object has a field with an array of objects because you run into the same problem.**

It might be a good idea to construct an object out of just the relevant Kobo fields for the current A11y interface being constructed and just pass that to the construction function.

## Data conversion
My current strategy is to transform the Kobo data to PlaceInfo objects. Each object will have all of the kobo fields nested in it. Anything relevant to a11yjson will be transformed to properly match the relevant interface. The rest of the kobo data I'll probably yeet to a custom additional info interface nested in PlaceInfo.

Surveys can be either 'basic' or 'extended'. Because a11yjson is fine with undefined values for properties I've decided to process basic surveys the same as extended ones, for now. Might be cleaner in the future to not even output these properties so there is no irrelevant data. Ont he other hand it's nice to have uniform data.

## Resources
- [a11yjson interfaces](https://github.com/sozialhelden/a11yjson/blob/main/docs/3-interfaces.md)