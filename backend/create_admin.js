const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const createAdmin = async () => {
    try {
        // Render 'alchat' veritabanını kullanıyor (debug endpoint ile doğrulandı).
        const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://Mbay52:Mbay5175@cluster0.vfuydrs.mongodb.net/alchat?retryWrites=true&w=majority&appName=Cluster0';
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected to:', mongoose.connection.name);

        const email = 'mehmet52tr1453@gmail.com';
        const password = 'Mbay5175';
        const username = 'admin';

        // Check if exists
        await User.deleteOne({ email });
        console.log('Existing user deleted (if any)');

        // DEBUG: Şifreyi hashlemeden kaydediyoruz
        // const hashed = await bcrypt.hash(password, 10);
        await User.create({
            username,
            email,
            password: password, // Düz metin şifre
            role: 'admin',
            monthlyTokenLimit: 0, // Unlimited
            aiModel: 'gpt-4'
        });
        console.log(`Admin user created: ${email} / ${password}`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createAdmin();
