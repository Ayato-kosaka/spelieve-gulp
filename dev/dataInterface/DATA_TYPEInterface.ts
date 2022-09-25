import { GeoPoint, Timestamp, DocumentReference } from "firebase/firestore";
import { React , ReactNode } from 'react';

/**
 * Export interface of DATA_TYPE object.
 */
export interface DATA_TYPEInterface {
    FirestoreType: string;
    RuleType: string;
    DBType: string;
    CTType: string;
    FromFirestore: string;
    CTInit: string;
    RuleInit: string;
} 