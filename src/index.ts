import inquirer from "inquirer";
import { QueryResult } from 'pg';
import { pool, connectToDb } from './connection.js';

await connectToDb();

const performActions = (): void => {

    inquirer
        .prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: [
                    'View All Employees',
                    'Add Employee',
                    'Update Employee Role',
                    'View All Roles',
                    'Add Role',
                    'View All Departments',
                    'Add Department',
                    'Quit'
                ],
            },
        ])

        .then((answers) => {
            switch (answers.action) {
                case 'View All Employees':
                    const viewEmployees = `
                    SELECT 
                        e.id AS id, 
                        e.first_name, 
                        e.last_name, 
                        d.name AS title, 
                        r.salary, 
                        CONCAT(m.first_name, ' ', m.last_name) AS manager
                    FROM 
                        employee e
                    JOIN 
                        role r ON e.role_id = r.id
                    JOIN 
                        department d ON r.department_id = d.id
                    LEFT JOIN 
                        employee m ON e.manager_id = m.id;
                `;

                    pool.query(viewEmployees, (err: Error, res: QueryResult) => {
                        if (err) {
                            console.error(err);
                        } else {
                            console.table(res.rows);
                        }
                        performActions();
                    });
                    break;
                case 'Add Employee':

                    break;
                case 'Update Employee Role':

                    break;
                case 'View All Roles':

                    const viewRoles = `
                    SELECT role.id, role.title, department.name AS department, role.salary
                    FROM role
                    JOIN department ON role.department_id = department.id;  
                `;

                    pool.query(viewRoles, (err: Error, res: QueryResult) => {
                        if (err) {
                            console.error(err);
                        } else {
                            console.table(res.rows);
                        }
                        performActions();
                    });
                    break;
                case 'Add Role':

                    break;
                case 'View All Departments':

                const viewDepartments = `
                    SELECT department.id as id,
                    department.name as name
                    FROM department;
                `;

                    pool.query(viewDepartments, (err: Error, res: QueryResult) => {
                        if (err) {
                            console.error(err);
                        } else {
                            console.table(res.rows);
                        }
                        performActions();
                    });

                    break;
                case 'Add Department':

                    break;
                case 'Quit':
                    process.exit(0);
                    break;
                default:

                    break;
            }
        });
}

performActions();