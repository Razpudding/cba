# kobo-a11yjson
Code to convert kobo data to a11yjson using the typescript interfaces provided by SozialHelden.

## Notes

The [SozialHelden transformer](https://github.com/sozialhelden/a11yjson/blob/main/src/transformers/transformKoboToA11y.ts) might come in handy here.

It looks like the Kobo data nests groups using the "/" symbol so I'll try to use that to arrive at specific a11yjson interfaces.

I think I'll event. create a sort of utils/helpers file with useful functions like finding values in nested objects, cleaning values etc. The main file will just have a piece of code loading the data, a chain of calling cleaning functions, and an export function which saves the data to a json file.

- I changed the input csv headers a bit to reflect the way interfaces are neste din a11yjson 

## Data conversion

My current strategy is to transform the Kobo data to PlaceInfo objects. Each object will have all of the kobo fields nested in it. Anything relevant to a11yjson will be transformed to properly match the relevant interface. The rest of the kobo data I'll probably yeet to a custom additional info interface nested in PlaceInfo.

The plan is to loop over questions in each kobo row/entry. If the key of the question starts with a known a11y interface, the key will be matched in a switch case and the value handled appropriately (a nested property will be created on an empty a11yjson object). If the key has a sub-interface after the "/", it will match another switch to find the nested interface.