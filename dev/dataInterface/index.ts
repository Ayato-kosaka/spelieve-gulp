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
 * Export interface of dataInterface object.
 */
export interface dataInterfaceInterface {
    TABLES: TABLESInterface;
    T_COLUMNS: T_COLUMNSInterface;
    VIEW: VIEWInterface;
    INTERFACE: INTERFACEInterface;
    SECURITY_RULES: SECURITY_RULESInterface;
    DATA_TYPE: DATA_TYPEInterface;
    FuncList: FuncListInterface;
} 