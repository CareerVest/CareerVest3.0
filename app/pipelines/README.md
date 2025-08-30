# Pipelines Module

This module provides a comprehensive client pipeline management system for CareerVest. It allows users to track clients through different stages of the recruitment process with role-based permissions and drag-and-drop functionality.

## Features

### 🎯 Role-Based Access Control

- **Admin**: Full access to all stages and actions
- **Marketing Manager**: Strategic oversight and cross-stage management
- **Sales Executive**: Sales stage access and client qualification
- **Resume Writer**: Resume preparation and optimization
- **Senior Recruiter**: Marketing campaign oversight
- **Recruiter**: Campaign execution and client outreach

### 📊 Pipeline Stages

1. **Sales** - Initial client contact and qualification
2. **Resume** - Resume preparation and optimization
3. **Marketing** - Campaign setup and client outreach
4. **Completed** - Successful placements
5. **Backed Out** - Clients who withdrew
6. **ReMarketing** - Clients returning for new opportunities
7. **On Hold** - Temporarily paused clients

### 🎨 Key Features

- **Drag & Drop Interface**: Move clients between stages with visual feedback
- **Action Tracking**: Complete stage-specific actions with file uploads
- **Search & Filter**: Find clients by name, email, assigned person, or notes
- **Real-time Stats**: View pipeline metrics and conversion rates
- **Client Details**: Comprehensive client information and history
- **Progress Tracking**: Visual progress indicators for each stage

### 🔧 Technical Implementation

- Built with Next.js 14 and TypeScript
- Uses ShadCN UI components for consistent design
- Implements drag-and-drop using HTML5 Drag API
- Role-based permissions and access control
- Responsive design for desktop and mobile

## Usage

1. **Navigate to Pipelines**: Access via the sidebar navigation
2. **Select Role**: Use the role selector to simulate different user permissions
3. **View Pipeline**: See clients organized by stage with real-time counts
4. **Move Clients**: Drag and drop clients between stages (if permissions allow)
5. **Complete Actions**: Click on action items to mark them complete
6. **View Details**: Click on any client card to see detailed information

## File Structure

```
app/pipelines/
├── components/
│   ├── ActionDialog.tsx      # Action completion dialog
│   ├── ClientCard.tsx        # Basic client card component
│   ├── ClientDetails.tsx     # Detailed client view
│   ├── constants.ts          # Stage config and mock data
│   ├── DraggableClientCard.tsx # Interactive client card
│   ├── DroppableStage.tsx    # Stage container with drop zones
│   ├── Pipeline.tsx          # Main pipeline component
│   ├── PipelineStats.tsx     # Statistics display
│   ├── RoleSelector.tsx      # Role simulation interface
│   └── utils.ts              # Helper functions
├── types/
│   └── pipeline.ts           # TypeScript type definitions
├── layout.tsx                # Module layout
├── page.tsx                  # Main page component
└── README.md                 # This file
```

## Mock Data

The module includes comprehensive mock data with 15 sample clients across all stages, demonstrating:

- Different client priorities (high, medium, low)
- Various action completion states
- Realistic client information and notes
- Department time tracking

## Future Enhancements

- Real-time collaboration features
- Advanced filtering and sorting
- Email integration
- Automated workflow triggers
- Performance analytics
- Mobile app support
