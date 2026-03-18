const User = require('../models/User');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

exports.register = async (req, res) => {
    const {name, surname, email, password} = req.body;

    const userExists = await User.findOne({email});

    if(userExists) {
        return res.status(400).json({message: 'User already exists'});
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
        name,
        surname,
        email,
        password: hashedPassword
    });

    res.json({
        _id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        token: generateToken(user._id)
    });
}

exports.login = async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});

    if(user && await bcrypt.compare(password, user.password)) {
        res.json({
            _id: user._id,
            name: user.name,
            surname: user.surname,
            email: user.email,
            token: generateToken(user._id)
        });
    } else {
        res.status(401).json({message: 'Invalid credentials.'});
    }
};