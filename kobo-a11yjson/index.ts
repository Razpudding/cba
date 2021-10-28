console.log("hello typescript")
import { Accessibility, PlaceInfo } from '@sozialhelden/a11yjson'
import { createReadStream, writeFile} from 'fs'
let arr = new Array()

createReadStream('speciesData/soorten_uitzonderingen.csv')