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

export const seedData = async (shouldExit = true) => {
  try {
    console.log('Connecting to database...');
    // Only connect if mongoose is not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URI);
    }
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
      organizationName: 'EcoSphere International Corp',
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

    // 2. Create Departments (Expanded to 8 Departments)
    console.log('Seeding Departments...');
    const depts = await Department.create([
      { name: 'Human Resources', code: 'HR', employeeCount: 18, status: 'active', head: adminUser._id },
      { name: 'Engineering', code: 'ENG', employeeCount: 65, status: 'active', head: adminUser._id },
      { name: 'Sales & Marketing', code: 'SALES', employeeCount: 32, status: 'active', head: adminUser._id },
      { name: 'Operations', code: 'OPS', employeeCount: 42, status: 'active', head: adminUser._id },
      { name: 'Finance & Accounts', code: 'FIN', employeeCount: 12, status: 'active', head: adminUser._id },
      { name: 'Procurement & Logistics', code: 'SCM', employeeCount: 15, status: 'active', head: adminUser._id },
      { name: 'Research & Development', code: 'RND', employeeCount: 22, status: 'active', head: adminUser._id },
      { name: 'Legal & Compliance', code: 'LEGAL', employeeCount: 8, status: 'active', head: adminUser._id }
    ]);

    const hrDept = depts[0];
    const engDept = depts[1];
    const salesDept = depts[2];
    const opsDept = depts[3];
    const finDept = depts[4];
    const scmDept = depts[5];
    const rndDept = depts[6];
    const legalDept = depts[7];

    // 3. Create Categories
    console.log('Seeding Categories...');
    const categories = await Category.create([
      { name: 'Energy', type: 'Emission', icon: '⚡', description: 'Electricity and heating consumption' },
      { name: 'Transport', type: 'Emission', icon: '🚗', description: 'Business travel and commuting' },
      { name: 'Waste & Water', type: 'Emission', icon: '💧', description: 'Water usage and recycling waste' },
      { name: 'Community Outreach', type: 'CSR Activity', icon: '🤝', description: 'Volunteering and local outreach' },
      { name: 'Well-being', type: 'CSR Activity', icon: '❤️', description: 'Employee health, safety and social initiatives' },
      { name: 'Corporate Ethics', type: 'General', icon: '📋', description: 'Corporate governance and compliance standards' },
    ]);

    // 4. Create Emission Factors
    console.log('Seeding Emission Factors...');
    await EmissionFactor.create([
      { name: 'Grid Electricity', category: 'Energy', factor: 0.85, unit: 'kg CO2e / kWh', scope: 'Scope 2', source: 'National Grid GHG report' },
      { name: 'Natural Gas Heating', category: 'Energy', factor: 2.02, unit: 'kg CO2e / m3', scope: 'Scope 1', source: 'EPA Emission Factors Guide' },
      { name: 'Petrol Car Commute', category: 'Fleet', factor: 0.21, unit: 'kg CO2e / km', scope: 'Scope 3', source: 'DEFRA GHG factors' },
      { name: 'Flights (Short haul)', category: 'Fleet', factor: 0.15, unit: 'kg CO2e / km', scope: 'Scope 3', source: 'ICAO Carbon Calculator' },
      { name: 'Flights (Long haul)', category: 'Fleet', factor: 0.27, unit: 'kg CO2e / km', scope: 'Scope 3', source: 'ICAO Carbon Calculator' },
      { name: 'Water Usage', category: 'Waste', factor: 0.34, unit: 'kg CO2e / m3', scope: 'Scope 3', source: 'Water UK statistics' },
      { name: 'Landfill Waste Disposal', category: 'Waste', factor: 0.58, unit: 'kg CO2e / kg', scope: 'Scope 3', source: 'EPA Waste Factors' },
    ]);

    // 5. Create Badges
    console.log('Seeding Badges...');
    const badges = await Badge.create([
      { name: 'Green Recruit', description: 'Complete email verification and start your sustainability journey', icon: '🌱', rarity: 'Common', unlockRule: { type: 'xp_threshold', threshold: 100, description: 'Reach 100 XP' }, createdBy: adminUser._id },
      { name: 'Eco Champion', description: 'Unlock 500 XP to prove your environmental dedication', icon: '🌿', rarity: 'Uncommon', unlockRule: { type: 'xp_threshold', threshold: 500, description: 'Reach 500 XP' }, createdBy: adminUser._id },
      { name: 'Sustainability Sentinel', description: 'Earn 1500 XP by actively participating across MERN platform', icon: '🛡️', rarity: 'Rare', unlockRule: { type: 'xp_threshold', threshold: 1500, description: 'Reach 1500 XP' }, createdBy: adminUser._id },
      { name: 'CSR Pioneer', description: 'Complete 3 approved community or CSR volunteering activities', icon: '🤝', rarity: 'Epic', unlockRule: { type: 'csr_activities', threshold: 3, description: 'Complete 3 CSR activities' }, createdBy: adminUser._id },
      { name: 'Challenge Master', description: 'Complete 5 organizational sustainability challenges', icon: '🏆', rarity: 'Legendary', unlockRule: { type: 'challenges_completed', threshold: 5, description: 'Complete 5 challenges' }, createdBy: adminUser._id },
      { name: 'Carbon Slash Specialist', description: 'Log carbon reductions in 3 consecutive months', icon: '⚡', rarity: 'Epic', unlockRule: { type: 'custom', threshold: 3, description: 'Reduce carbon 3 times' }, createdBy: adminUser._id },
    ]);

    // 6. Create Rewards
    console.log('Seeding Rewards...');
    await Reward.create([
      { name: 'Eco Bamboo Travel Mug', description: 'Reusable bamboo coffee mug with EcoSphere logo engraving', pointsRequired: 150, stock: 120, category: 'Product', status: 'Active', createdBy: adminUser._id },
      { name: 'Organic Cotton Canvas Tote', description: 'Strong organic tote bag perfect for zero-waste shopping trips', pointsRequired: 100, stock: 80, category: 'Product', status: 'Active', createdBy: adminUser._id },
      { name: 'Rs. 500 Amazon Gift Voucher', description: 'Digital Amazon voucher for purchasing verified eco-friendly goods', pointsRequired: 500, stock: 45, category: 'Voucher', status: 'Active', createdBy: adminUser._id },
      { name: 'Rs. 1000 BookMyShow Voucher', description: 'Entertainment gift card for weekend movies and plays', pointsRequired: 800, stock: 30, category: 'Voucher', status: 'Active', createdBy: adminUser._id },
      { name: 'Plant a Cedar Tree', description: 'EcoSphere plants a tree in your name with GPS tracking details', pointsRequired: 250, stock: 500, category: 'Recognition', status: 'Active', createdBy: adminUser._id },
      { name: 'Extra Off-Site Volunteering Day', description: 'Get 1 paid day off to volunteer for an NGO of your choice', pointsRequired: 1200, stock: 15, category: 'Time Off', status: 'Active', createdBy: adminUser._id },
      { name: 'Executive Mentorship Session', description: '1-hour career development meeting with the Chief Sustainability Officer', pointsRequired: 1500, stock: 10, category: 'Recognition', status: 'Active', createdBy: adminUser._id },
    ]);

    // 7. Create Challenges (Expanded to 8 Challenges)
    console.log('Seeding Challenges...');
    const now = new Date();
    const mockChallenges = await Challenge.create([
      { title: 'Zero Waste Week', description: 'Minimize single-use plastic waste for one full week at work.', difficulty: 'Medium', category: categories[2]._id, targetDepartment: engDept._id, xpReward: 150, pointsReward: 100, maxParticipants: 40, status: 'Active', deadline: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000), createdBy: adminUser._id },
      { title: 'Carpool & Cycle Commute', description: 'Commute to work by cycling, walking, or carpooling with colleagues.', difficulty: 'Easy', category: categories[1]._id, xpReward: 100, pointsReward: 50, maxParticipants: 80, status: 'Active', deadline: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000), createdBy: adminUser._id },
      { title: 'Digital Clean-up Drive', description: 'Clean up old files, duplicate emails, and cloud storage to lower server load.', difficulty: 'Easy', category: categories[0]._id, xpReward: 80, pointsReward: 30, maxParticipants: 150, status: 'Active', deadline: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000), createdBy: adminUser._id },
      { title: 'Paperless Office Challenge', description: 'Transition completely to electronic signatures and digital documents.', difficulty: 'Medium', category: categories[2]._id, targetDepartment: legalDept._id, xpReward: 200, pointsReward: 120, maxParticipants: 30, status: 'Active', deadline: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), createdBy: adminUser._id },
      { title: 'Energy Saver Audit', description: 'Turn off all unused screens, appliances, and chargers before leaving.', difficulty: 'Easy', category: categories[0]._id, xpReward: 60, pointsReward: 40, maxParticipants: 100, status: 'Active', deadline: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000), createdBy: adminUser._id },
      { title: 'Healthy Habits Initiative', description: 'Walk at least 8,000 steps daily during work breaks.', difficulty: 'Easy', category: categories[4]._id, xpReward: 90, pointsReward: 60, maxParticipants: 120, status: 'Active', deadline: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000), createdBy: adminUser._id }
    ]);

    // 8. Create CSR Activities (Expanded to 6 CSR Activities)
    console.log('Seeding CSR Activities...');
    const csrActivities = await CSRActivity.create([
      { title: 'Beach Cleanup & Plastics Sorting', description: 'Help clean up local beach and sort plastics for recycling.', date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), location: 'Marine Drive Beachfront', pointsAwarded: 120, maxParticipants: 30, status: 'Open', category: categories[3]._id, organizer: adminUser._id },
      { title: 'Annual Office Blood Donation Camp', description: 'Help community hospitals by donating blood during our camp.', date: new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000), location: 'Main Headquarters Hall A', pointsAwarded: 100, maxParticipants: 60, status: 'Open', category: categories[4]._id, organizer: adminUser._id },
      { title: 'Tree Plantation & Foresting Drive', description: 'Plant native saplings in urban park boundaries.', date: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000), location: 'Central Reserve Forest Area', pointsAwarded: 150, maxParticipants: 40, status: 'Open', category: categories[3]._id, organizer: adminUser._id },
      { title: 'E-Waste Recycling Drop-off', description: 'Bring old chargers, cables, and broken electronic toys for sorting.', date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), location: 'Office Entrance Bin', pointsAwarded: 80, maxParticipants: 100, status: 'Completed', category: categories[3]._id, organizer: adminUser._id },
      { title: 'Mentoring Underprivileged Youth', description: 'Introductory coding and business literacy sessions for local youth.', date: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000), location: 'City NGO Center', pointsAwarded: 200, maxParticipants: 15, status: 'Open', category: categories[3]._id, organizer: adminUser._id },
    ]);

    // 9. Environmental Goals (Expanded to 5 Goals)
    console.log('Seeding Goals...');
    await EnvironmentalGoal.create([
      { name: 'Reduce Energy Consumption by 10%', description: 'Decrease monthly electricity usage across Engineering department.', department: engDept._id, targetCO2: 6000, currentCO2: 2400, deadline: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), status: 'On Track', createdBy: adminUser._id },
      { name: 'Commute Emissions Reduction Target', description: 'Aim to reduce overall commuting carbon footprints by promoting public transport.', department: hrDept._id, targetCO2: 2500, currentCO2: 1200, deadline: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000), status: 'On Track', createdBy: adminUser._id },
      { name: 'Zero Plastic Compliance Goal', description: 'Enforce 100% biodegradable packaging in operations.', department: opsDept._id, targetCO2: 4000, currentCO2: 3800, deadline: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000), status: 'At Risk', createdBy: adminUser._id },
      { name: 'Logistics fuel containment', description: 'Optimize dispatch routes to lower diesel engine carbon contributions.', department: scmDept._id, targetCO2: 10000, currentCO2: 4500, deadline: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000), status: 'On Track', createdBy: adminUser._id }
    ]);

    // 10. Seed Employee Users (Expanded to 20 Users)
    console.log('Seeding Employees...');
    const employees = await User.create([
      // Managers
      { name: 'Jane Doe', email: 'jane@ecosphere.com', password: 'Password123', role: 'manager', employeeId: 'EMP002', designation: 'HR Director', department: hrDept._id, xp: 620, points: 500, isEmailVerified: true },
      { name: 'Bob Wilson', email: 'bob@ecosphere.com', password: 'Password123', role: 'manager', employeeId: 'EMP005', designation: 'Operations Manager', department: opsDept._id, xp: 1200, points: 1100, isEmailVerified: true },
      { name: 'Sara Khanna', email: 'sara@ecosphere.com', password: 'Password123', role: 'manager', employeeId: 'EMP006', designation: 'R&D Principal Lead', department: rndDept._id, xp: 950, points: 820, isEmailVerified: true },
      { name: 'Vikram Singh', email: 'vikram@ecosphere.com', password: 'Password123', role: 'manager', employeeId: 'EMP007', designation: 'SCM Logistics Lead', department: scmDept._id, xp: 880, points: 740, isEmailVerified: true },
      
      // Employees
      { name: 'John Smith', email: 'john@ecosphere.com', password: 'Password123', role: 'employee', employeeId: 'EMP003', designation: 'Senior Software Engineer', department: engDept._id, xp: 1650, points: 1300, isEmailVerified: true },
      { name: 'Alice Johnson', email: 'alice@ecosphere.com', password: 'Password123', role: 'employee', employeeId: 'EMP004', designation: 'Marketing Lead', department: salesDept._id, xp: 450, points: 300, isEmailVerified: true },
      { name: 'Dev Patel', email: 'dev@ecosphere.com', password: 'Password123', role: 'employee', employeeId: 'EMP008', designation: 'Full Stack Developer', department: engDept._id, xp: 820, points: 600, isEmailVerified: true },
      { name: 'Priya Sharma', email: 'priya@ecosphere.com', password: 'Password123', role: 'employee', employeeId: 'EMP009', designation: 'HR Executive', department: hrDept._id, xp: 250, points: 180, isEmailVerified: true },
      { name: 'Rahul Mehta', email: 'rahul@ecosphere.com', password: 'Password123', role: 'employee', employeeId: 'EMP010', designation: 'Financial Analyst', department: finDept._id, xp: 350, points: 280, isEmailVerified: true },
      { name: 'Nisha Gupta', email: 'nisha@ecosphere.com', password: 'Password123', role: 'employee', employeeId: 'EMP011', designation: 'Compliance Officer', department: legalDept._id, xp: 720, points: 550, isEmailVerified: true },
      { name: 'Amit Verma', email: 'amit@ecosphere.com', password: 'Password123', role: 'employee', employeeId: 'EMP012', designation: 'R&D Researcher', department: rndDept._id, xp: 480, points: 380, isEmailVerified: true },
      { name: 'Rohan Deshmukh', email: 'rohan@ecosphere.com', password: 'Password123', role: 'employee', employeeId: 'EMP013', designation: 'Warehouse Supervisor', department: opsDept._id, xp: 600, points: 450, isEmailVerified: true },
      { name: 'Sanjay Dutt', email: 'sanjay@ecosphere.com', password: 'Password123', role: 'employee', employeeId: 'EMP014', designation: 'Logistics Analyst', department: scmDept._id, xp: 300, points: 200, isEmailVerified: true },
      { name: 'Deepa Roy', email: 'deepa@ecosphere.com', password: 'Password123', role: 'employee', employeeId: 'EMP015', designation: 'UX Designer', department: engDept._id, xp: 550, points: 400, isEmailVerified: true },
      { name: 'Karan Johar', email: 'karan@ecosphere.com', password: 'Password123', role: 'employee', employeeId: 'EMP016', designation: 'PR Consultant', department: salesDept._id, xp: 210, points: 150, isEmailVerified: true },
      { name: 'Kabir Sen', email: 'kabir@ecosphere.com', password: 'Password123', role: 'employee', employeeId: 'EMP017', designation: 'Frontend Engineer', department: engDept._id, xp: 1100, points: 950, isEmailVerified: true },
      { name: 'Pooja Hegde', email: 'pooja@ecosphere.com', password: 'Password123', role: 'employee', employeeId: 'EMP018', designation: 'Legal Advisor', department: legalDept._id, xp: 410, points: 320, isEmailVerified: true },
      
      // Target Seed Account requested by user:
      { name: 'Dhruv Panchal', email: 'dhruvpanchal0312@gmail.com', password: 'password123', role: 'employee', employeeId: 'EMP001', designation: 'Sustainability Auditor', department: engDept._id, xp: 1550, points: 1200, isEmailVerified: true, bio: 'Sustainability lead auditor at EcoSphere. Dedicated to reducing corporate carbon index.' },
    ]);

    // 11. Seed Carbon Transactions (Emissions) - Expanded to 12 Months of Data
    console.log('Seeding Carbon Transactions (12 Months)...');
    const mockTransactions = [];

    // Helper to generate dates in previous months
    const getPastDate = (monthsAgo, day) => {
      return new Date(now.getFullYear(), now.getMonth() - monthsAgo, day);
    };

    // Monthly data across last 12 months (11 months ago to 0 months ago)
    for (let i = 11; i >= 0; i--) {
      depts.forEach((dept) => {
        // Scope 1: Natural Gas / Backup Diesel Generative systems
        const dieselQty = 150 + Math.floor(Math.random() * 120);
        mockTransactions.push({
          department: dept._id,
          sourceType: 'Energy',
          scope: 'Scope 1',
          quantity: dieselQty,
          unit: 'litres',
          co2Equivalent: Math.round(dieselQty * 2.68), // Diesel emissions factor
          createdBy: employees[0]._id,
          transactionDate: getPastDate(i, 5),
          notes: `${dept.name} backup generator diesel fuel fill`,
        });

        // Scope 2: Purchased Grid Electricity
        const electricityKwh = 1000 + Math.floor(Math.random() * 900);
        mockTransactions.push({
          department: dept._id,
          sourceType: 'Energy',
          scope: 'Scope 2',
          quantity: electricityKwh,
          unit: 'kWh',
          co2Equivalent: Math.round(electricityKwh * 0.85),
          createdBy: employees[1]._id,
          transactionDate: getPastDate(i, 15),
          notes: `${dept.name} monthly grid power supply`,
        });

        // Scope 3: Commuter travel (Petrol cars)
        const commuteKm = 2000 + Math.floor(Math.random() * 1500);
        mockTransactions.push({
          department: dept._id,
          sourceType: 'Fleet',
          scope: 'Scope 3',
          quantity: commuteKm,
          unit: 'km',
          co2Equivalent: Math.round(commuteKm * 0.21),
          createdBy: employees[4]._id,
          transactionDate: getPastDate(i, 20),
          notes: `${dept.name} employee private travel logging`,
        });

        // Scope 3: Water consumption (add water waste)
        const waterM3 = 50 + Math.floor(Math.random() * 80);
        mockTransactions.push({
          department: dept._id,
          sourceType: 'Manual',
          scope: 'Scope 3',
          quantity: waterM3,
          unit: 'm3',
          co2Equivalent: Math.round(waterM3 * 0.34),
          createdBy: employees[5]._id,
          transactionDate: getPastDate(i, 25),
          notes: `${dept.name} utility supply meter flow`,
        });
      });
    }

    await CarbonTransaction.create(mockTransactions);

    // 12. Seed ESG Policies (Expanded to 5 Policies)
    console.log('Seeding ESG Policies...');
    const policies = await ESGPolicy.create([
      { title: 'Supplier Code of Conduct', description: 'Mandates sustainable practices, fair labor, and ethical governance standards.', content: 'All suppliers must adhere to waste minimization, fair wage principles, and transparency in supply tracking.', category: 'Governance', status: 'Active', version: 'v1.2', effectiveDate: getPastDate(2, 1), documentUrl: 'https://ik.imagekit.io/ecosphere/supplier_code.pdf', createdBy: adminUser._id },
      { title: 'Sustainable Office Commuting', description: 'Policy supporting hybrid schedules, public transit stipends, and bicycle facilities.', content: 'Employees are encouraged to walk, bike, carpool, or use public transit. Transit passes are subsidized up to 50%.', category: 'Environmental', status: 'Active', version: 'v2.0', effectiveDate: getPastDate(1, 15), documentUrl: 'https://ik.imagekit.io/ecosphere/commute_policy.pdf', createdBy: adminUser._id },
      { title: 'Equal Opportunity and Diversity Policy', description: 'Sets frameworks for anti-harassment and hiring metrics across all branches.', content: 'EcoSphere mandates equal pay review cycles annually and publishes diversity representation audits.', category: 'Social', status: 'Active', version: 'v1.0', effectiveDate: getPastDate(3, 1), documentUrl: 'https://ik.imagekit.io/ecosphere/diversity_policy.pdf', createdBy: adminUser._id },
      { title: 'Anti-Bribery and Whistleblower Protection', description: 'Whistleblower rules, legal reporting channels and reporting protection frameworks.', content: 'Zero tolerance for bribery, gifts, or kickbacks. Incidents must be raised through legal secure channels.', category: 'Governance', status: 'Active', version: 'v1.5', effectiveDate: getPastDate(4, 12), documentUrl: 'https://ik.imagekit.io/ecosphere/whistleblower.pdf', createdBy: adminUser._id },
      { title: 'Data Privacy and Employee Info Security', description: 'Controls regarding storage, access, and transfer of digital employee identities.', content: 'Compliance frameworks regarding GDPR and local data protection regulations.', category: 'Governance', status: 'Active', version: 'v2.1', effectiveDate: getPastDate(0, 15), documentUrl: 'https://ik.imagekit.io/ecosphere/privacy.pdf', createdBy: adminUser._id }
    ]);

    // 13. Policy Acknowledgements (Expanded)
    console.log('Seeding Policy Acknowledgements...');
    const ackRecords = [];
    employees.forEach((emp, index) => {
      // Each employee acknowledges 2-3 policies randomly
      policies.slice(0, 3).forEach((pol) => {
        if (Math.random() > 0.3) {
          ackRecords.push({
            employee: emp._id,
            policy: pol._id,
            acknowledgedAt: getPastDate(0, 1 + (index % 25))
          });
        }
      });
    });
    await PolicyAcknowledgement.create(ackRecords);

    // 14. Seed Audits (Expanded to 6 Audits)
    console.log('Seeding Audits...');
    await Audit.create([
      { title: 'Q1 Scope 1 & 2 Emissions Audit', department: engDept._id, auditor: employees[1]._id, auditorName: 'Bob Wilson', auditDate: getPastDate(2, 5), scope: 'Environmental', status: 'Completed', findingsCount: 2, findings: 'Improve Diesel fuel receipt scanning accuracy; install smart electric meters on main floor.' },
      { title: 'Supply Chain Labor Rights Audit', department: hrDept._id, auditor: employees[0]._id, auditorName: 'Jane Doe', auditDate: getPastDate(0, 10), scope: 'Social', status: 'In Progress', findingsCount: 0, findings: 'Ongoing inspection of supplier assembly facilities.' },
      { title: 'Anti-Corruption Compliance Check', department: opsDept._id, auditor: adminUser._id, auditorName: 'EcoSphere Admin', auditDate: getPastDate(1, 15), scope: 'Governance', status: 'Scheduled', findingsCount: 0 },
      { title: 'Warehouse Safety & Escape Audit', department: opsDept._id, auditor: employees[3]._id, auditorName: 'Vikram Singh', auditDate: getPastDate(0, 2), scope: 'Social', status: 'Completed', findingsCount: 1, findings: 'Hazardous chemical storage lacks spill safety kits.' },
      { title: 'IT Infrastructure Energy Audit', department: engDept._id, auditor: employees[17]._id, auditorName: 'Dhruv Panchal', auditDate: getPastDate(0, 14), scope: 'Environmental', status: 'Completed', findingsCount: 3, findings: 'Older server arrays consuming 20% more power than modern equivalents.' },
      { title: 'Quarterly Ledger Compliance Review', department: finDept._id, auditor: employees[2]._id, auditorName: 'Sara Khanna', auditDate: getPastDate(0, 8), scope: 'Governance', status: 'In Progress', findingsCount: 0 },
    ]);

    // 15. Seed Compliance Issues (Expanded to 8 Issues)
    console.log('Seeding Compliance Issues...');
    await ComplianceIssue.create([
      { title: 'Improper e-waste recycling in Engineering office', description: 'Found old monitors and batteries discarded in standard municipal waste bins.', department: engDept._id, severity: 'High', status: 'Open', owner: employees[4]._id, dueDate: getPastDate(-1, 30) },
      { title: 'Missing Conflict Minerals vendor certificates', description: 'Purchasing division failed to acquire compliance declarations from two microchip manufacturers.', department: salesDept._id, severity: 'Medium', status: 'In Progress', owner: employees[5]._id, dueDate: getPastDate(0, 25) },
      { title: 'Warehouse emergency exit path obstruction', description: 'Pallets of paper blocks blocking main evacuation corridor near loading bay.', department: opsDept._id, severity: 'High', status: 'Resolved', owner: employees[1]._id, dueDate: getPastDate(1, 5), resolution: 'Pallets relocated to secondary rack storage. Verified clearance pathway.' },
      { title: 'Lack of chemical spill kits in SCM center', description: 'Battery fluid spill kits are missing in battery charging zones.', department: scmDept._id, severity: 'Medium', status: 'Open', owner: employees[3]._id, dueDate: getPastDate(-1, 10) },
      { title: 'Old Server Array Energy Outliers', description: 'Racks 3 and 4 in core data room drawing high idling current.', department: engDept._id, severity: 'Low', status: 'In Progress', owner: employees[17]._id, dueDate: getPastDate(0, 18) },
      { title: 'Mandatory Policy Acknowledgement Laggards', description: 'Three new hires in sales failed to sign Code of Conduct policy past 30 days.', department: salesDept._id, severity: 'Low', status: 'Resolved', owner: employees[0]._id, dueDate: getPastDate(1, 2), resolution: 'Sent manual warnings. Outstanding acknowledgements signed.' }
    ]);

    // 16. Seed Department Scores (Expanded for 8 departments)
    console.log('Seeding Department Scores...');
    const periodString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    await DepartmentScore.create([
      { department: hrDept._id, period: periodString, environmentalScore: 82, socialScore: 95, governanceScore: 88, totalScore: 88 },
      { department: engDept._id, period: periodString, environmentalScore: 76, socialScore: 80, governanceScore: 85, totalScore: 80 },
      { department: salesDept._id, period: periodString, environmentalScore: 68, socialScore: 88, governanceScore: 78, totalScore: 78 },
      { department: opsDept._id, period: periodString, environmentalScore: 90, socialScore: 82, governanceScore: 92, totalScore: 88 },
      { department: finDept._id, period: periodString, environmentalScore: 85, socialScore: 86, governanceScore: 90, totalScore: 87 },
      { department: scmDept._id, period: periodString, environmentalScore: 72, socialScore: 78, governanceScore: 80, totalScore: 76 },
      { department: rndDept._id, period: periodString, environmentalScore: 88, socialScore: 84, governanceScore: 88, totalScore: 87 },
      { department: legalDept._id, period: periodString, environmentalScore: 92, socialScore: 90, governanceScore: 95, totalScore: 93 },
    ]);

    // 17. Seed Employee CSR Participation Records
    console.log('Seeding CSR Participations...');
    await EmployeeParticipation.create([
      { employee: employees[17]._id, activity: csrActivities[3]._id, status: 'Approved', pointsEarned: 80, feedback: 'Brought 4 old laptop batteries and a CRT display monitor.' },
      { employee: employees[4]._id, activity: csrActivities[3]._id, status: 'Approved', pointsEarned: 80 },
      { employee: employees[1]._id, activity: csrActivities[3]._id, status: 'Approved', pointsEarned: 80 },
      { employee: employees[17]._id, activity: csrActivities[0]._id, status: 'Registered' },
      { employee: employees[5]._id, activity: csrActivities[0]._id, status: 'Registered' },
      { employee: employees[6]._id, activity: csrActivities[1]._id, status: 'Registered' },
    ]);

    // 18. Seed Employee Challenge Participation Records
    console.log('Seeding Challenge Participations...');
    await ChallengeParticipation.create([
      { employee: employees[17]._id, challenge: mockChallenges[0]._id, status: 'Completed', completedAt: getPastDate(0, 10), pointsEarned: 100, xpEarned: 150 },
      { employee: employees[4]._id, challenge: mockChallenges[0]._id, status: 'Completed', completedAt: getPastDate(0, 11), pointsEarned: 100, xpEarned: 150 },
      { employee: employees[17]._id, challenge: mockChallenges[1]._id, status: 'Joined' },
      { employee: employees[5]._id, challenge: mockChallenges[1]._id, status: 'Joined' },
      { employee: employees[6]._id, challenge: mockChallenges[2]._id, status: 'Joined' },
      { employee: employees[17]._id, challenge: mockChallenges[3]._id, status: 'Joined' }
    ]);

    console.log('Seeding completed successfully!');
    if (shouldExit) process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    if (shouldExit) process.exit(1);
    throw error;
  }
};

// Check if run directly
if (import.meta.url === `file://${process.argv[1]}` || (process.argv[1] && process.argv[1].endsWith('seed.js'))) {
  seedData(true);
}
