/**
 * Factory middleware to enforce Role-Based Access Control (RBAC).
 * Returns 401 UNAUTHENTICATED if req.user is absent.
 * Returns 403 FORBIDDEN if req.user.role is not in allowedRoles.
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Authentication required',
        },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient role permissions',
        },
      });
    }

    next();
  };
}