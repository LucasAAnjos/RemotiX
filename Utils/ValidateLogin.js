export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validateForm = (email, password) => {
  const errors = {};

  if (!email.trim()) {
    errors.email = 'E-mail é obrigatório';
  } else if (!isValidEmail(email)) {
    errors.email = 'Formato de e-mail inválido';
  }

  if (!password.trim()) {
    errors.password = 'Senha é obrigatória';
  } else if (password.length < 6) {
    errors.password = 'Senha deve ter pelo menos 6 caracteres';
  }

  return errors;
};
