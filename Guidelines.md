## CHECK EXISTING STUDENT/USER RECORDS IN DB:

mysql> SELECT 
    ->   s.id AS student_id,
    ->   s.student_code,
    ->   s.roll_no,
    ->   u.full_name,
    ->   s.batch,
    ->   s.elective,
    ->   s.division_id,
    ->   u.id AS user_id,
    ->   u.email
    -> FROM students s
    -> JOIN users u ON u.id = s.user_id
    -> LIMIT 20;

## That will show you the first 10 student login emails.

SELECT id, email, role, full_name
FROM users
WHERE role = 'student'
LIMIT 10;



## CHECK MORE STUDENT INFO:
mysql> SELECT COUNT(*) AS students_count FROM students;
+----------------+
| students_count |
+----------------+
|            315 |
+----------------+
1 row in set (0.010 sec)

mysql> SELECT COUNT(*) AS student_users_count FROM users WHERE role = 'student';
+---------------------+
| student_users_count |
+---------------------+
|                 315 |
+---------------------+
1 row in set (0.005 sec)

mysql> SELECT COUNT(*) AS joined_count
    -> FROM students s
    -> JOIN users u ON u.id = s.user_id;
+--------------+
| joined_count |
+--------------+
|          315 |
+--------------+
1 row in set (0.004 sec)

## ADD TEACHERS AND ASSIGN SUBJECT :

node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('teacher123', 10, (err, hash) => console.log(hash));"

$2a$10$XNw9hpKFFsTJpnD.yhRLvuilNcApY7gt6bho1zw.U7Wm6bq5Z3hC6

INSERT INTO users (email, password, role, full_name) VALUES
    -> ('ramesh@college.edu', '$2a$10$XNw9hpKFFsTJpnD.yhRLvuilNcApY7gt6bho1zw.U7Wm6bq5Z3hC6', 'teacher', 'Dr. Ramesh');
Query OK, 1 row affected (0.014 sec)


mysql> SELECT id FROM users WHERE email = 'ramesh@college.edu';
+----+
| id |
+----+
|  2 |
+----+
1 row in set (0.001 sec)

mysql> SELECT id FROM subjects WHERE subject_code = 'CN';
+----+
| id |
+----+
|  2 |
+----+
1 row in set (0.001 sec)

mysql> SELECT id FROM users WHERE email = 'pant@college.edu';
+----+
| id |
+----+
|  3 |
+----+
1 row in set (0.002 sec)

mysql> SELECT id FROM subjects WHERE subject_code = 'OS'
    -> ;
+----+
| id |
+----+
|  3 |
+----+
1 row in set (0.001 sec)

mysql> SELECT * FROM subjects;
+----+--------------+-----------------------------+----------+---------+
| id | subject_code | subject_name                | semester | credits |
+----+--------------+-----------------------------+----------+---------+
|  1 | FJP          | Full Stack Java Programming |        4 |       4 |
|  2 | CN           | Computer Networks           |        4 |       4 |
|  3 | OS           | Operating Systems           |        4 |       3 |
|  4 | DBMS         | Database Management Systems |        4 |       4 |
|  5 | SE           | Software Engineering        |        4 |       3 |
+----+--------------+-----------------------------+----------+---------+
5 rows in set (0.001 sec)

mysql> INSERT INTO teacher_subjects (teacher_id, subject_id, division_id, academic_year)
    -> VALUES (2, 2, 1, '2024-25');
Query OK, 1 row affected (0.005 sec)

mysql> INSERT INTO teacher_subjects (teacher_id, subject_id, division_id, academic_year)
    -> VALUES (3, 3, 1, '2024-25');
Query OK, 1 row affected (0.003 sec)