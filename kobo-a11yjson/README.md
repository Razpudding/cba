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
-   'Floors/Stairs_001': 'false', 'Floors/Stairs_002/Explanation_007': undefined, first should prob be hasStairs?
-   The transformer module doesn't fit its original purpose anymore. Makes more sense to set up a clean module with the type defs of the survey and perhaps move the parse getters to utils or another module.
-   The nodemon-ts watcher doesn't always compile dependencies. I was previously using `// "dev": "nodemon --watch \"src/**\" --ext \"ts,json\" --ignore 'output/' src/index.ts"` and now I'm trying something else

## Notes
Kobo adds numerical suffixes, starting with `_001` to duplicate field names. First I just removed all suffixes but that makes it impossible to distinguish multiple objects (e.g. several entrances) from one another. The current fix is to delete suffixes from a specific object when it is processed. So when an Entrance is processed, everything from Entrance_001/ is cleaned.
**This solution doesn't work when an object has a field with an array of objects because you run into the same problem.**

It might be a good idea to construct an object out of just the relevant Kobo fields for the current A11y interface being constructed and just pass that to the construction function.

## Data conversion
My current strategy is to transform the Kobo data to PlaceInfo objects. Each object will have all of the kobo fields nested in it. Anything relevant to a11yjson will be transformed to properly match the relevant interface. The rest of the kobo data I'll probably yeet to a custom additional info interface nested in PlaceInfo.

Surveys can be either 'basic' or 'extended'. Because a11yjson is fine with undefined values for properties I've decided to process basic surveys the same as extended ones, for now. Might be cleaner in the future to not even output these properties so there is no irrelevant data. Ont he other hand it's nice to have uniform data.

## Resources
- [a11yjson interfaces](https://github.com/sozialhelden/a11yjson/blob/main/docs/3-interfaces.md)