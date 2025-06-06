export const sanitizeInput = (value) => value.trim();

/**
 * Valida os campos de login.
 * @param {string} username 
 * @param {string} password 
 * @returns {{ isValid: boolean, errors: object }}
 */
export const validateFormFields = (username, password) => {
  const errors = {};

  if (!validateInput.username(username)) {
    errors.username = 'Usuário deve ter pelo menos 3 caracteres e conter apenas letras, números e _';
  }

  if (!validateInput.password(password)) {
    errors.password = 'Senha deve ter pelo menos 6 caracteres';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};