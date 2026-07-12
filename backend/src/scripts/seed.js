import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Department from '../models/Department.js';
import Category from '../models/Category.js';
import EmissionFactor from '../models/EmissionFactor.js';
import Badge from '../models/Badge.js';
import Reward from '../models/Reward.js';
import User from '../models/User.js';
import ESGConfig from '../models/ESGConfig.js';
import EnvironmentalGoal from '../models/EnvironmentalGoal.js';
import CSRActivity from '../models/CSRActivity.js';
import Challenge from '../models/Challenge.js';

dotenv.config({ path: './.env' });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecosphere';

const seedData = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to database!');

    // Clear existing data
    console.log('Clearing old collections...');
    await Promise.all([
      Department.deleteMany({}),
      Category.deleteMany({}),
      EmissionFactor.deleteMany({}),
      Badge.deleteMany({}),
      Reward.deleteMany({}),
      ESGConfig.deleteMany({}),
      EnvironmentalGoal.deleteMany({}),
      CSRActivity.deleteMany({}),
      Challenge.deleteMany({}),
    ]);

    // 1. Create ESG Config
    console.log('Seeding ESG Config...');
    await ESGConfig.create({
      organizationName: 'EcoSphere Corp',
      autoEmissionCalculation: true,
      evidenceRequiredForCSR: false,
      badgeAutoAward: true,
      scoreWeights: { environmental: 0.4, social: 0.3, governance: 0.3 }
    });

    // 2. Create Departments
    console.log('Seeding Departments...');
    const depts = await Department.create([
      { name: 'Human Resources', code: 'HR', employeeCount: 15, status: 'active' },
      { name: 'Engineering', code: 'ENG', employeeCount: 45, status: 'active' },
      { name: 'Sales & Marketing', code: 'SALES', employeeCount: 25, status: 'active' },
      { name: 'Operations', code: 'OPS', employeeCount: 30, status: 'active' },
    ]);

    const hrDept = depts[0];
    const engDept = depts[1];

    // 3. Create Categories
    console.log('Seeding Categories...');
    const categories = await Category.create([
      { name: 'Energy', type: 'Environmental', icon: '⚡', description: 'Electricity and heating consumption' },
      { name: 'Transport', type: 'Environmental', icon: '🚗', description: 'Business travel and commuting' },
      { name: 'Waste & Water', type: 'Environmental', icon: '💧', description: 'Water usage and recycling waste' },
      { name: 'Community', type: 'Social', icon: '🤝', description: 'Volunteering and local outreach' },
      { name: 'Well-being', type: 'Social', icon: '❤️', description: 'Employee health and safety' },
      { name: 'Ethics', type: 'Governance', icon: '📋', description: 'Corporate governance and compliance' },
    ]);

    // 4. Create Emission Factors
    console.log('Seeding Emission Factors...');
    await EmissionFactor.create([
      { name: 'Grid Electricity', category: categories[0]._id, factor: 0.85, unit: 'kg CO2e / kWh', scope: 'Scope 2', source: 'National Grid GHG report' },
      { name: 'Natural Gas Heating', category: categories[0]._id, factor: 2.02, unit: 'kg CO2e / m3', scope: 'Scope 1', source: 'EPA Emission Factors Guide' },
      { name: 'Petrol Car Commute', category: categories[1]._id, factor: 0.21, unit: 'kg CO2e / km', scope: 'Scope 3', source: 'DEFRA GHG factors' },
      { name: 'Flights (Short haul)', category: categories[1]._id, factor: 0.15, unit: 'kg CO2e / km', scope: 'Scope 3', source: 'ICAO Carbon Calculator' },
      { name: 'Water Usage', category: categories[2]._id, factor: 0.34, unit: 'kg CO2e / m3', scope: 'Scope 3', source: 'Water UK statistics' },
    ]);

    // 5. Create Badges
    console.log('Seeding Badges...');
    await Badge.create([
      { name: 'Green Recruit', description: 'Complete email verification and start your sustainability journey', icon: '🌱', rarity: 'Common', unlockRule: { type: 'xp_threshold', threshold: 100, description: 'Reach 100 XP' } },
      { name: 'Eco Champion', description: 'Unlock 500 XP to prove your environmental dedication', icon: '🌿', rarity: 'Uncommon', unlockRule: { type: 'xp_threshold', threshold: 500, description: 'Reach 500 XP' } },
      { name: 'Sustainability Sentinel', description: 'Earn 1500 XP by actively participating across MERN platform', icon: '🛡️', rarity: 'Rare', unlockRule: { type: 'xp_threshold', threshold: 1500, description: 'Reach 1500 XP' } },
      { name: 'CSR Pioneer', description: 'Complete 3 approved community or CSR volunteering activities', icon: '🤝', rarity: 'Epic', unlockRule: { type: 'csr_activities', threshold: 3, description: 'Complete 3 CSR activities' } },
      { name: 'Challenge Master', description: 'Complete 5 organizational sustainability challenges', icon: '🏆', rarity: 'Legendary', unlockRule: { type: 'challenges_completed', threshold: 5, description: 'Complete 5 challenges' } },
    ]);

    // 6. Create Rewards
    console.log('Seeding Rewards...');
    await Reward.create([
      { name: 'Eco Coffee Mug', description: 'Reusable bamboo coffee mug with EcoSphere logo', pointsRequired: 200, stock: 50, category: 'Product', status: 'Active' },
      { name: 'Rs. 500 Amazon Gift Voucher', description: 'Digital Amazon voucher for sustainable products', pointsRequired: 500, stock: 20, category: 'Voucher', status: 'Active' },
      { name: 'Plant a Tree', description: 'EcoSphere will plant a tree in your name with a certificate', pointsRequired: 300, stock: 100, category: 'Recognition', status: 'Active' },
      { name: 'Additional Half-Day Off', description: 'One half-day paid leave certificate', pointsRequired: 1000, stock: 5, category: 'Time Off', status: 'Active' },
    ]);

    // 7. Create Challenges
    console.log('Seeding Challenges...');
    await Challenge.create([
      { title: 'Zero Waste Week', description: 'Minimize single-use plastic waste for one full week at work.', difficulty: 'Medium', category: categories[2]._id, targetDepartment: engDept._id, xpReward: 150, pointsReward: 100, maxParticipants: 30, status: 'Active' },
      { title: 'Carpool & Cycle', description: 'Commute to work by cycling, walking, or carpooling with colleagues.', difficulty: 'Easy', category: categories[1]._id, xpReward: 100, pointsReward: 50, maxParticipants: 50, status: 'Active' },
      { title: 'Digital Clean-up', description: 'Clean up old files, emails, and cloud storage to reduce data center power.', difficulty: 'Easy', category: categories[0]._id, xpReward: 80, pointsReward: 30, maxParticipants: 100, status: 'Active' },
    ]);

    // 8. Create CSR Activities
    console.log('Seeding CSR Activities...');
    await CSRActivity.create([
      { title: 'Beach Cleanup Drive', description: 'Help clean up local beach and sort plastics for recycling.', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), location: 'Marine Drive Beach', pointsAwarded: 120, maxParticipants: 20, status: 'Open', category: categories[3]._id },
      { title: 'Blood Donation Camp', description: 'Annual community health and blood donation drive.', date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), location: 'Main Office Cafeteria', pointsAwarded: 100, maxParticipants: 40, status: 'Open', category: categories[4]._id },
    ]);

    // 9. Environmental Goals
    console.log('Seeding Goals...');
    await EnvironmentalGoal.create([
      { title: 'Reduce Energy Consumption by 10%', description: 'Decrease monthly electricity usage across Engineering department.', department: engDept._id, targetValue: 5000, unit: 'kWh', status: 'On Track', category: categories[0]._id },
      { title: 'Volunteering hours target', description: 'Aim for 100 hours of community engagement.', department: hrDept._id, targetValue: 100, unit: 'hours', status: 'Active', category: categories[3]._id },
    ]);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
