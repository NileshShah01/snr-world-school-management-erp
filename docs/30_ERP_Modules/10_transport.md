# 10 — Transport Module

## Purpose

Manage school transport routes, student-to-route mapping, and pickup/drop points. Provides lists for route planning and student assignment but no real-time tracking, vehicle management, or driver tools.

## Current Working State

- **JS File:** `D:\Snredu\js\erp-transport.js` (5.7 KB)
- **Firestore Collections:**
  - `transportRoutes` — top-level collection. Each doc represents one route (`routeName`, `routeNumber`, `driverName`, `driverPhone`, `helperName`, `helperPhone`, `vehicleNumber`, `academicYear`).
  - `transportRoutes/{routeId}/students` — sub-collection. Maps students to routes (`studentId`, `studentName`, `className`, `pickupPoint`, `dropPoint`, `pickupTime`, `dropTime`, `academicYear`).
  - `transportPoints` — helper collection of named pickup/drop locations.
- **Key Functions:**
  - `loadRoutes()` — fetches all transport routes.
  - `saveRoute()` — creates/updates route document.
  - `deleteRoute()` — removes route (with confirmation on assigned students).
  - `loadRouteStudents()` — fetches students assigned to a route.
  - `addStudentToRoute()` / `removeStudentFromRoute()` — manages student-route mapping.
  - `loadTransportPoints()` — fetches available pickup/drop points.
- **Access:** Admin only in admin dashboard. No parent/student transport view.
- **Note:** Vehicle numbers and driver names are stored as plain text fields on the route — no separate vehicle or driver management.

## Gaps

| Priority | Gap | Notes |
|----------|-----|-------|
| P1 | No GPS tracking | No real-time bus location tracking for parents or admin. |
| P1 | No pickup/drop notifications | Parents not notified when bus nears pickup point or student is dropped. |
| P2 | No vehicle management | No tracking of insurance expiry, fitness certificate, pollution check, maintenance logs. |
| P2 | No driver/conductor app | Driver/conductor have no mobile interface; attendance, route confirmation, student boarding all manual. |
| P2 | No attendance on bus | No record of which students boarded/alighted each day. |
| P2 | No real-time bus tracking map | No map UI showing bus location, route path, ETA. |
| P3 | No route optimization | Routes are manually planned; no algorithmic optimization for stops/ordering. |

## Competitor Comparison

| Feature | Education Desk | Fedena | Classe365 | Campus24x7 | SNR (Current) |
|---------|---------------|--------|-----------|------------|---------------|
| Route management | Yes | Yes | Yes | Yes | Yes |
| Student-route mapping | Yes | Yes | Yes | Yes | Yes |
| GPS tracking | Yes | Add-on | Yes | Yes | No |
| Pickup/drop notifications | Yes | No | Yes | Yes (WhatsApp) | No |
| Vehicle management | No | Yes | Yes | No | No |
| Driver app | No | No | Yes | Yes | No |
| Attendance on bus | No | No | Yes | Yes | No |
| Route optimization | No | No | No | Basic | No |

## Perfect Version

- **Real-time GPS tracking** — IoT device or driver mobile app sends GPS coordinates → Firebase Realtime DB / Firestore → displayed on map UI for admin and parents.
- **Parent notification engine** — when bus is within X distance of pickup point → WhatsApp/Email/SMS alert to parent. Drop confirmation on arrival.
- **Vehicle management module** — separate `vehicles` collection with insurance, fitness, permit, PUC expiry dates. Dashboard alerts for renewals. Maintenance log with service history.
- **Driver/conductor mobile app** — simple lightweight PWA: login, view route, mark student attendance (boarding/alighting), share GPS, SOS button.
- **Student bus attendance** — daily record per student per trip. Reports for admin.
- **Route optimization** — suggest optimal stop ordering based on student addresses; manual override.
- **Route map visualization** — Google Maps / Mapbox integration showing bus live location, route path, all stops, ETA per stop.
- **Transport fee integration** — link route assignment to fee module for transport fee calculation.
- **v3 Data Model:**
  ```
  schools/{id}/transport/routes/{routeId}
  schools/{id}/transport/routes/{routeId}/students/{studentId}
  schools/{id}/transport/vehicles/{vehicleId}
  schools/{id}/transport/trips/{tripId} (daily trip logs)
  ```
