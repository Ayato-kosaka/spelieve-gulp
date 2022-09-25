import { GeoPoint, Timestamp, DocumentReference } from "firebase/firestore";
import { React , ReactNode } from 'react';

/**
 * Export interface of FuncList object.
 */
export interface FuncListInterface {
    Delete: string;
    ServiceName: string;
    ServiceID: string;
    FuncType: string;
    FuncTypeID: string;
    FuncNumber: string;
    FuncID: string;
    FuncName: string;
} 