import { GeoPoint, Timestamp, DocumentReference } from "firebase/firestore";
import { React , ReactNode } from 'react';

/**
 * Export interface of SECURITY_RULES object.
 */
export interface SECURITY_RULESInterface {
    t_id: string;
    crud_type: string;
    method_no: string;
    method_type: string;
    func_id: string;
    extend_crud_type: string;
} 