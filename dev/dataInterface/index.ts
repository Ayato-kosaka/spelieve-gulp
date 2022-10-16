import { TABLESInterface } from './TABLES';
import { T_COLUMNSInterface } from './T_COLUMNS';
import { VIEWInterface } from './VIEW';
import { INTERFACEInterface } from './INTERFACE';
import { CONSTInterface } from './CONST';
import { SECURITY_RULESInterface } from './SECURITY_RULES';
import { DATA_TYPEInterface } from './DATA_TYPE';
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
