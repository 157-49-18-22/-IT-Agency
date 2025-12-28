# Calendar persistence Implementation

## Changes Made

1.  **Backend Routes (`backend/routes/calendar.routes.js`)**
    - Added `GET /:id`, `PUT /:id`, and `DELETE /:id` routes to handle individual events.
    - Protected routes with ownership checks.

2.  **API Service (`src/services/api.js`)**
    - Updated `calendarAPI` endpoints to match the backend structure.
    - Changed `/calendar/events` to `/calendar`.

3.  **Frontend Component (`src/Components/Calendar.jsx`)**
    - Replaced local `sampleEvents` with backend data fetching.
    - Implemented `fetchEvents` to get events from the API on mount.
    - Updated `saveEvent` to create events via API.
    - Updated `deleteEvent` to delete events via API.
    - Added `changeMonth` function (which was missing).
    - Added `Type` selection to the "Add Event" modal to align with the backend model.
    - Added loading state handling.

## Verification

- The backend should auto-restart via `nodemon`.
- The frontend should hot-reload.
- Adding an event should now persist it to the database.
- Refreshing the page should display the added events.
- Deleting an event should be persistent.
