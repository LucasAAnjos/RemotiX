export const validateInput = {
  username: (value) => /^[a-zA-Z0-9_]{3,}$/.test(value),
  password: (value) => value.length >= 6,
};

export const sanitizeInput = (value) => value.trim();