# kobo-a11yjson
Code to convert kobo data to a11yjson using the typescript interfaces provided by SozialHelden.

## Notes

The [SozialHelden transformer](https://github.com/sozialhelden/a11yjson/blob/main/src/transformers/transformKoboToA11y.ts) might come in handy here.

It looks like the Kobo data nests groups using the "/" symbol so I'll try to use that to arrive at specific a11yjson interfaces.

I think I'll event. create a sort of utils/helpers file with useful functions like finding values in nested objects, cleaning values etc. The main file will just have a piece of code loading the data, a chain of calling cleaning functions, and an export function which saves the data to a json file.

- I changed the input csv headers a bit to reflect the way interfaces are nestedmin a11yjson 
- Updated the lib file means rebuilding it by hand before the imported js is updated!
- What to do with empty values? Remove them beforehand? Do they mean the thing isn't there or it it's just not filled out?

## TODO
- Currently using parseInt but should use parseIntUnit because parseInt can return NaN when an empty string is passed for instance. parseIntUnit however returns something weird using lodash which causes type errors...
- Strings are not localizedstring yet. Can't figure out the format but it should look something like this `"nl": <string>input['Parking/WheelchairParking/neededParkingPermits']`
- Build support for simple and complete versions of the survey
  + Prob the simple will one will need its own KoboResult type
  + Or some of the fields will need to be optional
- Refactor the transformer and index file
- Maybe change fieldTypes to proper TS types so the parsevalue function can infer export type better
- Write resulting a11yjson to file
- Support array of results
- Make repo public

## Data conversion

My current strategy is to transform the Kobo data to PlaceInfo objects. Each object will have all of the kobo fields nested in it. Anything relevant to a11yjson will be transformed to properly match the relevant interface. The rest of the kobo data I'll probably yeet to a custom additional info interface nested in PlaceInfo.

The plan is to loop over questions in each kobo row/entry. If the key of the question starts with a known a11y interface, the key will be matched in a switch case and the value handled appropriately (a nested property will be created on an empty a11yjson object). If the key has a sub-interface after the "/", it will match another switch to find the nested interface.

Use the [a11yjson validation](https://github.com/sozialhelden/a11yjson/blob/0c36f52c7d55c7eaffceaa7caf47cca85c9a9dba/docs/0-usage.md#validating-a11yjson-objects-at-runtime)

### Kobo data example
This flat json structure
```js
const partiallyAccessibleByUserData: KoboResult = {
  'user/user_measuring': 'cm',
  is_wheelchair_accessible: 'partially',
  'inside/toilet/has_toilet': 'true',
  'inside/toilet/basin_wheelchair_fits_belows': 'true',
  'inside/toilet/basin_wheelchair_reachable': 'true',
  'inside/toilet/has_arm_rests': 'some wrong value',
  'inside/toilet/basin_inside_cabin': 'true',
  'inside/toilet/stepless_access': 'true',
  'inside/toilet/free_space_left': '260.4',
  'inside/toilet/free_space_right': '100,5',
  'inside/toilet/free_space_front': '100'
} as KoboResult;
```
is converted to a valid a11yjson object in [this test](https://github.com/sozialhelden/a11yjson/blob/0c36f52c7d55c7eaffceaa7caf47cca85c9a9dba/test/transformers/Kobo2A11yJson.test.ts).

### Flow
- Export data from Kobo as csv (with xml headers)
- Run through preprocessing script to get json array of KoboResults
	+ csv-json with d3 (generate errors)
- Run KoboResults data through transformer to get a11yjson data

### Questions
I was hoping TS would help me find missing props or extra props in my parsed objects but it doesn't do that. It relies on my typing so if I say a function returns an object of type X but I parse data that results in the object not having the required prop Y, TS wont throw an error. So how do I make it work for me?
The data being loaded into the programme cant be typechecked automatically but has to be parsed. All the logic that follows can use strong typing to avoid errors.
When the data is being loaded it should still be typechecked by hand to avoid errors further down the line. [This](https://github.com/woutervh-/typescript-is) might be a useful tool for that.