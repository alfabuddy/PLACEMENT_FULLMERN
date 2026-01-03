// Create this file at: controllers/userController.js
import User from '../models/userModel.js';

// @desc    Update user's language preference
// @route   PUT /api/users/language
// @access  Private
const updateLanguagePreference = async (req, res) => {
  const { language } = req.body;

  // Validate the incoming language
  const supportedLangs = ['en', 'hi', 'bn', 'or', 'es'];
  if (!language || !supportedLangs.includes(language)) {
    return res.status(400).json({ message: 'Invalid language specified.' });
  }

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.preferredLanguage = language;
      await user.save();
      
      // Send back the updated portion of user info
      res.json({
        preferredLanguage: user.preferredLanguage,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating language:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { updateLanguagePreference };