export function hashPassword(password) {
  // This is a simple hash function for demonstration
  // In production, use a proper cryptographic hash function
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

export function validatePassword(password, hash) {
  return hashPassword(password) === hash;
}