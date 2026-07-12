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
import CarbonTransaction from '../models/CarbonTransaction.js';
import ESGPolicy from '../models/ESGPolicy.js';
import PolicyAcknowledgement from '../models/PolicyAcknowledgement.js';
import Audit from '../models/Audit.js';
import ComplianceIssue from '../models/ComplianceIssue.js';
import DepartmentScore from '../models/DepartmentScore.js';
import EmployeeParticipation from '../models/EmployeeParticipation.js';
import ChallengeParticipation from '../models/ChallengeParticipation.js';

dotenv.config({ path: './.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecosphere';

const seedData = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to database!');

    // Clear existing data
    console.log('Clearing old collections...');
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Category.deleteMany({}),
      EmissionFactor.deleteMany({}),
      Badge.deleteMany({}),
      Reward.deleteMany({}),
      ESGConfig.deleteMany({}),
      EnvironmentalGoal.deleteMany({}),
      CSRActivity.deleteMany({}),
      Challenge.deleteMany({}),
      CarbonTransaction.deleteMany({}),
      ESGPolicy.deleteMany({}),
      PolicyAcknowledgement.deleteMany({}),
      Audit.deleteMany({}),
      ComplianceIssue.deleteMany({}),
      DepartmentScore.deleteMany({}),
      EmployeeParticipation.deleteMany({}),
      ChallengeParticipation.deleteMany({}),
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

    // 1b. Create Admin User
    console.log('Seeding Admin User...');
    const adminUser = await User.create({
      name: 'EcoSphere Admin',
      email: 'admin@ecosphere.com',
      password: 'password123',
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
    });

    // 2. Create Departments
    console.log('Seeding Departments...');
    const depts = await Department.create([
      { name: 'Human Resources', code: 'HR', employeeCount: 15, status: 'active', head: adminUser._id },
      { name: 'Engineering', code: 'ENG', employeeCount: 45, status: 'active', head: adminUser._id },
      { name: 'Sales & Marketing', code: 'SALES', employeeCount: 25, status: 'active', head: adminUser._id },
      { name: 'Operations', code: 'OPS', employeeCount: 30, status: 'active', head: adminUser._id },
    ]);

    const hrDept = depts[0];
    const engDept = depts[1];
    const salesDept = depts[2];
    const opsDept = depts[3];

    // 3. Create Categories
    console.log('Seeding Categories...');
    const categories = await Category.create([
      { name: 'Energy', type: 'Emission', icon: '⚡', description: 'Electricity and heating consumption' },
      { name: 'Transport', type: 'Emission', icon: '🚗', description: 'Business travel and commuting' },
      { name: 'Waste & Water', type: 'Emission', icon: '💧', description: 'Water usage and recycling waste' },
      { name: 'Community', type: 'CSR Activity', icon: '🤝', description: 'Volunteering and local outreach' },
      { name: 'Well-being', type: 'CSR Activity', icon: '❤️', description: 'Employee health and safety' },
      { name: 'Ethics', type: 'General', icon: '📋', description: 'Corporate governance and compliance' },
    ]);

    // 4. Create Emission Factors
    console.log('Seeding Emission Factors...');
    await EmissionFactor.create([
      { name: 'Grid Electricity', category: 'Energy', factor: 0.85, unit: 'kg CO2e / kWh', scope: 'Scope 2', source: 'National Grid GHG report' },
      { name: 'Natural Gas Heating', category: 'Energy', factor: 2.02, unit: 'kg CO2e / m3', scope: 'Scope 1', source: 'EPA Emission Factors Guide' },
      { name: 'Petrol Car Commute', category: 'Fleet', factor: 0.21, unit: 'kg CO2e / km', scope: 'Scope 3', source: 'DEFRA GHG factors' },
      { name: 'Flights (Short haul)', category: 'Fleet', factor: 0.15, unit: 'kg CO2e / km', scope: 'Scope 3', source: 'ICAO Carbon Calculator' },
      { name: 'Water Usage', category: 'Waste', factor: 0.34, unit: 'kg CO2e / m3', scope: 'Scope 3', source: 'Water UK statistics' },
    ]);

    // 5. Create Badges
    console.log('Seeding Badges...');
    await Badge.create([
      { name: 'Green Recruit', description: 'Complete email verification and start your sustainability journey', icon: '🌱', rarity: 'Common', unlockRule: { type: 'xp_threshold', threshold: 100, description: 'Reach 100 XP' }, createdBy: adminUser._id },
      { name: 'Eco Champion', description: 'Unlock 500 XP to prove your environmental dedication', icon: '🌿', rarity: 'Uncommon', unlockRule: { type: 'xp_threshold', threshold: 500, description: 'Reach 500 XP' }, createdBy: adminUser._id },
      { name: 'Sustainability Sentinel', description: 'Earn 1500 XP by actively participating across MERN platform', icon: '🛡️', rarity: 'Rare', unlockRule: { type: 'xp_threshold', threshold: 1500, description: 'Reach 1500 XP' }, createdBy: adminUser._id },
      { name: 'CSR Pioneer', description: 'Complete 3 approved community or CSR volunteering activities', icon: '🤝', rarity: 'Epic', unlockRule: { type: 'csr_activities', threshold: 3, description: 'Complete 3 CSR activities' }, createdBy: adminUser._id },
      { name: 'Challenge Master', description: 'Complete 5 organizational sustainability challenges', icon: '🏆', rarity: 'Legendary', unlockRule: { type: 'challenges_completed', threshold: 5, description: 'Complete 5 challenges' }, createdBy: adminUser._id },
    ]);

    // 6. Create Rewards
    console.log('Seeding Rewards...');
    await Reward.create([
      { name: 'Eco Coffee Mug', description: 'Reusable bamboo coffee mug with EcoSphere logo', pointsRequired: 200, stock: 50, category: 'Product', status: 'Active', createdBy: adminUser._id },
      { name: 'Rs. 500 Amazon Gift Voucher', description: 'Digital Amazon voucher for sustainable products', pointsRequired: 500, stock: 20, category: 'Voucher', status: 'Active', createdBy: adminUser._id },
      { name: 'Plant a Tree', description: 'EcoSphere will plant a tree in your name with a certificate', pointsRequired: 300, stock: 100, category: 'Recognition', status: 'Active', createdBy: adminUser._id },
      { name: 'Additional Half-Day Off', description: 'One half-day paid leave certificate', pointsRequired: 1000, stock: 5, category: 'Time Off', status: 'Active', createdBy: adminUser._id },
    ]);

    // 7. Create Challenges
    console.log('Seeding Challenges...');
    await Challenge.create([
      { title: 'Zero Waste Week', description: 'Minimize single-use plastic waste for one full week at work.', difficulty: 'Medium', category: categories[2]._id, targetDepartment: engDept._id, xpReward: 150, pointsReward: 100, maxParticipants: 30, status: 'Active', deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), createdBy: adminUser._id },
      { title: 'Carpool & Cycle', description: 'Commute to work by cycling, walking, or carpooling with colleagues.', difficulty: 'Easy', category: categories[1]._id, xpReward: 100, pointsReward: 50, maxParticipants: 50, status: 'Active', deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), createdBy: adminUser._id },
      { title: 'Digital Clean-up', description: 'Clean up old files, emails, and cloud storage to reduce data center power.', difficulty: 'Easy', category: categories[0]._id, xpReward: 80, pointsReward: 30, maxParticipants: 100, status: 'Active', deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), createdBy: adminUser._id },
    ]);

    // 8. Create CSR Activities
    console.log('Seeding CSR Activities...');
    await CSRActivity.create([
      { title: 'Beach Cleanup Drive', description: 'Help clean up local beach and sort plastics for recycling.', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), location: 'Marine Drive Beach', pointsAwarded: 120, maxParticipants: 20, status: 'Open', category: categories[3]._id, organizer: adminUser._id },
      { title: 'Blood Donation Camp', description: 'Annual community health and blood donation drive.', date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), location: 'Main Office Cafeteria', pointsAwarded: 100, maxParticipants: 40, status: 'Open', category: categories[4]._id, organizer: adminUser._id },
    ]);

    // 9. Environmental Goals
    console.log('Seeding Goals...');
    await EnvironmentalGoal.create([
      { name: 'Reduce Energy Consumption by 10%', description: 'Decrease monthly electricity usage across Engineering department.', department: engDept._id, targetCO2: 5000, currentCO2: 1500, deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), status: 'On Track', createdBy: adminUser._id },
      { name: 'Commute emission reduction target', description: 'Aim to reduce overall commuting footprint.', department: hrDept._id, targetCO2: 2000, currentCO2: 500, deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), status: 'Active', createdBy: adminUser._id },
    ]);

    // 10. Seed Employee Users
    console.log('Seeding Employees...');
    const employees = await User.create([
      { name: 'Jane Doe', email: 'jane@ecosphere.com', password: 'Password123', role: 'employee', employeeId: 'EMP002', designation: 'HR Coordinator', department: hrDept._id, xp: 450, points: 350, isEmailVerified: true },
      { name: 'John Smith', email: 'john@ecosphere.com', password: 'Password123', role: 'employee', employeeId: 'EMP003', designation: 'Software Engineer', department: engDept._id, xp: 780, points: 620, isEmailVerified: true },
      { name: 'Alice Johnson', email: 'alice@ecosphere.com', password: 'Password123', role: 'employee', employeeId: 'EMP004', designation: 'Account Executive', department: salesDept._id, xp: 300, points: 250, isEmailVerified: true },
      { name: 'Bob Wilson', email: 'bob@ecosphere.com', password: 'Password123', role: 'manager', employeeId: 'EMP005', designation: 'Operations Manager', department: opsDept._id, xp: 950, points: 800, isEmailVerified: true },
    ]);

    // 11. Seed Carbon Transactions (Emissions)
    console.log('Seeding Carbon Transactions...');
    const now = new Date();
    const mockTransactions = [];

    // Helper to generate dates in previous months
    const getPastDate = (monthsAgo, day) => {
      const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo, day);
      return d;
    };

    // Monthly data across last 6 months (5 months ago to 0 months ago)
    for (let i = 5; i >= 0; i--) {
      depts.forEach((dept) => {
        // Scope 1: Diesel Generators / Combustions
        mockTransactions.push({
          department: dept._id,
          sourceType: 'Energy',
          scope: 'Scope 1',
          quantity: 200 + Math.floor(Math.random() * 100),
          unit: 'litres',
          co2Equivalent: 500 + Math.floor(Math.random() * 250),
          createdBy: employees[1]._id,
          transactionDate: getPastDate(i, 5),
          notes: `${dept.name} diesel generator backup fuel (Diesel)`,
        });

        // Scope 2: Purchased Electricity
        mockTransactions.push({
          department: dept._id,
          sourceType: 'Energy',
          scope: 'Scope 2',
          quantity: 1200 + Math.floor(Math.random() * 800),
          unit: 'kWh',
          co2Equivalent: 980 + Math.floor(Math.random() * 650),
          createdBy: employees[3]._id,
          transactionDate: getPastDate(i, 15),
          notes: `${dept.name} utility electrical bill`,
        });

        // Scope 3: Air Travel / Employee Commute
        mockTransactions.push({
          department: dept._id,
          sourceType: 'Fleet',
          scope: 'Scope 3',
          quantity: 1500 + Math.floor(Math.random() * 1000),
          unit: 'km',
          co2Equivalent: 270 + Math.floor(Math.random() * 180),
          createdBy: employees[0]._id,
          transactionDate: getPastDate(i, 20),
          notes: `${dept.name} employee commuting distances (Car)`,
        });
      });
    }

    await CarbonTransaction.create(mockTransactions);

    // 12. Seed ESG Policies
    console.log('Seeding ESG Policies...');
    const policies = await ESGPolicy.create([
      { title: 'Supplier Code of Conduct', description: 'Mandates sustainable practices, fair labor, and ethical governance standards.', content: 'All suppliers must adhere to waste minimization, fair wage principles, and transparency in supply tracking.', category: 'Governance', status: 'Active', version: 'v1.2', effectiveDate: getPastDate(2, 1), documentUrl: 'https://ik.imagekit.io/ecosphere/supplier_code.pdf', createdBy: adminUser._id },
      { title: 'Sustainable Office Commuting', description: 'Policy supporting hybrid schedules, public transit stipends, and bicycle facilities.', content: 'Employees are encouraged to walk, bike, carpool, or use public transit. Transit passes are subsidized up to 50%.', category: 'Environmental', status: 'Active', version: 'v2.0', effectiveDate: getPastDate(1, 15), documentUrl: 'https://ik.imagekit.io/ecosphere/commute_policy.pdf', createdBy: adminUser._id },
      { title: 'Equal Opportunity and Diversity Policy', description: 'Sets frameworks for anti-harassment and hiring metrics across all branches.', content: 'EcoSphere mandates equal pay review cycles annually and publishes diversity representation audits.', category: 'Social', status: 'Active', version: 'v1.0', effectiveDate: getPastDate(3, 1), documentUrl: 'https://ik.imagekit.io/ecosphere/diversity_policy.pdf', createdBy: adminUser._id },
    ]);

    // 13. Policy Acknowledgements
    console.log('Seeding Policy Acknowledgements...');
    await PolicyAcknowledgement.create([
      { employee: employees[0]._id, policy: policies[0]._id, acknowledgedAt: getPastDate(1, 4) },
      { employee: employees[0]._id, policy: policies[1]._id, acknowledgedAt: getPastDate(1, 4) },
      { employee: employees[1]._id, policy: policies[1]._id, acknowledgedAt: getPastDate(1, 10) },
      { employee: employees[2]._id, policy: policies[0]._id, acknowledgedAt: getPastDate(0, 2) },
      { employee: employees[3]._id, policy: policies[2]._id, acknowledgedAt: getPastDate(0, 1) },
    ]);

    // 14. Seed Audits
    console.log('Seeding Audits...');
    await Audit.create([
      { title: 'Q1 Scope 1 & 2 Emissions Audit', scope: 'Environmental', status: 'Completed', startDate: getPastDate(2, 1), endDate: getPastDate(2, 5), leadAuditor: 'Bob Wilson', findings: 2, recommendations: 'Improve Diesel fuel receipt scanning accuracy; install smart electric meters on main floor.' },
      { title: 'Supply Chain Labor Rights Audit', scope: 'Social', status: 'In Progress', startDate: getPastDate(0, 10), leadAuditor: 'Jane Doe', findings: 0, recommendations: 'Ongoing inspection of supplier assembly facilities.' },
      { title: 'Anti-Corruption compliance check', scope: 'Governance', status: 'Scheduled', startDate: getPastDate(-1, 15), leadAuditor: 'External Consultant' },
    ]);

    // 15. Seed Compliance Issues
    console.log('Seeding Compliance Issues...');
    await ComplianceIssue.create([
      { title: 'Improper e-waste recycling in IT department', description: 'Found old monitors and batteries discarded in standard municipal waste bins.', category: 'Environmental', severity: 'High', status: 'Open', assignee: employees[1]._id, dueDate: getPastDate(-1, 30) },
      { title: 'Missing Conflict Minerals vendor certificates', description: 'Purchasing division failed to acquire compliance declarations from two microchip manufacturers.', category: 'Governance', severity: 'Medium', status: 'In Progress', assignee: employees[2]._id, dueDate: getPastDate(0, 25) },
      { title: 'Warehouse emergency exit path obstruction', description: 'Pallets of paper blocks blocking main evacuation corridor near loading bay.', category: 'Social', severity: 'High', status: 'Resolved', assignee: employees[3]._id, dueDate: getPastDate(1, 5), resolutionNotes: 'Pallets relocated to secondary rack storage. Verified clearance pathway.' },
    ]);

    // 16. Seed Department Scores
    console.log('Seeding Department Scores...');
    await DepartmentScore.create([
      { department: hrDept._id, month: now.getMonth() + 1, year: now.getFullYear(), environmentalScore: 82, socialScore: 95, governanceScore: 88, overallScore: 88.3 },
      { department: engDept._id, month: now.getMonth() + 1, year: now.getFullYear(), environmentalScore: 76, socialScore: 80, governanceScore: 85, overallScore: 80.3 },
      { department: salesDept._id, month: now.getMonth() + 1, year: now.getFullYear(), environmentalScore: 68, socialScore: 88, governanceScore: 78, overallScore: 78.0 },
      { department: opsDept._id, month: now.getMonth() + 1, year: now.getFullYear(), environmentalScore: 90, socialScore: 82, governanceScore: 92, overallScore: 88.0 },
    ]);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
