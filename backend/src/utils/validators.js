/**
 * Validate if string is a valid email
 * @param {string} email 
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Validate if string is a valid MongoDB ObjectId
 * @param {string} id 
 * @returns {boolean}
 */
export const isValidObjectId = (id) => {
  const re = /^[0-9a-fA-F]{24}$/;
  return re.test(String(id));
};

/**
 * Validate strong password
 * @param {string} password 
 * @returns {boolean}
 */
export const isStrongPassword = (password) => {
  // At least 8 characters, 1 letter, 1 number
  return password && password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
};
