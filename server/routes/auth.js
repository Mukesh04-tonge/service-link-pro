import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { hashPassword, comparePassword, generateToken, authMiddleware, adminOnly } from '../utils/auth.js';

const router = express.Router();

// Lazy initialization of Supabase client
let supabaseClient = null;
function getSupabase() {
    if (!supabaseClient) {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

        console.log('Environment check:');
        console.log('SUPABASE_URL:', supabaseUrl ? 'Set' : 'NOT SET');
        console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'NOT SET');

        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('Supabase environment variables (SUPABASE_URL and SUPABASE_ANON_KEY) are not set!');
        }

        supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
        console.log('✅ Supabase client initialized successfully');
    }
    return supabaseClient;
}

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ error: 'Email, password, and role are required' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        console.log(`🔐 Login attempt: ${normalizedEmail} as ${role}`);

        // Fetch user from database
        const { data: user, error } = await getSupabase()
            .from('users')
            .select('*')
            .eq('email', normalizedEmail)
            .single();

        if (error) {
            console.error('❌ Database error during login:', error.message);
            if (error.code === 'PGRST116') {
                return res.status(401).json({ error: 'User not found' });
            }
            return res.status(500).json({ error: 'Database connection error' });
        }

        if (!user) {
            console.warn(`⚠️ User not found: ${normalizedEmail}`);
            return res.status(401).json({ error: 'User not found' });
        }

        // Check if user is active
        if (!user.active) {
            console.warn(`⚠️ Inactive account: ${normalizedEmail}`);
            return res.status(403).json({ error: 'Account is inactive' });
        }

        // Check if role matches
        if (user.role.toLowerCase() !== role.toLowerCase()) {
            console.warn(`⚠️ Role mismatch: Expected ${user.role}, got ${role}`);
            return res.status(403).json({ error: 'Invalid role for this account' });
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password_hash);
        if (!isPasswordValid) {
            console.warn(`⚠️ Invalid password for: ${normalizedEmail}`);
            return res.status(401).json({ error: 'Invalid password' });
        }

        console.log(`✅ Login successful: ${normalizedEmail}`);

        // Generate JWT token
        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
        });

        // Return user data and token
        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                active: user.active
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/auth/logout
 * Logout (client-side token removal)
 */
router.post('/logout', (req, res) => {
    // With JWT, logout is handled client-side by removing the token
    res.json({ message: 'Logged out successfully' });
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', authMiddleware, async (req, res) => {
    try {
        // Fetch fresh user data from database
        const { data: user, error } = await getSupabase()
            .from('users')
            .select('id, name, email, role, active')
            .eq('id', req.user.id)
            .single();

        if (error || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.active) {
            return res.status(403).json({ error: 'Account is inactive' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/auth/register
 * Register a new user (admin only)
 */
router.post('/register', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { name, email, password, role, active } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'Name, email, password, and role are required' });
        }

        // Check if user already exists
        const { data: existingUser } = await getSupabase()
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(409).json({ error: 'User with this email already exists' });
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user
        const { data: newUser, error } = await getSupabase()
            .from('users')
            .insert({
                name,
                email,
                password_hash: passwordHash,
                role,
                active: active !== undefined ? active : true
            })
            .select('id, name, email, role, active')
            .single();

        if (error) {
            console.error('Create user error:', error);
            return res.status(500).json({ error: 'Failed to create user' });
        }

        res.status(201).json({ user: newUser });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;

