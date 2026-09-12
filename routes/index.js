const express = require('express');
const router  = express.Router();
const { getHome } = require('../controllers/plantController');

router.get('/', getHome);

// Shortcut redirects so /login and /register also work
router.get('/login',    (req, res) => res.redirect('/auth/login'));
router.get('/register', (req, res) => res.redirect('/auth/register'));
router.get('/logout',   (req, res) => res.redirect('/auth/logout'));

module.exports = router;
