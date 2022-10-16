// @ts-ignore
import { TABLESInterface } from './TABLES';
// @ts-ignore
import { T_COLUMNSInterface } from './T_COLUMNS';
// @ts-ignore
import { VIEWInterface } from './VIEW';
// @ts-ignore
import { INTERFACEInterface } from './INTERFACE';
// @ts-ignore
import { CONSTInterface } from './CONST';
// @ts-ignore
import { SECURITY_RULESInterface } from './SECURITY_RULES';
// @ts-ignore
import { DATA_TYPEInterface } from './DATA_TYPE';
// @ts-ignore
import { FuncListInterface } from './FuncList';
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
    FuncList: Array<FuncListInterface>;
} 
