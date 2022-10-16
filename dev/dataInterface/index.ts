import { TABLESInterface } from './TABLESInterface';
// @ts-ignore
import { T_COLUMNSInterface } from './T_COLUMNSInterface';
// @ts-ignore
import { VIEWInterface } from './VIEWInterface';
// @ts-ignore
import { INTERFACEInterface } from './INTERFACEInterface';
// @ts-ignore
import { CONSTInterface } from './CONSTInterface';
// @ts-ignore
import { SECURITY_RULESInterface } from './SECURITY_RULESInterface';
// @ts-ignore
import { DATA_TYPEInterface } from './DATA_TYPEInterface';
// @ts-ignore
import { FuncListInterface } from './FuncListInterface';
/**
 * Export interface of data object.
 */
export interface dataInterface {
    TABLES: Array<TABLESInterface>;
    T_COLUMNS: Array<T_COLUMNSInterface>;
    VIEW: Array<VIEWInterface>;
    INTERFACE: Array<INTERFACEInterface>;
    CONST: Array<CONSTInterface>;
    SECURITY_RULES: Array<SECURITY_RULESInterface>;
    DATA_TYPE: Array<DATA_TYPEInterface>;
    FuncList: FuncListInterface[];
} 
const c:TABLESInterface;
c
