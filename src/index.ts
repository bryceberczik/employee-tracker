import inquirer from "inquirer";
import { QueryResult } from 'pg';
import { pool, connectToDb } from './connection.js';
import { getDepartments, getRoles, getManagers, getEmployees } from "./helperFunctions.js";

await connectToDb();

const addRole = async (): Promise<void> => {

    const departments = await getDepartments();

    inquirer
        .prompt([
            {
                type: 'input',
                name: 'roleName',
                message: 'What is the name of the role?'
            },
            {
                type: 'number',
                name: 'salary',
                message: 'What is the salary of the role?'
            },
            {
                type: 'list',
                name: 'department',
                message: 'Which department does the role belong to?',
                choices: departments
            }
        ])
        .then((answers) => {
            const { roleName, salary, department } = answers;
            const addRoleQuery = `
            INSERT INTO role (title, salary, department_id)
            VALUES ($1, $2, (SELECT id FROM department WHERE name = $3));
        `;

            pool.query(addRoleQuery, [roleName, salary, department], (err: Error, _res: QueryResult) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log(`Added ${roleName} to the database.`);
                }
                performActions();
            });
        });
}

const addDepartment = (): void => {

    inquirer
        .prompt([
            {
                type: 'input',
                name: 'departmentName',
                message: 'What is the name of your department'
            },
        ])
        .then((answers) => {
            const { departmentName } = answers;
            const addDeptQuery = 'INSERT INTO department (name) VALUES ($1);';

            pool.query(addDeptQuery, [departmentName], (err: Error, _res: QueryResult) => {
                if (err) {

                    console.error(err);
                } else {

                    console.log(`Added ${departmentName} to the database.`);
                    performActions();
                }
            })

        })
}

const addEmployee = async (): Promise<void> => {
    const managers = await getManagers();
    const roles = await getRoles();

    const addEmployeeQuery = `
    INSERT INTO employee (first_name, last_name, role_id, manager_id)
    VALUES ($1, $2, (SELECT id FROM role WHERE title = $3 LIMIT 1), 
    (SELECT id FROM employee WHERE first_name = $4 AND last_name = $5 LIMIT 1));
    `;

    inquirer
        .prompt([
            {
                type: 'input',
                name: 'firstName',
                message: 'What is the employee\'s first name?'
            },
            {
                type: 'input',
                name: 'lastName',
                message: 'What is the employee\'s last name?'
            },
            {
                type: 'list',
                name: 'employeeRole',
                message: 'What is the employee\'s role?',
                choices: roles
            },
            {
                type: 'list',
                name: 'manager',
                message: 'Who is the employee\'s manager?',
                choices: [...managers, 'None']
            }
        ])
        .then(async (answers) => {
            const { firstName, lastName, employeeRole, manager } = answers;
            let managerFirstName = null;
            let managerLastName = null;

            if (manager !== 'None') {
                [managerFirstName, managerLastName] = manager.split(' ');
            }

            try {
                await pool.query(addEmployeeQuery, [firstName, lastName, employeeRole, managerFirstName, managerLastName]);
                console.log('Employee added successfully');
            } catch (error) {
                console.error('Error adding employee:', error);
            }
            performActions();
        });
};

const updateEmployee = async (): Promise<void> => {
    const employees = await getEmployees();
    const roles = await getRoles();

    inquirer
        .prompt([
            {
                type: 'list',
                name: 'employeeId',
                message: 'Which employee\'s role do you want to update?',
                choices: employees
            },
            {
                type: 'list',
                name: 'roleId',
                message: 'Which role do you want to assign the selected employee?',
                choices: roles
            }
        ])
        .then(async (answers) => {
            const { employeeId, roleId } = answers;
            const [employeeFirstName, employeeLastName] = employeeId.split(' ')
            const updateEmployeeRoleQuery = `
                UPDATE employee
                SET role_id = (SELECT id FROM role WHERE title = $1 LIMIT 1)
                WHERE first_name = $2 AND last_name = $3;
            `;

            pool.query(updateEmployeeRoleQuery, [roleId, employeeFirstName, employeeLastName], (err: Error, _res: QueryResult) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log(`Updated employee's role in the database.`);
                }
                performActions();
            });
        });
};

const updateEmployeeManager = async (): Promise<void> => {
    const employees = await getEmployees();
    const managers = await getManagers();

    inquirer
        .prompt([
            {
                type: 'list',
                name: 'employeeId',
                message: 'Which employee do you want to update?',
                choices: employees
            },
            {
                type: 'list',
                name: 'managerId',
                message: 'Which manager do you want to assign to the selected employee?',
                choices: managers
            }
        ])
        .then((answers) => {
            const { employeeId, managerId } = answers;
            const [employeeFirstName, employeeLastName] = employeeId.split(' ');
            const [managerFirstName, managerLastName] = managerId.split(' ');
            const updateEmployeeManagerQuery = `
                UPDATE employee
                SET manager_id = (SELECT id FROM employee WHERE first_name = $1 AND last_name = $2 LIMIT 1)
                WHERE first_name = $3 AND last_name = $4;
            `;

            pool.query(updateEmployeeManagerQuery, [managerFirstName, managerLastName, employeeFirstName, employeeLastName], (err: Error, _res: QueryResult) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log(`Updated employee's manager in the database.`);
                }
                performActions();
            });
        });
};

const deleteEmployee = async (): Promise<void> => {

    const employees = await getEmployees();

    inquirer
        .prompt([
            {
                type: 'list',
                name: 'employeeId',
                message: 'Select an employee to delete:',
                choices: employees
            }
        ])
        .then((answers) => {
            const { employeeId } = answers;
            const [employeeFirstName, employeeLastName] = employeeId.split(' ');
            const deleteEmployeeQuery = `
                            DELETE FROM employee WHERE id = (SELECT id FROM employee WHERE first_name = $1 AND last_name = $2 LIMIT 1);
                        `;

            pool.query(deleteEmployeeQuery, [employeeFirstName, employeeLastName], (err: Error, _res: QueryResult) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log('Employee deleted successfully.');
                }
                performActions();
            });
        });
};

const deleteRole = async (): Promise<void> => {

    const roles = await getRoles();

    inquirer
    .prompt([
        {
            type: 'list',
            name: 'roleId',
            message: 'Select a role to delete:',
            choices: roles
        }
    ])
    .then((answers) => {
        const { roleId } = answers;
        const deleteRoleQuery = `
                DELETE FROM role
                WHERE id = (SELECT id FROM role WHERE title = $1 LIMIT 1);
            `;
            pool.query(deleteRoleQuery, [roleId], (err: Error, _res: QueryResult) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log('Role deleted successfully.');
                }
                performActions();
            });
    })
};

const deleteDepartment = async (): Promise<void> => {

    const departments = await getDepartments();

    inquirer
    .prompt([
        {
            type: 'list',
            name: 'departmentId',
            message: 'Select a department to delete:',
            choices: departments
        }
    ])
    .then((answers) => {
        const { departmentId } = answers;
        const deleteDepartmentQuery = `
                DELETE FROM department
                WHERE id = (SELECT id FROM department WHERE name = $1);`
                pool.query(deleteDepartmentQuery, [departmentId], (err: Error, _res: QueryResult) => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log('Department deleted successfully.');
                    }
                    performActions();
                });
    })
};

const viewEmployeesByManager = async (): Promise<void> => {
    try {
        const managers = await getManagers();

        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'managerName',
                message: 'Select a manager to view their employees:',
                choices: managers
            }
        ]);

        const { managerName } = answers;
        const [firstName, lastName] = managerName.split(' ');

        const query = `
            SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department
            FROM employee e
            JOIN role r ON e.role_id = r.id
            JOIN department d ON r.department_id = d.id
            JOIN employee m ON e.manager_id = m.id
            WHERE m.first_name = $1 AND m.last_name = $2;
        `;

        const result = await pool.query(query, [firstName, lastName]);

        console.table(result.rows);
    } catch (error) {
        console.error('Error viewing employees by manager:', error);
    } finally {
        performActions();
    }
};

const viewEmployeesByDepartment = async (): Promise<void> => {
    try {
        const departments = await getDepartments();

        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'departmentName',
                message: 'Select a department to view its employees:',
                choices: departments
            }
        ]);

        const { departmentName } = answers;

        const query = `
            SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department
            FROM employee e
            JOIN role r ON e.role_id = r.id
            JOIN department d ON r.department_id = d.id
            WHERE d.name = $1;
        `;

        const result = await pool.query(query, [departmentName]);

        console.table(result.rows);
    } catch (error) {
        console.error('Error viewing employees by department:', error);
    } finally {
        performActions();
    }
};

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
                    'Update Employee Manager',
                    'Total Utilize Budget',
                    'Delete Employee',
                    'Delete Role',
                    'Delete Department',
                    'View Employees By Manager',
                    'View Employees By Department',
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
                        r.title AS title,
                        d.name AS department, 
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

                    addEmployee();

                    break;
                case 'Update Employee Role':

                    updateEmployee();

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

                    addRole();

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

                    addDepartment();

                    break;
                case 'Update Employee Manager':

                    updateEmployeeManager();

                    break;
                case 'Total Utilize Budget':

                    const totalUtilizeBudgetQuery = `
                        SELECT d.name AS department, SUM(r.salary) AS total_salary
                        FROM employee e
                        JOIN role r ON e.role_id = r.id
                        JOIN department d ON r.department_id = d.id
                        GROUP BY d.name;
                        `;

                    pool.query(totalUtilizeBudgetQuery, (err: Error, res: QueryResult) => {
                        if (err) {
                            console.error(err);
                        } else {
                            console.table(res.rows);
                        }
                        performActions();
                    });
                    break;
                case 'Delete Employee':

                    deleteEmployee();
                    break;
                case 'Delete Role':

                    deleteRole();

                    break;
                case 'Delete Department':

                    deleteDepartment();

                    break;
                case 'View Employees By Manager':

                    viewEmployeesByManager();
                    break;
                case 'View Employees By Department':

                    viewEmployeesByDepartment();
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