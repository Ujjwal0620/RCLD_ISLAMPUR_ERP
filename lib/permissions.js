export function hasPermission(user, permission) {
  if (!user) return false;
  return user.userRoles?.some((assignment) =>
    assignment.role.permissions?.some((item) => item.permission.key === permission)
  ) || user.userRoles?.some((assignment) => assignment.role.name === "SUPERADMIN");
}

export function getRoleNames(user) {
  return user?.userRoles?.map((assignment) => assignment.role.name) || [];
}
