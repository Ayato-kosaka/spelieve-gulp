import { TABLESInterface } from './TABLESInterface';
import { T_COLUMNSInterface } from './T_COLUMNSInterface';
import { VIEWInterface } from './VIEWInterface';
import { INTERFACEInterface } from './INTERFACEInterface';
import { SECURITY_RULESInterface } from './SECURITY_RULESInterface';
import { DATA_TYPEInterface } from './DATA_TYPEInterface';
import { FuncListInterface } from './FuncListInterface';
import { GeoPoint, Timestamp, DocumentReference } from "firebase/firestore";
import { React , ReactNode } from 'react';

/**
 * Export interface of data object.
 */
export interface dataInterface {
    TABLES: Array<TABLESInterface>;
    T_COLUMNS: Array<T_COLUMNSInterface>;
    VIEW: Array<VIEWInterface>;
    INTERFACE: Array<INTERFACEInterface>;
    SECURITY_RULES: Array<SECURITY_RULESInterface>;
    DATA_TYPE: Array<DATA_TYPEInterface>;
    FuncList: Array<FuncListInterface>;
} 