const validateRegister = (req, res, next) => {
  const { username, email, password, role } = req.body;
  const errors = {};

  if (!username || username.trim().length < 3) {
    errors.username = 'Username must be at least 3 characters long.';
  }

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    errors.email = 'Please provide a valid email address.';
  }

  if (!password || password.length < 6) {
    errors.password = 'Password must be at least 6 characters long.';
  }

  if (role && !['user', 'manufacturer'].includes(role)) {
    errors.role = 'Role must be either "user" or "manufacturer".';
  }

  // Brand partner specific fields
  if (role === 'manufacturer') {
    const { brandName, companyName, registrationNumber } = req.body;
    if (!brandName || brandName.trim() === '') {
      errors.brandName = 'Brand Name is required for manufacturer registration.';
    }
    if (!companyName || companyName.trim() === '') {
      errors.companyName = 'Company Name is required for manufacturer registration.';
    }
    if (!registrationNumber || registrationNumber.trim() === '') {
      errors.registrationNumber = 'Registration Number is required for manufacturer registration.';
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { loginIdentifier, password } = req.body; // Can be username or email
  const errors = {};

  if (!loginIdentifier || loginIdentifier.trim() === '') {
    errors.loginIdentifier = 'Username or Email is required.';
  }

  if (!password || password.trim() === '') {
    errors.password = 'Password is required.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

const validateUpdateProfile = (req, res, next) => {
  const { username, email } = req.body;
  const errors = {};

  if (!username || username.trim().length < 3) {
    errors.username = 'Username must be at least 3 characters long.';
  }

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    errors.email = 'Please provide a valid email address.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile
};
