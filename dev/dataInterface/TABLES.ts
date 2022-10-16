/**
 * Export interface of TABLES object.
 */
export interface TABLESInterface {
    t_id: string;
    t_name: string;
    parent_tid: string;
    depth: string;
    allow_get: string;
    allow_list: string;
    allow_create: string;
    allow_update: string;
    allow_delete: string;
    memo: string;
} 
