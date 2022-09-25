import { GeoPoint, Timestamp, DocumentReference } from "firebase/firestore";
import { React , ReactNode } from 'react';

/**
 * Export interface of VIEW object.
 */
export interface VIEWInterface {
    func_id: string;
    component_id: string;
    key: string;
    component_name: string;
    component_unique_name: string;
    parent_component: string;
    depth: string;
    memo: string;
} 