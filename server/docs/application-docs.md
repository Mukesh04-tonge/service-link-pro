# Service Link Pro - Application Documentation

## Application Overview

**Service Link Pro** is a comprehensive dealership management system designed to streamline vehicle service tracking, insurance renewal management, and customer relationship management for automotive dealerships.

### Purpose
- Track vehicle service schedules and maintenance
- Manage insurance renewal reminders
- Coordinate service agents and their assigned tasks
- Generate reports and analytics
- Automate customer follow-ups

### Technology Stack
- **Frontend**: React with TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend**: Node.js with Express
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT-based custom authentication

---

## User Roles and Permissions

### Admin Role
**Capabilities:**
- Full access to all features
- View all vehicles, service calls, and insurance renewals
- Manage agents (create, edit, deactivate)
- Upload vehicle data in bulk
- View comprehensive reports and analytics
- Assign service calls to agents
- Access all dashboard statistics

**Restrictions:**
- Cannot change password directly (must email support@alpever.space)

### Agent Role
**Capabilities:**
- View assigned service calls and insurance renewals
- Update status of assigned tasks
- Make calls to customers
- View their own performance metrics
- Access limited dashboard showing only their assigned work

**Restrictions:**
- Cannot view other agents' work
- Cannot manage agents
- Cannot upload vehicle data
- Cannot access full reports
- Cannot change password directly (must contact admin)

---

## Core Features

### 1. Dashboard

**Purpose**: Provides an at-a-glance overview of key metrics and urgent tasks.

**Admin Dashboard Shows:**
- Total Vehicles count
- Service Due count
- Service Overdue count
- Insurance Due count
- Calls Today count
- Conversions Today count
- Overdue Services table (top 5)
- Insurance Renewals Due table (top 5)
- Quick Actions: Upload Vehicle Data, Manage Agents, View Reports, Auto-Allocate Work

**Agent Dashboard Shows:**
- Their assigned service calls count
- Their assigned insurance renewals count
- Their calls today
- Their conversions
- List of their assigned overdue services
- List of their assigned insurance renewals

**Navigation**: Accessible from `/dashboard` route

---

### 2. Service Calls Management

**Purpose**: Track and manage vehicle service schedules, follow-ups, and completions.

**Key Fields:**
- Registration Number (Reg No)
- Customer Name
- Customer Phone
- Service Type (e.g., Paid Service, Free Service, General Service)
- Expected Service Date
- Last Service Date
- Status: `planned`, `called`, `confirmed`, `completed`, `cancelled`, `overdue`
- Priority: `high`, `medium`, `low`
- Assigned Agent
- Remarks/Notes

**Workflow:**
1. System identifies vehicles due for service based on last service date and service interval
2. Admin or system assigns service calls to agents
3. Agent calls customer to schedule service
4. Agent updates status: `called` → `confirmed` → `completed`
5. If customer doesn't respond or declines: mark as `cancelled`
6. If service date passes without completion: automatically marked `overdue`

**Agent Actions:**
- View assigned service calls
- Click phone icon to initiate call
- Update call status and remarks
- Mark as confirmed or completed

**Admin Actions:**
- View all service calls
- Filter by status, priority, agent
- Assign/reassign calls to agents
- Bulk operations

**Navigation**: Accessible from `/service-calls` route

---

### 3. Insurance Renewal Management

**Purpose**: Track vehicle insurance expiry dates and manage renewal follow-ups.

**Key Fields:**
- Registration Number
- Customer Name
- Customer Phone
- Policy Number
- Insurance Company
- Policy Expiry Date
- Premium Amount
- Status: `planned`, `called`, `renewed`, `cancelled`
- Assigned Agent
- Remarks

**Workflow:**
1. System identifies vehicles with insurance expiring within 30-60 days
2. Admin assigns insurance renewal calls to agents
3. Agent calls customer to remind about renewal
4. Agent updates status: `called` → `renewed` or `cancelled`
5. System tracks renewal completion

**Agent Actions:**
- View assigned insurance renewals
- Call customers
- Update renewal status
- Add remarks about customer response

**Admin Actions:**
- View all insurance renewals
- Filter by status, expiry date, agent
- Assign renewals to agents
- Track renewal conversion rates

**Navigation**: Accessible from `/insurance` route

---

### 4. Vehicle Management

**Purpose**: Maintain a comprehensive database of all customer vehicles.

**Key Fields:**
- Registration Number (unique identifier)
- Customer Name
- Customer Phone
- Customer Email
- Vehicle Make and Model
- Purchase Date
- Last Service Date
- Next Service Due Date
- Insurance Expiry Date
- VIN (Vehicle Identification Number)
- Additional Notes

**Features:**
- Search vehicles by registration number, customer name, or phone
- View complete vehicle history
- Track service intervals
- Monitor insurance status
- Link to service calls and insurance renewals

**Navigation**: Accessible from `/vehicles` route

---

### 5. Agent Management (Admin Only)

**Purpose**: Manage service agents, their performance, and workload.

**Key Fields:**
- Agent Name
- Email
- Phone
- Status: Active/Inactive
- Assigned Service Calls count
- Assigned Insurance Renewals count
- Performance Metrics:
  - Total Calls Made
  - Conversions
  - Completion Rate

**Features:**
- Create new agent accounts
- Deactivate/activate agents
- View agent performance
- Monitor workload distribution
- Reassign tasks between agents

**Workflow:**
1. Admin creates agent account with email and temporary password
2. Agent logs in and can view assigned tasks
3. Admin monitors agent performance
4. Admin can deactivate agents if needed

**Navigation**: Accessible from `/agents` route (Admin only)

---

### 6. Upload Vehicle Data (Admin Only)

**Purpose**: Bulk upload vehicle data from Excel/CSV files.

**Supported Formats:**
- Excel (.xlsx, .xls)
- CSV (.csv)

**Required Columns:**
- Registration Number
- Customer Name
- Customer Phone
- Vehicle Make
- Vehicle Model
- Purchase Date (optional)
- Last Service Date (optional)
- Insurance Expiry Date (optional)

**Process:**
1. Admin selects file to upload
2. System validates data format
3. System checks for duplicate registration numbers
4. System imports valid records
5. System reports any errors or skipped records

**Validation Rules:**
- Registration number must be unique
- Phone number must be valid (10 digits)
- Dates must be in correct format

**Navigation**: Accessible from `/upload` route (Admin only)

---

### 7. Reports and Analytics (Admin Only)

**Purpose**: Generate insights and performance reports.

**Available Reports:**
- Service Call Conversions (daily, weekly, monthly)
- Insurance Renewal Rates
- Agent Performance Comparison
- Revenue Tracking
- Customer Response Rates
- Overdue Services Trend
- Upcoming Service Schedule

**Visualizations:**
- Bar charts for conversions
- Line graphs for trends
- Pie charts for status distribution
- Agent performance tables

**Export Options:**
- Download as PDF
- Download as Excel
- Print report

**Navigation**: Accessible from `/reports` route (Admin only)

---

### 8. My Calls (Agent View)

**Purpose**: Centralized view for agents to see all their assigned tasks.

**Features:**
- Combined view of service calls and insurance renewals
- Filter by status
- Quick action buttons for calling
- Update status inline
- Add remarks/notes
- View customer details

**Workflow:**
1. Agent logs in and navigates to My Calls
2. Views list of assigned tasks sorted by priority/due date
3. Clicks call button to contact customer
4. Updates status after call
5. Adds remarks about conversation
6. Moves to next task

**Navigation**: Accessible from `/my-calls` route (Agent view)

---

## Authentication and Security

### Login Process
1. User navigates to `/login`
2. Enters email, password, and selects role (Admin/Agent)
3. System validates credentials
4. System checks if role matches user account
5. System generates JWT token
6. User is redirected to dashboard

### Session Management
- JWT tokens expire after 1 day (configurable)
- Token stored in localStorage
- Token included in all API requests via Authorization header
- System validates token on each request
- Invalid/expired tokens redirect to login

### Password Management

**For Agents:**
- Cannot change password directly in the system
- Must contact admin for password reset
- Admin can reset agent password

**For Admins:**
- Cannot change password directly in the system
- Must send email to support@alpever.space for password reset
- Support team will verify identity and reset password

**Security Measures:**
- Passwords are hashed using bcrypt
- Minimum password requirements enforced
- Account lockout after failed attempts
- Inactive accounts cannot log in

---

## Common Workflows

### Workflow 1: Daily Agent Routine
1. Log in to system
2. Navigate to "My Calls"
3. Review assigned service calls and insurance renewals
4. Sort by priority (overdue first)
5. Call customers one by one
6. Update status after each call:
   - If customer confirms: mark as "confirmed"
   - If customer declines: mark as "cancelled" with reason
   - If no answer: mark as "called" and add remark to call back
7. Add detailed remarks for each interaction
8. Check dashboard for performance metrics

### Workflow 2: Admin Weekly Review
1. Log in to system
2. Check dashboard for overall statistics
3. Navigate to Reports
4. Review agent performance
5. Identify underperforming agents
6. Check overdue services
7. Reassign tasks if needed
8. Upload new vehicle data if available
9. Review conversion rates
10. Plan next week's strategy

### Workflow 3: Handling Service Call
1. Agent receives assigned service call
2. Reviews customer details and vehicle information
3. Calls customer using phone number provided
4. Discusses service requirements and schedules appointment
5. Updates status to "confirmed"
6. Adds appointment date and time in remarks
7. After service completion, marks as "completed"
8. System automatically updates last service date

### Workflow 4: Insurance Renewal Follow-up
1. System identifies insurance expiring in 30 days
2. Admin assigns renewal call to agent
3. Agent calls customer to remind about expiry
4. Agent provides renewal options and pricing
5. If customer agrees: mark as "renewed" and update policy details
6. If customer declines: mark as "cancelled" with reason
7. If customer needs time: mark as "called" and schedule follow-up

---

## Status Definitions

### Service Call Statuses
- **planned**: Service call created but not yet contacted
- **called**: Customer has been called, awaiting response
- **confirmed**: Customer confirmed service appointment
- **completed**: Service completed successfully
- **cancelled**: Customer declined or cancelled service
- **overdue**: Service date passed without completion

### Insurance Renewal Statuses
- **planned**: Renewal reminder created but not yet contacted
- **called**: Customer has been called about renewal
- **renewed**: Customer renewed insurance policy
- **cancelled**: Customer declined renewal or switched provider

### Priority Levels
- **high**: Urgent, requires immediate attention (e.g., overdue services)
- **medium**: Important, should be addressed soon
- **low**: Normal priority, can be scheduled flexibly

---

## Troubleshooting

### Issue: Cannot Log In
**Solution:**
1. Verify email and password are correct
2. Ensure correct role is selected (Admin/Agent)
3. Check if account is active (contact admin if agent)
4. Clear browser cache and try again
5. If still failing, contact support@alpever.space

### Issue: Not Seeing Assigned Calls (Agent)
**Solution:**
1. Refresh the page
2. Check if logged in with correct account
3. Verify with admin that calls are assigned to you
4. Check "My Calls" page instead of "Service Calls"

### Issue: Cannot Update Status
**Solution:**
1. Check internet connection
2. Refresh the page and try again
3. Verify you have permission to update (must be assigned agent)
4. If error persists, contact admin

### Issue: Upload Failed (Admin)
**Solution:**
1. Verify file format is Excel or CSV
2. Check that all required columns are present
3. Ensure registration numbers are unique
4. Verify phone numbers are in correct format (10 digits)
5. Check for special characters in data
6. Try uploading smaller batches

### Issue: Reports Not Loading (Admin)
**Solution:**
1. Check internet connection
2. Refresh the page
3. Try selecting different date range
4. Clear browser cache
5. If issue persists, contact support@alpever.space

---

## Support Contact

For technical issues, feature requests, or account problems:
- **Email**: support@alpever.space
- **Response Time**: Within 24 hours on business days

For password reset requests:
- **Agents**: Contact your admin
- **Admins**: Email support@alpever.space with your registered email address

---

## System Requirements

### Browser Compatibility
- Chrome (recommended, latest version)
- Firefox (latest version)
- Safari (latest version)
- Edge (latest version)

### Internet Connection
- Minimum 2 Mbps for smooth operation
- Stable connection required for real-time updates

### Screen Resolution
- Minimum: 1280x720
- Recommended: 1920x1080 or higher
- Mobile responsive (works on tablets and phones)

---

## Best Practices

### For Agents
1. Log in at start of shift and check assigned tasks
2. Prioritize overdue and high-priority calls
3. Always add detailed remarks after each call
4. Update status immediately after customer interaction
5. Follow up on "called" status within 24-48 hours
6. Be professional and courteous in all customer interactions
7. Report any issues to admin promptly

### For Admins
1. Review dashboard daily for overall health
2. Distribute workload evenly among agents
3. Monitor agent performance weekly
4. Upload new vehicle data regularly
5. Follow up on overdue services
6. Generate reports monthly for management
7. Keep agent accounts updated (activate/deactivate as needed)
8. Respond to agent queries promptly

---

## Glossary

- **Reg No**: Registration Number - Unique vehicle identifier
- **Service Call**: Task to contact customer about vehicle service
- **Insurance Renewal**: Task to remind customer about insurance expiry
- **Conversion**: Successful completion of service call or insurance renewal
- **Overdue**: Service or insurance that passed due date without completion
- **Assigned Agent**: Agent responsible for contacting customer
- **JWT**: JSON Web Token - Used for authentication
- **Dashboard**: Main overview page showing key metrics
- **Bulk Upload**: Uploading multiple vehicle records at once

---

*This documentation is maintained by the Service Link Pro development team. Last updated: December 2024*
