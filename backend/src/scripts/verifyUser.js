/**
 * Quick dev script to manually verify a user's email in the database.
 * Usage: node src/scripts/verifyUser.js <email>
 * Example: node src/scripts/verifyUser.js test@example.com
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const email = process.argv[2];

if (!email) {
  console.error('❌ Usage: node src/scripts/verifyUser.js <email>');
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);
console.log('✅ Connected to MongoDB');

const result = await mongoose.connection.db.collection('users').updateOne(
  { email },
  {
    $set: { isEmailVerified: true },
    $unset: { emailVerificationToken: '', emailVerificationExpires: '' },
  }
);

if (result.matchedCount === 0) {
  console.error(`❌ No user found with email: ${email}`);
} else if (result.modifiedCount === 0) {
  console.log(`ℹ️  User ${email} was already verified.`);
} else {
  console.log(`✅ User ${email} has been manually verified! They can now log in.`);
}

await mongoose.disconnect();
process.exit(0);
