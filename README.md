# cba
Useful code snippets to work with the CBA data. Anything that becomes to big will be put in a separate repo.

## Snippets

### Extracting interfaces
The current method to get an overview of the latest interfaces (to use in matching tables) is to extract them from the a11yjson npm package.

In the package there is a file called typedoc-output.json which has, among other things, all the interfaces with all their children listed. The code in 'extracting-interfaces' can be applied to get a cleaned list for matching tables.

TODO:
- Find out if there isn't a more direct way
- Automate the process a bit more by having the code grab the file, run the extraction logic and then output the result

### Kobo data to a11yjson standard
'kobo-a11yjson' has some code on converting kobo data to a11yjson.
It uses the typescript interfces provided by SozialHelden.
The [SozialHelden transformer](https://github.com/sozialhelden/a11yjson/blob/main/src/transformers/transformKoboToA11y.ts) might come in handy here.

It looks like the Kobo data nests groups using the "/" symbol so I'll try to use that to arrive at specific a11yjson interfaces.

I think I'll event. create a sort of utils/helpers file with useful functions like finding values in nested objects, cleaning values etc. The main file will just have a piece of code loading the data, a chain of calling cleaning functions, and an export function which saves the data to a json file.

## Resources
- [a11yjson interface](https://github.com/sozialhelden/a11yjson/blob/main/docs/3-interfaces.md)