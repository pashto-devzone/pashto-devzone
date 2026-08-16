import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "portfolio-admin-secret-key-2024";

export function getAdminId(request) {
  const token = request.cookies.get("admin_token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.id || null;
  } catch {
    return null;
  }
}

export function checkAuth(request) {
  const token = request.cookies.get("admin_token")?.value;
  if (!token) return false;
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export function getAdminUsername(request) {
  const token = request.cookies.get("admin_token")?.value;
  if (!token) return "admin";
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.username || "admin";
  } catch {
    return "admin";
  }
}

