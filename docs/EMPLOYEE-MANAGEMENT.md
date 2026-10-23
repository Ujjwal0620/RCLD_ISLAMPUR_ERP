# Employee Management

## Current scope

The employee master is linked to the existing User authentication and RBAC system. It supports:

- Employee code
- Full name, email and phone
- Designation and department
- Employment type
- Employee status
- Joining date and date of birth
- Gender
- Alternate phone
- Present/permanent address
- City, district, state and PIN
- Qualification, skills, experience and specialization
- Profile image reference
- Emergency contact
- Notes
- Multiple role assignments for Super Admin

## Authorization

- Employee listing requires employees.view.
- Employee create/update requires employees.manage.
- Role assignment is restricted to Super Admin.
- Employee hard delete is restricted to Super Admin.
- Delete is blocked when attendance or batch-faculty history exists.
- Important employee mutations are written to the existing audit log.

## Data safety

Employee accounts use the existing User password/session system. Password hashes are generated with bcrypt and are never stored in the Employee record.

Employee records with operational history should be deactivated/resigned rather than hard-deleted.

## Verification still required

Run the local Prisma synchronization after pulling the branch, then verify:

1. Employee create.
2. Employee edit.
3. Role assignment.
4. Status changes.
5. Employee search.
6. Protected delete.
7. Delete blocking when historical attendance/batch assignments exist.
8. Employee attendance integration.
9. Batch faculty integration.
10. Lint and production build.
