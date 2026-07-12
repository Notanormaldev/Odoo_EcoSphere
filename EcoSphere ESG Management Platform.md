**==> picture [170 x 54] intentionally omitted <==**

## **EcoSphere: ESG Management Platform** 

## **1. Background** 

Environmental, Social and Governance (ESG) has become a critical aspect of modern businesses. Organizations are expected to monitor carbon emissions, promote employee well-being, and maintain governance compliance. While many ERP systems collect operational data, ESG reporting is often manual, disconnected, and difficult to monitor in real time. 

EcoSphere aims to integrate ESG directly into day-to-day ERP operations by measuring sustainability metrics, encouraging employee participation, and providing meaningful reports for management. 

## **2. Challenge Statement** 

Build an ESG Management Platform that enables organizations to measure, manage and improve their Environmental, Social and Governance performance. 

The platform should integrate operational data, employee participation and compliance activities into a unified dashboard while encouraging sustainability through gamification. 

## **3. Core Modules** 

- **Environmental:** Carbon accounting, emission factors, sustainability goals and carbon reports 

- **Social:** CSR activities, employee participation, diversity metrics and engagement 

- **Governance:** Policies, audits, compliance tracking and governance reports 

- **Gamification:** Challenges, badges, XP, rewards and leaderboards 

## **4. Suggested Data Model** 

The application consists of Master Data and Transactional Data. 

## **Master Data** 

|**Master Data**|||
|---|---|---|
|**Model**|**Purpose**|**Key Fields**|
|**Department**|Organizational hierarchy and ESG|Name, Code, Head,|
||ownership|Parent Department,|
|||Employee Count,|
|||Status|
|**Category**|Shared category values used across|Name, Type (CSR|
||Social and Gamification modules (e.g.,|Activity / Challenge),|
||CSR Activity Category, Challenge|Status|
||Category)||
|Emission|Carbon values used during|-|
|Factor|calculations||
|Product ESG|ESG information linked to products|-|
|Profile|||
|Environmenta|Sustainability targets|-|
|l Goal|||
|ESG Policy|Governance policies|-|
|Badge|Employee achievements|Name, Description,|
|||Unlock Rule, Icon|
|Reward|Redeemable incentives|Name, Description,|
|||Points Required, Stock,|
|||Status|



## **Transactional Data** 

**Model Purpose Key Fields** Carbon Stores calculated - Transaction emissions from ERP operations CSR Activity Social initiatives - organized by the company **Employee** Tracks employee Employee, Activity, Proof, Approval **Participation** involvement in **CSR** Status, Points Earned, Completion Date **Activities only Challenge** Sustainability Title, Category, Description, XP, challenges Difficulty, Evidence Required, Deadline, **Status (Draft / Active / Under Review / Completed / Archived)** Challenge Tracks employee Challenge, Employee, Progress, Proof, Participation progress **within** Approval, XP Awarded **Challenges only** Policy Employee policy - Acknowledgeme acceptance nt Audit Governance audits - Compliance Governance Audit, Severity, Description, **Owner,** Issue violations **Due Date** , Status Department Aggregated ESG Department, Environmental Score, Score performance per Social Score, Governance Score, **Total** department **Score** 

## 

None 

Master Configuration │ ▼ 

Departments · Categories · Emission Factors · Products 

Goals · Policies · Challenges 

│ ▼ Daily Business Operations 

(Purchase • Manufacturing • Expenses • Fleet) │ ▼ Carbon Transactions 

│ ▼ 

Employee Participation (CSR)  ·  Challenge Participation 

Policy Acknowledgements  ·  Audits 

│ 

▼ 

Environmental Score   Social Score   Governance Score 

│ 

▼ 

Department Total Score 

│ 

▼ 

Overall ESG Score 

(weighted average of Department Total Scores - default weighting: 

Environmental 40% / Social 30% / Governance 30%, configurable per organization) 

│ 

▼ 

Organization Dashboard & Reports 

## **6. Expected Features** 

## **Environmental** 

- Configure Emission Factors 

- Calculate Carbon Emissions 

- Department Carbon Tracking 

- Sustainability Goals 

- Environmental Dashboard 

## **Social** 

- CSR Activities 

- Employee Participation 

- Diversity Metrics 

- Training Completion 

## **Governance** 

- ESG Policies 

- Policy Acknowledgements 

- Audits 

- Compliance Issues 

## **Gamification** 

- Challenges (with full lifecycle: Draft → Active → Under Review → Completed, or Archived at any point) 

- XP 

- Badges (auto-awarded when an employee's XP or completed-challenge count satisfies the Badge's Unlock Rule) 

- Rewards (redeemable using earned XP/Points - see Section 8) 

- Leaderboards 

## **Settings & Administration** 

- Departments management 

- Category management 

- ESG Configuration (see business rules below) 

- **Notification Settings** (see Section 8) 

## **7. Reports** 

The platform should generate: 

- Environmental Report 

- Social Report 

- Governance Report 

- ESG Summary Report 

- **Custom Report Builder** - lets users build a report by combining filters below and export it (PDF / Excel / CSV) 

Each report should support filtering by: 

- Department 

- Date Range 

- Module 

- Employee 

- Challenge 

- ESG Category 

## 

The following are **in scope** , not optional, since they directly support core modules: 

- **Reward Redemption:** Employees can redeem earned Points/XP for a Reward from the catalog, subject to stock availability. Redeeming a Reward deducts the corresponding Points from the employee's balance. 

- **Notification System:** The platform sends notifications (in-app and/or email) for at least: new compliance issue raised, CSR/Challenge approval decisions, policy acknowledgement reminders, and badge unlocks. Configurable via Settings → Notification Settings. 

- **Auto Emission Calculation:** When enabled (Settings toggle), Carbon Transactions are calculated automatically from linked Purchase/Manufacturing/Expense/Fleet records using the relevant Emission Factor - no manual entry required. 

- **Evidence Requirement:** When enabled (Settings toggle), CSR Activity participation cannot be marked Approved without an attached proof file. 

- **Badge Auto-Award:** When enabled (Settings toggle), a Badge is automatically assigned to an employee the moment their XP, completed-challenge count, or other tracked metric satisfies that Badge's Unlock Rule - no manual admin action required. 

- **Compliance Issue Ownership:** Every Compliance Issue must have an assigned Owner and a Due Date; issues that pass their Due Date while still Open should be flagged (feeds the Notification System above). 

## **9. Bonus Ideas (Optional)** 

Participants are encouraged to explore additional features such as: 

- Department ESG rankings 

- Smart dashboard visualizations 

- Mobile-responsive interface 

## **Mockup: https://link.excalidraw.com/l/65VNwvy7c4X/2m6lz9Ln4** 

