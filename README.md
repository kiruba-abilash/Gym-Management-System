# Gym Management System

A web-based Gym Management System developed to manage the daily activities of a gym.

## Features

- Admin Login
- Logout
- Password hashing using bcrypt
- Session-based authentication
- Protected admin routes
- Dashboard with summary counts
- Member Management
- Trainer Management
- Package Management
- Membership Management
- Attendance Management
- Payment Management
- Reports
- Search and Filter
- Input Validation
- Responsive Design
- MySQL Database Integration

## Technologies Used

### Frontend

- HTML
- CSS
- JavaScript

### Backend

- Node.js
- Express.js

### Database

- MySQL

### Security

- bcrypt
- express-session

## Main Modules

1. Dashboard
2. Members
3. Trainers
4. Packages
5. Memberships
6. Attendance
7. Payments
8. Reports

## CRUD Operations

The system supports CRUD operations where applicable.

- Create
- Read
- Update
- Delete

CRUD functionality is implemented in modules such as:

- Members
- Trainers
- Packages
- Memberships

## Authentication and Security

The system uses session-based authentication.

- Admin users must log in before accessing protected functions.
- Passwords are stored securely using bcrypt hashing.
- Protected API routes use authentication middleware.
- Unauthorized users receive a login-required response.
- Sessions are used to maintain the authenticated login state.

## Input Validation

Validation is implemented for important fields such as:

- Member name
- Phone number
- Email address
- Date of birth
- Trainer name
- Trainer phone number
- Trainer salary
- Package duration
- Package price
- Membership dates
- Attendance date
- Payment amount

## Search and Filter

The Members page includes a search/filter feature.

Members can be searched using:

- Name
- Phone number
- Email address

## Dashboard

The dashboard displays summary information such as:

- Total Members
- Total Trainers
- Total Packages
- Total Memberships
- Total Attendance Records
- Total Payments

The dashboard also includes a professional and responsive user interface.

## Member Management

The Member Management module allows the admin to:

- Add members
- View members
- Edit member details
- Delete members
- Search members

Member details include:

- Name
- Phone
- Email
- Gender
- Date of Birth
- Joined Date

## Trainer Management

The Trainer Management module allows the admin to:

- Add trainers
- View trainers
- Edit trainer details
- Delete trainers

Trainer details include:

- Name
- Phone
- Specialization
- Salary

## Package Management

The Package Management module allows the admin to:

- Add packages
- View packages
- Edit packages
- Delete packages

Package details include:

- Package Name
- Duration
- Price

## Membership Management

The Membership Management module connects members with gym packages.

Membership details include:

- Member
- Package
- Start Date
- End Date
- Status

The system validates membership dates to prevent an end date from being before the start date.

## Attendance Management

The Attendance Management module allows the admin to record member attendance.

Attendance details include:

- Member
- Attendance Date
- Check-in Time

The system prevents duplicate attendance records for the same member on the same date.

## Payment Management

The system supports payment management.

Payment details include:

- Member
- Amount
- Payment Date
- Payment Method

The system validates the payment amount before storing the payment.

## Reports

The Reports module provides information such as:

- Total Members
- Total Trainers
- Total Packages
- Total Memberships
- Total Attendance
- Total Payments
- Total Revenue
- Payment Report
- Attendance Report

## Payment Workflow

The payment workflow includes:

1. Select a member
2. Enter the payment amount
3. Select the payment date
4. Select the payment method
5. Save the payment
6. Store the payment in MySQL
7. Display the payment in the Payments module
8. Update revenue information in Reports

## Database

Database Name:

```text
gym_management
