const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository');
const firebaseService = require('../services/firebaseService');

exports.signup = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in local SQLite database first
    const newUser = await userRepository.createUser({
      name,
      email,
      password: hashedPassword,
      phone
    });

    // Create user in Firebase and get UID
    const firebaseUid = await firebaseService.createUser({
      name,
      email,
      password,  // Firebase will handle hashing
      phone
    });

    // Update local user with Firebase UID
    await userRepository.updateFirebaseUid(newUser.id, firebaseUid);

    // Generate access key
    const accessKey = await firebaseService.generateAccessKey(firebaseUid, {
      role: newUser.role
    });

    // Send response
    return res.status(201).json({
      message: 'User registered successfully',
      accessKey,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    });
    
  } catch (error) {
    console.error('Error during signup:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user in SQLite
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate access key from Firebase
    const accessKey = await firebaseService.generateAccessKey(user.firebase_uid, {
      role: user.role
    });

    return res.status(200).json({
      message: 'Login successful',
      accessKey,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
