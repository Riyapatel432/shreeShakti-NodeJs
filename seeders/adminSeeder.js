const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// ── Admin Model ───────────────────────────────────────────────────────────────
const adminSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true },
  role:      { type: String, default: 'Admin' },
  isActive:  { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now }
});
const Admin = mongoose.model('Admin', adminSchema);

// ── Seed Data ─────────────────────────────────────────────────────────────────
const admins = [
  {
    name:     'S. S. Sharma',
    email:    'admin@shreeshakti.com',
    password: 'password123',
    role:     'Admin'
  },
  {
    name:     'Rajesh Kumar',
    email:    'rajesh@shreeshakti.com',
    password: 'admin@123',
    role:     'Admin'
  },
  {
    name:     'Priya Verma',
    email:    'priya@shreeshakti.com',
    password: 'priya@123',
    role:     'Admin'
  }
];

// ── Run Seeder ────────────────────────────────────────────────────────────────
async function runSeeder() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shreeshakti_erp';
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected');

    let created = 0;
    let skipped = 0;

    for (const adminData of admins) {
      const existing = await Admin.findOne({ email: adminData.email });
      
      if (existing) {
        console.log(`⏭️  Skipped (already exists): ${adminData.email}`);
        skipped++;
        continue;
      }

      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      await Admin.create({ ...adminData, password: hashedPassword });
      console.log(`✅ Created admin: ${adminData.email} (password: ${adminData.password})`);
      created++;
    }

    console.log('\n────────────────────────────────────────');
    console.log(`Seeder done! Created: ${created}, Skipped: ${skipped}`);
    console.log('────────────────────────────────────────');
    
  } catch (err) {
    console.error('❌ Seeder error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB Disconnected');
    process.exit(0);
  }
}

runSeeder();
