# Digital Juristic Management Platform for Housing Estates

A comprehensive role-based web application for managing maintenance, complaints, task dispatching, and operational analytics in housing estates.

## Overview

JuristicPro is a modern, professional, and trustworthy management system designed with a blue/navy corporate theme. The platform provides role-specific dashboards and features for four distinct user types.

## User Roles

### 1. Resident (Homeowner)
- Submit maintenance requests with category, priority, and images
- Track request status with timeline visualization
- View assigned technician information
- Approve completed work
- Approve/reject deadline extension requests
- Receive notifications for updates

### 2. Juristic Officer / Dispatcher
- Review and approve maintenance requests
- Assign tasks to technicians
- Bulk operations for request management
- View operational analytics and KPIs
- Monitor technician performance
- Track response times and completion rates

### 3. Technician
- View assigned tasks and daily schedule
- Update task status (start, in-progress, complete)
- Upload before/after images
- Add work notes
- Request deadline extensions
- Track personal performance metrics

### 4. System Administrator
- Manage users (add, edit, delete)
- Configure system settings
- Generate reports (maintenance, performance, user activity)
- Monitor system health and activity
- View comprehensive analytics

## Features

### Authentication & Access Control
- Role-based login system
- Demo accounts for testing:
  - Resident: `resident@demo.com`
  - Officer: `officer@demo.com`
  - Technician: `technician@demo.com`
  - Admin: `admin@demo.com`
  - Password: `demo`
- Profile management with role badges
- OAuth-style login UI (conceptual)

### Global Features
- Top navigation with user profile and notifications
- Real-time notification system
- Announcement modal on dashboard entry
- Color-coded status indicators
- Responsive desktop-first design
- Consistent layout across all roles

### Resident Features
- **Dashboard**: Summary of requests and quick actions
- **New Request Form**: Category selection, location, priority, description, image upload
- **Request Tracking**: List view with filters and search
- **Request Details**: Timeline, technician info, before/after images
- **Approval System**: Approve work and extension requests

### Officer Features
- **Dashboard**: Overview of pending requests and active technicians
- **Request Management**: Bulk approve/reject, filtering, search
- **Task Dispatch**: Assign tasks to technicians with scheduling
- **Analytics**: Performance metrics, charts, technician statistics

### Technician Features
- **Dashboard**: Today's schedule and performance stats
- **My Tasks**: Filter by status, view all assignments
- **Task Details**: Complete tasks, upload photos, add notes
- **Extension Requests**: Request deadline extensions with reasons

### Admin Features
- **Dashboard**: System overview with activity logs
- **User Management**: CRUD operations for all users
- **System Settings**: Configure notifications, email, maintenance rules
- **Reports**: Export data in PDF/Excel formats

## Technology Stack

- **Framework**: React with TypeScript
- **Routing**: React Router v6
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Charts**: Recharts
- **State Management**: React Context API
- **Date Handling**: Native JavaScript Date

## Design System

### Color Palette
- **Primary**: Blue (#2563eb) / Navy
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)
- **Background**: Blue-50 (#eff6ff)

### Status Colors
- **Pending**: Yellow
- **In Progress**: Blue
- **Completed**: Green
- **Overdue**: Red
- **Cancelled**: Gray

### Typography
- Clean, readable fonts with clear hierarchy
- Consistent sizing across components

## Project Structure

```
/
├── components/
│   ├── auth/
│   │   └── LoginPage.tsx
│   ├── shared/
│   │   ├── TopNavigation.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── AnnouncementModal.tsx
│   │   └── ProfilePage.tsx
│   ├── resident/
│   │   ├── ResidentDashboard.tsx
│   │   ├── ResidentHome.tsx
│   │   ├── MaintenanceRequestForm.tsx
│   │   ├── RequestTracking.tsx
│   │   └── RequestDetail.tsx
│   ├── officer/
│   │   ├── OfficerDashboard.tsx
│   │   ├── OfficerHome.tsx
│   │   ├── RequestManagement.tsx
│   │   ├── TaskDispatch.tsx
│   │   └── AnalyticsDashboard.tsx
│   ├── technician/
│   │   ├── TechnicianDashboard.tsx
│   │   ├── TechnicianHome.tsx
│   │   ├── MyTasks.tsx
│   │   └── TaskDetail.tsx
│   └── admin/
│       ├── AdminDashboard.tsx
│       ├── AdminHome.tsx
│       ├── UserManagement.tsx
│       ├── SystemSettings.tsx
│       └── Reports.tsx
├── context/
│   ├── UserContext.tsx
│   └── NotificationContext.tsx
└── App.tsx
```

## Key Components

### Context Providers
- **UserContext**: Manages authentication and user data
- **NotificationContext**: Handles notification system

### Reusable Components
- **TopNavigation**: Persistent header with notifications and profile
- **StatusBadge**: Consistent status indicators
- **AnnouncementModal**: Important announcements display

## Routes

- `/` - Login page
- `/resident/*` - Resident dashboard and features
- `/officer/*` - Officer dashboard and features
- `/technician/*` - Technician dashboard and features
- `/admin/*` - Admin dashboard and features
- `/profile` - User profile page

## Getting Started

1. The application starts at the login page
2. Use one of the demo accounts to access different role dashboards
3. Each role has a unique dashboard with specific features
4. Navigate using the top navigation and sidebar menus

## Notable Features

### Request Timeline
Visual timeline showing request progression:
Submitted → Reviewed → Assigned → In Progress → Completed

### Analytics Dashboard
- Weekly performance charts
- Response time trends
- Category distribution
- Technician performance metrics

### Task Dispatch
- Visual interface for assigning tasks
- Technician availability status
- Workload balancing
- Schedule coordination

### Notification System
- Real-time updates
- Unread count indicator
- Mark as read functionality
- Categorized by type (info, success, warning, error)

## Mock Data

The application uses mock data for demonstration purposes. In a production environment, this would be replaced with real API calls to a backend service.

## Security Considerations

- Role-based access control
- Protected routes based on user role
- Session management through context
- Input validation on forms

## Future Enhancements

- Real-time updates with WebSockets
- Mobile application
- Advanced reporting with custom date ranges
- Integration with payment systems
- Document management
- Community forum
- Event calendar

## License

This is a demonstration project for a Digital Juristic Management Platform.
