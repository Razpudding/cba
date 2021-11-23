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
It uses the typescript interfaces provided by SozialHelden.

## Resources
- [a11yjson interface](https://github.com/sozialhelden/a11yjson/blob/main/docs/3-interfaces.md)