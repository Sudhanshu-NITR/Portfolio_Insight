# PortfolioInsight: AI-Powered Portfolio Analytics for Indian Markets

PortfolioInsight is a comprehensive, full-stack portfolio management and analytics platform tailored specifically for the Indian stock market. Leveraging cutting-edge AI technology and real-time market data, it empowers investors with professional-grade tools to track, analyze, and optimize their investment portfolios across NSE and BSE exchanges.

## 🌟 Why PortfolioInsight?

The Indian stock market is dynamic and complex. Individual investors often lack access to institutional-grade analytics tools that can help them make informed decisions. PortfolioInsight bridges this gap by providing:

- 📊 Real-Time Portfolio Tracking: Monitor your holdings with live market data.
- 🤖 AI-Powered Insights: Get intelligent recommendations using a RAG (Retrieval-Augmented Generation) agent.
- 📈 Advanced Analytics: Track performance metrics, risk indicators, and sector allocations.
- 🎯 Benchmark Comparison: Compare your portfolio against NIFTY 50 and SENSEX indices.
- 💡 Smart Decision Making: Access comprehensive market data, analyst ratings, and corporate actions.

Traditional portfolio trackers only show you what you own. PortfolioInsight shows you what it means — combining your holdings with financial knowledge, market trends, and predictive analytics to help you understand the "why" behind the numbers.

## ✨ Key Features

### 📱 Portfolio Management
- Add, Edit, Delete Holdings: Full CRUD operations for managing your stock positions.
- Multi-Exchange Support: Track stocks from NSE and BSE.
- Bulk Operations: Import/export holdings via CSV for quick portfolio setup.
- Detailed Holding Information: Store purchase price, date, quantity, sector, and custom notes.

### 📊 Dashboard & Analytics
- Real-Time Portfolio Value: Live calculation of total portfolio worth.
- Profit/Loss Tracking: Overall and daily P&L with percentage changes.
- Performance Charts: Visualize portfolio growth against market benchmarks.
- Sector Allocation: Interactive pie charts showing diversification.
- Top Performers: Identify your best and worst performing stocks.

### 🤖 AI-Powered Insights
- RAG Agent: Access financial knowledge from embedded books (The Intelligent Investor, Corporate Finance guides, etc.).
- Contextual Q&A: Ask questions about your portfolio and get intelligent responses.
- Market Analysis: Get real-time market insights powered by LangChain, LangGraph, and Google Gemini.
- Knowledge Base Search: Query financial concepts, investment principles, and strategies.

### 📈 Market Data Integration
- Live Stock Quotes: Real-time price updates via yfinance.
- Corporate Actions: Track dividends, stock splits, and bonus issues.
- Analyst Ratings: Access recommendations and price targets.
- Intraday Data: View price movements throughout the trading day.
- Stock Forecasts: Get EPS, revenue, and other fundamental estimates.

### 👤 Investment Profile
- Risk Assessment: Define your risk tolerance (Conservative, Moderate, Aggressive).
- Investment Goals: Set clear objectives (Wealth Creation, Retirement, etc.).
- Time Horizon: Plan for short, medium, or long-term investments.
- Cash Management: Track available capital and monthly investment capacity.
- Sector Preferences: Define preferred industries and investment themes.

## 🛠️ Tech Stack

### 🌐 Frontend
- Next.js 15 – React framework with App Router for modern web applications.
- React 19 – Latest React for building interactive UIs.
- Redux Toolkit – Centralized state management.
- Tailwind CSS 4 – Utility-first CSS framework for responsive design.
- shadcn/ui – High-quality, accessible UI components (Radix UI-based).
- Recharts – Composable charting library for data visualization.
- NextAuth.js – Complete authentication solution for Next.js.
- Axios – Promise-based HTTP client for API requests.
- React Hook Form – Performant, flexible form validation.
- Lucide React – Beautiful icon library.

### 🔗 Backend

#### Next.js API Routes (Node.js)
- API Routes – Serverless endpoints for portfolio operations.
- MongoDB + Mongoose – NoSQL database for storing user data and holdings.
- JWT Authentication – Secure token-based authentication.
- bcrypt.js – Password hashing and security.
- NextAuth.js Integration – Server-side session management.

#### Flask Backend (Python)
- Flask – Lightweight Python web framework for AI services.
- LangChain – Framework for building LLM-powered applications.
- LangGraph – Workflow orchestration for complex AI agents.
- Pinecone – Vector database for semantic search and RAG.
- Google Gemini AI – Primary large language model for intelligent responses.
- yfinance – Market data retrieval from Yahoo Finance.
- Indian API – Real-time data for Indian stocks.
- Pandas & NumPy – Data processing and analysis.
- Gunicorn – WSGI HTTP server for Flask production deployment.

### 🧰 Dev & Build Tools
- ESLint – Code linting for consistent code quality.
- PostCSS – CSS processing and browser compatibility.
- dotenv – Environment variable management.

## 🚀 Getting Started

### 📦 Prerequisites
- Node.js (v18 or higher)
- Python (v3.11 or higher)
- MongoDB (Local installation or MongoDB Atlas account)
- npm (or yarn) package manager

### 🔧 Installation

#### 1️⃣ Clone the Repository
```
git clone https://github.com/your-username/PortfolioInsight.git
cd PortfolioInsight
```


#### 3️⃣ Install Flask Backend Dependencies
```
cd flask-backend
pip install -r requirements.txt
cd ..
```


### 🔐 Environment Configuration

#### Frontend Environment Variables
Create a `.env` or `.env.local` file in the root directory:
```
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key_here

# Flask Backend URL
FLASK_BACKEND_URL=http://localhost:5000
```


🔑 Generate NEXTAUTH_SECRET:
```
openssl rand -base64 32
```


#### Flask Backend Environment Variables
Create a `.env` file inside the `flask-backend/` directory:

```
# LLM Provider (Currently only 'gemini' is implemented)
LLM_PROVIDER=gemini

# Google Gemini Configuration
GOOGLE_API_KEY=your_google_gemini_api_key

# Embedding Provider (Currently only 'gemini' is implemented)
EMBED_PROVIDER=gemini

# Pinecone Vector Database
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your-pinecone-index-name

# Market Data API
INDIAN_API_BASE=https://stock.indianapi.in
INDIAN_API_KEY=your_indian_api_key

# Cache TTL (seconds)
CACHE_TTL_QUOTES=60
CACHE_TTL_CORPORATE=900
CACHE_TTL_FORECASTS=300

# LLM Parameters
CHAT_TEMPERATURE=0.3
MAX_TOKENS=2000
```



📝 Notes:
- Get Google Gemini API key from: https://makersuite.google.com/app/apikey
- Get Pinecone API key from: https://www.pinecone.io/
- Get Indian API key from: https://indianapi.in/indian-stock-market


## ▶️ Running the Application

### Start MongoDB (if running locally)
```
mongod
```

### Start Flask Backend
Open a terminal window:
```
cd flask-backend
python app.py
```

Backend will run on: http://localhost:5000

### Start Next.js Frontend
Open another terminal window:


```
npm run dev
```

Frontend will run on: http://localhost:3000

✅ You're all set! Open your browser and navigate to http://localhost:3000

## 📡 API Reference

### 🔐 Authentication Endpoints
| Method | Endpoint             | Description                  |
|--------|----------------------|------------------------------|
| POST   | /api/auth/signup     | Register a new user account  |
| POST   | /api/auth/signin     | Login with credentials       |
| POST   | /api/auth/signout    | Logout user session          |

### 📊 Portfolio Management
| Method | Endpoint               | Description                         |
|--------|------------------------|-------------------------------------|
| POST   | /api/add-holding       | Add a new stock to portfolio        |
| PATCH  | /api/update-holding    | Update existing holding details     |
| DELETE | /api/delete-holding    | Remove a holding from portfolio     |
| GET    | /api/dashboard-data    | Fetch complete portfolio analytics  |
| GET    | /api/export-holdings   | Export holdings as CSV file         |
| POST   | /api/import-holdings   | Import holdings from CSV            |

### 👤 Investment Profile
| Method | Endpoint                       | Description                         |
|--------|--------------------------------|-------------------------------------|
| GET    | /api/profile-status            | Get user's investment profile       |
| PATCH  | /api/update-investment-profile | Update investment preferences       |

### 🤖 Flask Backend - AI & Market Data

#### AI/RAG Endpoints
| Method | Endpoint           | Description                           |
|--------|--------------------|---------------------------------------|
| POST   | /chat              | Main AI chat endpoint with RAG        |
| POST   | /rag/ingest        | Ingest documents into knowledge base  |
| GET    | /rag/debug/stats   | Check RAG system status               |

#### Market Data Endpoints
| Method | Endpoint                  | Description                    |
|--------|---------------------------|--------------------------------|
| POST   | /market/quotes            | Get real-time stock quotes     |
| POST   | /market/price-ranges      | Get historical price ranges    |
| POST   | /market/intraday          | Fetch intraday price data      |
| POST   | /market/corporate-actions | Get dividends and splits       |
| POST   | /market/analyst/summary   | Analyst ratings and targets    |

#### Tools Endpoints
| Method | Endpoint               | Description                         |
|--------|------------------------|-------------------------------------|
| GET    | /tools/trending        | Get trending stocks                 |
| GET    | /tools/stock-forecasts | Fetch earnings/revenue forecasts    |

## 📸 Screenshots
- Landing Page
- Dashboard Page
- Holdings Page
- Analytics Page
- AI Insights

## 📂 Project Structure
```
PortfolioInsight/
├── flask-backend/ # Python Flask AI/RAG backend
│ ├── app.py # Main Flask application
│ ├── config.py # Configuration management
│ ├── requirements.txt # Python dependencies
│ ├── rag/ # RAG implementation
│ │ ├── agent.py # (Legacy) agent logic
│ │ ├── langgraph_agent.py # LangGraph agent logic
│ │ ├── llm.py # LLM provider setup
│ │ ├── retriever.py # Pinecone vector search
│ │ └── unified_agent.py # Unified RAG + tools agent
│ ├── routes/ # API route blueprints
│ │ ├── market_routes.py # Market data endpoints
│ │ ├── tools_routes.py # Tool endpoints
│ │ └── unified_rag_routes.py # RAG chat endpoints
│ ├── services/ # Business logic services
│ │ ├── market_data_service.py
│ │ ├── corporate_actions_service.py
│ │ ├── analyst_service.py
│ │ └── trending_service.py
│ ├── tools/ # LangChain tools
│ │ ├── market_tools.py # Market data tools
│ │ ├── analysis_tools.py # Analysis tools
│ │ └── rag_tool.py # Knowledge base search
│ ├── utils/ # Utility functions
│ └── books/ # Financial PDF books for RAG
│
├── src/
│ ├── app/ # Next.js App Router
│ │ ├── page.jsx # Landing page
│ │ ├── layout.jsx # Root layout
│ │ ├── (app)/ # Protected app routes
│ │ │ ├── dashboard/ # Dashboard page
│ │ │ ├── holdings/ # Holdings management
│ │ │ ├── analytics/ # Analytics page
│ │ │ ├── ai-insights/ # AI chat interface
│ │ │ └── investment-profile/ # Profile settings
│ │ ├── (auth)/ # Authentication pages
│ │ │ └── sign-in/
│ │ └── api/ # API route handlers
│ │ ├── auth/ # Auth endpoints
│ │ ├── add-holding/
│ │ ├── update-holding/
│ │ ├── delete-holding/
│ │ ├── dashboard-data/
│ │ ├── export-holdings/
│ │ └── update-investment-profile/
│ │
│ ├── components/ # React components
│ │ ├── ui/ # Shadcn UI components
│ │ ├── dashboard/ # Dashboard-specific components
│ │ ├── analytics/ # Analytics page components
│ │ ├── holdings/ # Holdings management components
│ │ └── landing/ # Landing page sections
│ │
│ ├── context/ # React context providers
│ │ └── AuthProvider.jsx # NextAuth provider
│ │
│ ├── store/ # Redux store
│ │ ├── index.js # Store configuration
│ │ └── portfolioSlice.js # Portfolio state management
│ │
│ ├── model/ # MongoDB Mongoose models
│ │ ├── User.model.js
│ │ ├── Portfolio.model.js
│ │ ├── Holding.model.js
│ │ └── InvestmentProfile.model.js
│ │
│ ├── helpers/ # Helper functions
│ │ ├── portfolioHelpers.js
│ │ └── performanceHelpers.js
│ │
│ └── lib/ # Library utilities
│ ├── dbConnect.js # MongoDB connection
│ └── utils.js # General utilities
│
├── public/ # Static assets
│ └── trendUp.png # Logo/Icon
│
├── .env # Frontend environment variables
├── flask-backend/.env # Backend environment variables
├── package.json # Node.js dependencies
├── next.config.mjs # Next.js configuration
├── postcss.config.mjs # PostCSS configuration
├── components.json # Shadcn UI config
└── docker-compose.yaml # Docker deployment config

```



## 🔄 Data Flow

### Portfolio Analytics Pipeline
- User adds holdings → Stored in MongoDB via Next.js API routes.
- Frontend requests dashboard data → Hits `/api/dashboard-data` endpoint.
- Backend fetches market prices → `Portfolio.model.js` calls Flask backend (`/market/quotes/get-pricemap`).
- Portfolio calculations → `portfolioHelpers.js` computes metrics (P&L, value).
- Performance comparison → `performanceHelpers.js` generates chart data.
- Frontend renders → Redux state updates trigger component re-renders.

### AI Insights Flow
- User asks question → Sent to Flask `/chat` endpoint.
- Unified Agent processes → LangGraph determines if RAG or tools are needed.
- RAG retrieval → `retriever.py` searches Pinecone for embedded financial book content.
- Tool execution → If needed, fetches live market data (e.g., `tool_get_quotes`).
- LLM generates response → Google Gemini combines context + data.
- Response sent to frontend → User receives an intelligent, data-backed answer.

## 🚢 Deployment

### Frontend Deployment (Vercel)
- Push your code to GitHub.
- Import repository on https://vercel.com/.
- Add environment variables in Vercel dashboard.
- Deploy automatically on every push to main.

### Backend Deployment (Render)
- Create new Web Service on https://render.com/.
- Connect your GitHub repository.
- Set build command: `pip install -r flask-backend/requirements.txt`
- Set start command: `cd flask-backend && gunicorn -b 0.0.0.0:$PORT wsgi:app`
- Add environment variables.
- Deploy.

### Database (MongoDB Atlas)
- Create free cluster on https://www.mongodb.com/cloud/atlas.
- Whitelist IP addresses (0.0.0.0/0 for development).
- Create database user.
- Copy connection string to `MONGODB_URI`.

## 🌱 Future Enhancements

### Phase 1: Enhanced Analytics
- Tax calculation and reporting
- Transaction history and audit trail
- Email/SMS alerts for portfolio changes
- Customizable watchlists

### Phase 2: Advanced Features
- Mobile app (React Native)
- Options and derivatives tracking
- Mutual fund integration
- Goal-based investment planning

### Phase 3: AI Expansion
- Personalized stock recommendations
- Automated rebalancing suggestions
- Sentiment analysis from news & social media
- Predictive modeling with ML
- Voice-enabled queries

## 🤝 Contributing
Contributions are welcome! Please follow these steps:
- Fork the repository
- Create a feature branch: `git checkout -b feature/your-feature-name`
- Commit changes: `git commit -m 'Add some feature'`
- Push to branch: `git push origin feature/your-feature-name`
- Open a Pull Request

## 🙏 Acknowledgments
- Financial Books: The Intelligent Investor, Corporate Finance guides (embedded in RAG)
- Market Data: Yahoo Finance (via yfinance), Indian API
- UI Components: Shadcn/UI, Radix UI
- AI Framework: LangChain, LangGraph, Google Gemini
- Vector DB: Pinecone

## ⚡ Quick Start Summary
```
1. Clone and install
git clone https://github.com/your-username/PortfolioInsight.git
cd PortfolioInsight
npm install

2. Setup Flask backend
cd flask-backend
pip install -r requirements.txt
cd ..

3. Configure environment variables
Create .env in root and flask-backend/.env
and add your keys (see "Environment Configuration" section)
4. Start MongoDB (if local)
mongod

5. Start Flask backend
cd flask-backend && python app.py

6. Start Next.js frontend (in new terminal)
npm run dev

7. Open http://localhost:3000
```

---

Made with ❤️ for Indian Investors | Powered by AI 🤖