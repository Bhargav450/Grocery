const { sequelize, argon2, QueryTypes } = require('../config/db');
const jwt = require('jsonwebtoken');


//register
const registration = async (req, res) => {


    const { name, email, password, role } = req.body;
    try {
        const hashedPassword = await argon2.hash(password, 10);
        await sequelize.query(
            'INSERT INTO "users"(name, email, password, role) VALUES(?,?,?,?)',
            {
                replacements: [name, email, hashedPassword, role],
            }
        );
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError' || error.code === '23505') {
            const field = error.fields ? Object.keys(error.fields)[0] : 'unknown field';
            res.status(400).json({
                message: `The ${field} already exists. Please use a different value.`,
            });
        } else {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'An error occurred', error: error.message });
        }
    }
};

//login
const login = async (req, res) => {
   

    const { email, password } = req.body;
    try {
        const [user] = await sequelize.query(
            'SELECT * FROM USERS WHERE EMAIL = :email',
            {
                replacements: { email },
                type: QueryTypes.SELECT,
            }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }

        const isMatch = await argon2.verify(user.password, password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password!' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports={registration,login};