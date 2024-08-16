-- VIEW ALL ROLES

SELECT role.id, role.title, department.name AS department, role.salary
FROM role
JOIN department ON role.department_id = department.id;

-- VIEW ALL EMPLOYEES

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