# AI CRM - Open Source Marketing Automation & CDP

A full-stack, AI-powered Customer Relationship Management platform with built-in marketing automation, a Customer Data Platform (CDP), and predictive analytics. Built with Node.js, Express, MongoDB, and React.

---

## Features

### Core CRM
- Contact management with full lifecycle tracking (subscriber through evangelist)
- Company and deal pipeline management with stage progression
- Activity timeline (notes, calls, meetings, emails, tasks)
- Bulk import/export of contacts
- Tag-based organization and custom fields
- Role-based access control (admin, manager, agent)

### AI Engine
- Predictive lead scoring (0-100) with automatic qualification
- Churn risk prediction and prevention workflows
- AI-powered customer segmentation suggestions
- Content generation for campaigns and emails
- Send-time optimization for maximum engagement
- Predicted lifetime value (LTV) calculation
- Next-best-action recommendations

### Marketing Automation
- Visual workflow builder with drag-and-drop steps
- Multi-step automation sequences (email, wait, condition, split, webhook)
- Campaign management with A/B testing and winner selection
- Bulk email delivery with throttling and rate limiting
- Open and click tracking with engagement scoring
- Campaign performance analytics and ROI calculation
- Scheduled and recurring campaign support

### Customer Data Platform (CDP)
- Real-time event ingestion (page views, clicks, purchases, form submits)
- Batch event processing
- Unified customer profiles with identity resolution
- Customer journey mapping and visualization
- Session tracking and attribution
- Revenue attribution across campaigns and channels

---

## Tech Stack

| Layer      | Technology                                    |
| ---------- | --------------------------------------------- |
| Frontend   | React, React Router, Tailwind CSS, Chart.js   |
| Backend    | Node.js, Express                              |
| Database   | MongoDB, Mongoose ODM                         |
| Auth       | JWT, bcryptjs                                 |
| Email      | Nodemailer (SMTP)                             |
| AI/ML      | External AI model endpoint (configurable)     |
| Security   | Helmet, CORS, express-rate-limit              |
| Dev Tools  | Concurrently, dotenv, Morgan                  |

---

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 6+ (local or Atlas)
- SMTP server (optional, for email features)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/Customer-Relationship-Management-Open-Source.git
cd Customer-Relationship-Management-Open-Source

# Install all dependencies (root, backend, and frontend)
npm run install-all

# Create environment file
cp .env.example .env
# Edit .env with your configuration (see Environment Variables below)

# Seed the database with sample data
cd backend && node seed.js && cd ..

# Start development servers (backend + frontend)
npm run dev
```

The API server starts on `http://localhost:5000` and the frontend on `http://localhost:3000`.

### Default Admin Credentials

After running the seed script:

| Field    | Value           |
| -------- | --------------- |
| Email    | admin@crm.io    |
| Password | Admin123!@#     |

---

## Environment Variables

| Variable                | Description                          | Default                              |
| ----------------------- | ------------------------------------ | ------------------------------------ |
| `PORT`                  | Backend server port                  | `5000`                               |
| `MONGODB_URI`           | MongoDB connection string            | `mongodb://localhost:27017/ai_crm`   |
| `JWT_SECRET`            | Secret key for JWT token signing     | `default_jwt_secret`                 |
| `NODE_ENV`              | Environment (development/production) | `development`                        |
| `CORS_ORIGIN`           | Allowed CORS origin                  | `*`                                  |
| `SMTP_HOST`             | SMTP server hostname                 | `smtp.mailtrap.io`                   |
| `SMTP_PORT`             | SMTP server port                     | `587`                                |
| `SMTP_SECURE`           | Use TLS for SMTP                     | `false`                              |
| `SMTP_USER`             | SMTP authentication user             |                                      |
| `SMTP_PASS`             | SMTP authentication password         |                                      |
| `EMAIL_FROM`            | Default sender address               | `noreply@crm.example.com`            |
| `EMAIL_REPLY_TO`        | Default reply-to address             |                                      |
| `EMAIL_TRACKING_DOMAIN` | Base URL for open/click tracking     |                                      |
| `EMAIL_MAX_PER_SECOND`  | Email sending rate limit             | `10`                                 |
| `EMAIL_MAX_PER_HOUR`    | Hourly email sending cap             | `1000`                               |
| `AI_MODEL_ENDPOINT`     | AI/ML model API base URL             | `http://localhost:5001/api/ai`       |
| `RATE_LIMIT_WINDOW_MS`  | Rate limiter window (ms)             | `900000` (15 min)                    |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window            | `100`                                |
| `LOG_LEVEL`             | Morgan log format                    | `dev`                                |

---

## API Endpoints

All endpoints (except auth) require a valid JWT token in the `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint             | Description              |
| ------ | -------------------- | ------------------------ |
| POST   | `/api/auth/register` | Register a new user      |
| POST   | `/api/auth/login`    | Login and receive JWT    |
| GET    | `/api/auth/me`       | Get current user profile |
| PUT    | `/api/auth/profile`  | Update user profile      |

### Contacts

| Method | Endpoint                       | Description                  |
| ------ | ------------------------------ | ---------------------------- |
| GET    | `/api/contacts`                | List contacts (with filters) |
| POST   | `/api/contacts`                | Create a contact             |
| GET    | `/api/contacts/:id`            | Get contact by ID            |
| PUT    | `/api/contacts/:id`            | Update a contact             |
| DELETE | `/api/contacts/:id`            | Delete a contact             |
| POST   | `/api/contacts/import`         | Bulk import contacts         |
| POST   | `/api/contacts/:id/tags`       | Add tags to a contact        |
| GET    | `/api/contacts/:id/timeline`   | Get contact activity timeline|
| GET    | `/api/contacts/:id/ai-insights`| Get AI insights for contact  |

### Campaigns

| Method | Endpoint                          | Description                    |
| ------ | --------------------------------- | ------------------------------ |
| GET    | `/api/campaigns`                  | List campaigns                 |
| POST   | `/api/campaigns`                  | Create a campaign              |
| GET    | `/api/campaigns/:id`              | Get campaign by ID             |
| PUT    | `/api/campaigns/:id`              | Update a campaign              |
| DELETE | `/api/campaigns/:id`              | Delete a campaign              |
| POST   | `/api/campaigns/:id/launch`       | Launch a campaign              |
| POST   | `/api/campaigns/:id/pause`        | Pause a campaign               |
| POST   | `/api/campaigns/:id/resume`       | Resume a paused campaign       |
| GET    | `/api/campaigns/:id/metrics`      | Get campaign metrics           |
| POST   | `/api/campaigns/:id/ab-test`      | Run A/B test                   |
| POST   | `/api/campaigns/:id/ai-optimize`  | AI-optimize campaign           |

### Segments

| Method | Endpoint                       | Description                     |
| ------ | ------------------------------ | ------------------------------- |
| GET    | `/api/segments`                | List segments                   |
| POST   | `/api/segments`                | Create a segment                |
| GET    | `/api/segments/:id`            | Get segment by ID               |
| PUT    | `/api/segments/:id`            | Update a segment                |
| DELETE | `/api/segments/:id`            | Delete a segment                |
| POST   | `/api/segments/:id/refresh`    | Refresh segment membership      |
| GET    | `/api/segments/:id/contacts`   | List contacts in segment        |
| POST   | `/api/segments/preview`        | Preview segment with rules      |
| POST   | `/api/segments/ai-suggest`     | AI-suggested segmentation       |

### Automations

| Method | Endpoint                                 | Description                   |
| ------ | ---------------------------------------- | ----------------------------- |
| GET    | `/api/automations`                       | List automations              |
| POST   | `/api/automations`                       | Create an automation          |
| GET    | `/api/automations/:id`                   | Get automation by ID          |
| PUT    | `/api/automations/:id`                   | Update an automation          |
| DELETE | `/api/automations/:id`                   | Delete an automation          |
| POST   | `/api/automations/:id/activate`          | Activate an automation        |
| POST   | `/api/automations/:id/pause`             | Pause an automation           |
| GET    | `/api/automations/:id/metrics`           | Get automation metrics        |
| POST   | `/api/automations/:id/steps`             | Add a step to automation      |
| PUT    | `/api/automations/:id/steps/:stepId`     | Update a step                 |
| DELETE | `/api/automations/:id/steps/:stepId`     | Remove a step                 |

### AI Engine

| Method | Endpoint                       | Description                     |
| ------ | ------------------------------ | ------------------------------- |
| POST   | `/api/ai/score`                | Score a contact                 |
| POST   | `/api/ai/predict-churn`        | Predict churn risk              |
| POST   | `/api/ai/recommend`            | Get recommendations             |
| POST   | `/api/ai/segment-suggest`      | AI-powered segment suggestions  |
| POST   | `/api/ai/content-generate`     | Generate marketing content      |
| POST   | `/api/ai/send-time-optimize`   | Optimize email send time        |
| GET    | `/api/ai/insights`             | Get AI-generated insights       |

### CDP (Customer Data Platform)

| Method | Endpoint                          | Description                    |
| ------ | --------------------------------- | ------------------------------ |
| POST   | `/api/cdp/events`                 | Ingest a single event          |
| POST   | `/api/cdp/events/batch`           | Ingest events in batch         |
| GET    | `/api/cdp/profiles/:id`           | Get unified customer profile   |
| POST   | `/api/cdp/identify`               | Identify / merge profiles      |
| GET    | `/api/cdp/events/stream`          | Stream events in real time     |
| GET    | `/api/cdp/profiles/:id/journey`   | Get customer journey map       |

### Analytics

| Method | Endpoint                            | Description                   |
| ------ | ----------------------------------- | ----------------------------- |
| GET    | `/api/analytics/dashboard`          | Dashboard overview metrics    |
| GET    | `/api/analytics/contacts/growth`    | Contact growth over time      |
| GET    | `/api/analytics/campaigns/performance` | Campaign performance stats |
| GET    | `/api/analytics/revenue`            | Revenue analytics             |
| GET    | `/api/analytics/engagement`         | Engagement metrics            |
| GET    | `/api/analytics/funnel`             | Funnel analysis               |
| GET    | `/api/analytics/cohort`             | Cohort analysis               |

### Health Check

| Method | Endpoint       | Description          |
| ------ | -------------- | -------------------- |
| GET    | `/api/health`  | Server health status |

---

## Architecture Overview

```
Customer-Relationship-Management-Open-Source/
├── backend/
│   ├── config/
│   │   ├── database.js          # MongoDB connection setup
│   │   └── index.js             # Centralized config from env
│   ├── jobs/
│   │   └── scheduler.js         # Background job scheduling
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication middleware
│   │   └── validate.js          # Request validation middleware
│   ├── models/
│   │   ├── Activity.js          # Activity / timeline entries
│   │   ├── Automation.js        # Marketing automation workflows
│   │   ├── Campaign.js          # Email & multi-channel campaigns
│   │   ├── Company.js           # Company / account records
│   │   ├── Contact.js           # Contact profiles (core entity)
│   │   ├── Deal.js              # Sales pipeline deals
│   │   ├── Event.js             # CDP behavioral events
│   │   ├── Segment.js           # Audience segments
│   │   └── User.js              # System users (with bcrypt auth)
│   ├── routes/
│   │   ├── ai.js                # AI scoring, predictions, content
│   │   ├── analytics.js         # Dashboard & reporting endpoints
│   │   ├── auth.js              # Registration, login, profile
│   │   ├── automation.js        # Automation CRUD & execution
│   │   ├── campaigns.js         # Campaign management & A/B testing
│   │   ├── cdp.js               # Event ingestion & profiles
│   │   ├── contacts.js          # Contact CRUD & import
│   │   └── segments.js          # Segment CRUD & AI suggestions
│   ├── services/
│   │   ├── ai/
│   │   │   ├── contentGenerator.js    # AI content generation
│   │   │   ├── recommendationEngine.js # Next-best-action engine
│   │   │   ├── scoringEngine.js       # Lead scoring model
│   │   │   └── segmentationEngine.js  # AI segmentation
│   │   ├── cdp/
│   │   │   ├── eventProcessor.js      # Event ingestion pipeline
│   │   │   ├── journeyMapper.js       # Customer journey builder
│   │   │   └── profileUnifier.js      # Identity resolution
│   │   └── marketing/
│   │       ├── automationRunner.js    # Workflow execution engine
│   │       ├── campaignManager.js     # Campaign orchestration
│   │       └── emailService.js        # Email sending & tracking
│   ├── utils/
│   │   ├── constants.js         # Shared constants & enums
│   │   └── helpers.js           # Utility functions
│   ├── seed.js                  # Database seed script
│   └── server.js                # Express app entry point
├── frontend/                    # React frontend application
├── package.json                 # Root package with dev scripts
└── README.md
```

### Data Flow

1. **Events** arrive via the CDP endpoints and are processed by the event pipeline
2. **Contacts** are enriched with behavioral data, AI scores, and segment membership
3. **Segments** dynamically update based on rule conditions or AI predictions
4. **Automations** trigger when contacts enter segments, scores change, or events fire
5. **Campaigns** deliver content through the email service with tracking and throttling
6. **Analytics** aggregate data across all entities for dashboards and reports

---

## License

MIT
