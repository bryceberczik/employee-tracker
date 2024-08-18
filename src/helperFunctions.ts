import { QueryResult } from 'pg';
import { pool } from './connection.js';

const getDepartments = async (): Promise<string[]> => {
    const query = 'SELECT name FROM department;';
    const result: QueryResult = await pool.query(query);
    return result.rows.map(row => row.name);
};

const getRoles = async (): Promise<string[]> => {
    const query = 'SELECT title FROM role;';
    const result: QueryResult = await pool.query(query);
    return result.rows.map(row => row.title);
};

const getManagers = async (): Promise<string[]> => {
    const query = `
        SELECT first_name || ' ' || last_name AS manager_name
        FROM employee
        WHERE manager_id IS NULL;
    `;
    const result: QueryResult = await pool.query(query);
    return result.rows.map(row => row.manager_name);
};

const getEmployees = async (): Promise<string[]> => {
    const query = `
        SELECT e.id, e.first_name || ' ' || e.last_name AS employee_name
        FROM employee e;
    `;
    const result: QueryResult = await pool.query(query);
    return result.rows.map(row => row.employee_name);
};

export { getDepartments, getRoles, getManagers, getEmployees };