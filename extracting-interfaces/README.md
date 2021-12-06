# Extracting A11yJSON Interfaces
The current method to get an overview of the latest interfaces (to use in matching tables) is to extract them from the a11yjson npm package.

In the package there is a file called typedoc-output.json which has, among other things, all the interfaces with all their children listed. The code in 'extracting-interfaces' can be applied to get a cleaned list for matching tables.

This is quite hacky and not completely tested. I no longer have this use case so I prob won't update the code.

TODO:
- Find out if there isn't a more direct way
- Automate the process a bit more by having the code grab the file, run the extraction logic and then output the result