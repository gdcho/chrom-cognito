# Design Document

## Overview

This design transforms the existing browser extension popup from its current incognito tab management interface into a time tracking application that matches the Chronow design aesthetic. The design focuses on creating a modern, dark-themed interface with proper visual hierarchy, typography, and spacing that closely resembles the reference image.

## Architecture

The design will maintain the existing React component structure but completely overhaul the UI components and styling. We'll leverage the existing Tailwind CSS setup and add custom CSS for specific design elements that match the Chronow interface.

### Component Structure

- **Header Component**: App name, icon, and control buttons
- **Active Session Component**: Current time tracking display with recording indicator
- **Daily Summary Component**: Today's total time display
- **Time Entry List Component**: Individual session entries with project tags
- **Historical Entries Component**: Date-grouped past entries with collapsible sections

## Components and Interfaces

### Header Component

```typescript
interface HeaderProps {
  onRefresh: () => void;
  onSettings: () => void;
}
```

- Displays "Chronow" branding with clock icon
- Refresh and settings icons on the right
- Dark background with proper spacing

### Active Session Component

```typescript
interface ActiveSessionProps {
  sessionName: string;
  elapsedTime: string; // MM:SS format
  projectTag?: string;
  isRecording: boolean;
}
```

- Prominent display of current session
- Red recording indicator when active
- Project tag with colored background
- Large, readable time display

### Daily Summary Component

```typescript
interface DailySummaryProps {
  totalTime: string; // H:MM:SS format
  date: string;
}
```

- "Today" label with total time
- Collapsible/expandable functionality
- Clear typography hierarchy

### Time Entry Component

```typescript
interface TimeEntryProps {
  projectName: string;
  duration: string;
  projectTag?: string;
  tagColor?: string;
}
```

- Project name and duration display
- Colored project tag indicators
- Consistent spacing and alignment

### Historical Section Component

```typescript
interface HistoricalSectionProps {
  date: string;
  dayName: string;
  totalTime: string;
  entries: TimeEntry[];
  isExpanded: boolean;
  onToggle: () => void;
}
```

- Date grouping with day names
- Collapsible sections
- Total time per day display

## Data Models

### TimeEntry

```typescript
interface TimeEntry {
  id: string;
  projectName: string;
  duration: string;
  startTime: Date;
  endTime?: Date;
  projectTag?: ProjectTag;
}
```

### ProjectTag

```typescript
interface ProjectTag {
  name: string;
  color: string; // hex color code
  backgroundColor: string; // hex color code
}
```

### DailySession

```typescript
interface DailySession {
  date: string;
  dayName: string;
  totalDuration: string;
  entries: TimeEntry[];
}
```

### AppState

```typescript
interface AppState {
  activeSession?: TimeEntry;
  todayTotal: string;
  todayEntries: TimeEntry[];
  historicalSessions: DailySession[];
  isLoading: boolean;
}
```

## Design System

### Color Palette

- **Primary Background**: `#1a1a1a` (dark gray)
- **Secondary Background**: `#2a2a2a` (slightly lighter gray)
- **Text Primary**: `#ffffff` (white)
- **Text Secondary**: `#a0a0a0` (light gray)
- **Accent Blue**: `#4a9eff` (project tag blue)
- **Accent Green**: `#00d4aa` (project tag green)
- **Recording Red**: `#ff4757` (active recording indicator)
- **Border Color**: `#333333` (subtle borders)

### Typography

- **Primary Font**: System font stack (-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto)
- **Header Text**: 18px, font-weight: 600
- **Body Text**: 14px, font-weight: 400
- **Time Display**: 16px, font-weight: 500, monospace for consistency
- **Small Text**: 12px, font-weight: 400

### Spacing System

- **Base Unit**: 4px
- **Small Spacing**: 8px (2 units)
- **Medium Spacing**: 16px (4 units)
- **Large Spacing**: 24px (6 units)
- **Section Spacing**: 32px (8 units)

### Component Dimensions

- **Popup Width**: 320px
- **Popup Height**: Auto (content-driven, max 600px)
- **Header Height**: 60px
- **Entry Row Height**: 48px
- **Icon Size**: 20px
- **Tag Height**: 24px

## Layout Structure

### Main Container

```css
.popup-container {
  width: 320px;
  background: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

### Header Layout

```css
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #1a1a1a;
  border-bottom: 1px solid #333;
}
```

### Content Layout

```css
.content {
  padding: 20px;
  max-height: 500px;
  overflow-y: auto;
}
```

### Entry Layout

```css
.entry-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #2a2a2a;
}
```

## Interactive Elements

### Recording Indicator

- Pulsing red dot animation
- 8px diameter circle
- CSS animation for smooth pulsing effect

### Collapsible Sections

- Smooth expand/collapse animations
- Chevron icons that rotate on state change
- Transition duration: 200ms ease-in-out

### Project Tags

- Rounded corners (4px border-radius)
- Small padding (4px 8px)
- Colored background with white text
- Consistent sizing across all instances

## Error Handling

### Loading States

- Skeleton loading animations for time entries
- Loading spinner for initial data fetch
- Graceful degradation when data is unavailable

### Empty States

- "No active session" message when not tracking
- "No entries today" for empty daily summaries
- "No historical data" for empty past entries

### Error States

- Connection error messages
- Data sync failure indicators
- Retry mechanisms for failed operations

## Testing Strategy

### Visual Testing

- Screenshot comparisons with reference design
- Cross-browser compatibility testing
- Responsive behavior testing

### Component Testing

- Unit tests for each component
- Props validation testing
- State management testing

### Integration Testing

- Full popup flow testing
- Data loading and display testing
- User interaction testing

### Accessibility Testing

- Keyboard navigation testing
- Screen reader compatibility
- Color contrast validation
- Focus management testing

## Implementation Notes

### CSS Architecture

- Use CSS modules or styled-components for component-specific styles
- Maintain existing Tailwind CSS for utility classes
- Create custom CSS variables for the design system colors
- Implement smooth transitions for all interactive elements

### Performance Considerations

- Lazy loading for historical data
- Virtual scrolling for large entry lists
- Optimized re-renders using React.memo
- Efficient state management to prevent unnecessary updates

### Browser Extension Constraints

- Maintain popup size constraints
- Ensure fast loading times
- Minimize bundle size impact
- Handle popup close/reopen state persistence
