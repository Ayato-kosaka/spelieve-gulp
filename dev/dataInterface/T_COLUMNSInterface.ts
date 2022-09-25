import { GeoPoint, Timestamp, DocumentReference } from "firebase/firestore";
import { React , ReactNode } from 'react';

/**
 * Export interface of T_COLUMNS object.
 */
export interface T_COLUMNSInterface {
    t_id: string;
    c_no: string;
    c_name: string;
    c_datatype: string;
    c_length: string;
    c_required: string;
    c_updatable: string;
    memo: string;
} 