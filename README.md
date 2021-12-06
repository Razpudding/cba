# cba
This repo holds relevant work for [Cliëntenbelang Amsterdam](https://www.clientenbelangamsterdam.nl/), a dutch NGO working on making the city of Amsterdam more accessible.

## Projects

### Kobo data to A11yJSON standard
[kobo-a11yjson](/) Converts Kobo survey data to A11yJSON.
It uses the typescript interfaces provided by SozialHelden and outputs A11yJSON data with some additional fields relevant to this project.

### A11yJSON diagram
[a11yjson-diagram](/a11yjson-diagram) A useful diagram which shows a visual nesting of A11yJSON interfaces. Currently only the interfaces I need are included.

### Extracting interfaces
[extracting-interfaces](/extracting-interfaces)A dirty hack to get all A11yJSON interfaces

## Acknowledgements
- The conversion was inspired by some work by [@Jurian](https://github.com/Jurian/)
- The [A11yJSON standard](https://github.com/sozialhelden/a11yjson) and all the useful packages that helped me use it were developed by [Sozialhelden](https://github.com/sozialhelden)