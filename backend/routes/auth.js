const express = require('express');
const router = express.Router();
const supabase = require('../database/supabase');
const auth = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  const { email, password, username } = req.body;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username } // Store additional user metadata
      }
    });

    if (error) {
      console.error('Supabase signUp error:', error.message);
      return res.status(400).json({ msg: error.message });
    }

    res.status(201).json({ msg: 'User registered successfully. Check your email for verification.', user: data.user });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase signIn error:', error.message);
      return res.status(400).json({ msg: error.message });
    }

    res.json({ token: data.session.access_token, user: data.user });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/auth
// @desc    Get user by token
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // req.user is set by the auth middleware
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, first_name, last_name, language, subscription_plan, keywords_limit, channels_limit, subscription_expires_at, is_active, created_at, last_login')
      .eq('id', req.user.id)
      .single();

    if (error) {
      console.error('Supabase user fetch error:', error.message);
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;