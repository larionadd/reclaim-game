import ru from './ru.json'
import en from './en.json'
import uk from './uk.json'
import type {Lang} from '../types'
const dictionaries:Record<Lang,Record<string,string>>={uk,ru,en}
export const t=(lang:Lang,key:string)=>dictionaries[lang][key]??key
