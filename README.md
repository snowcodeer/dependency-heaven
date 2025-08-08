# Dependency Heaven - AI-Powered Dependency Analysis Platform

An intelligent dependency management platform that automatically scans GitHub repositories, analyzes security vulnerabilities, and creates actionable GitHub issues using AI-powered analysis.

## 🚀 Features

### **Automated GitHub Integration**
- **Repository Discovery**: Automatically fetches all repositories via ACI.dev platform
- **Smart Caching**: 5-minute intelligent caching prevents redundant API calls
- **Real-time Scoring**: Generates 0-100 dependency health scores for each repository

### **AI-Powered Security Analysis**
- **Vulnerability Detection**: Identifies security risks and version conflicts
- **One-Click Issue Creation**: Click vulnerabilities to auto-generate GitHub issues
- **GPT-4 Enhanced Content**: AI creates comprehensive issues with fixes and best practices
- **Cross-Project Analysis**: Detects conflicts across entire organization

### **Interactive Visualizations**
- **D3.js Dependency Graphs**: Interactive network graphs with drag-and-drop nodes
- **Multi-Type Support**: Visualizes production, development, and peer dependencies
- **Color-Coded Indicators**: Visual feedback for security risks and conflicts
- **Responsive Dashboard**: Real-time progress bars and repository cards

### **Developer Experience**
- **Futuristic Landing Page**: Beautiful animated background with modern UI
- **Toggle Interface**: Show/hide package inputs for streamlined workflow
- **TypeScript**: Full type safety throughout the application
- **Modern Stack**: Next.js 15, FastAPI, Tailwind CSS

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 15** - App Router with TypeScript
- **React 18** - Modern React with hooks and state management
- **TypeScript** - Full type safety and IntelliSense
- **Tailwind CSS** - Utility-first responsive styling
- **D3.js** - Interactive data visualization

### **Backend**
- **FastAPI** - High-performance Python API framework
- **OpenAI GPT-4** - AI-powered analysis and content generation
- **ACI.dev** - GitHub integration platform for repository operations
- **Pydantic** - Data validation and serialization

### **Integration**
- **GitHub API** - Repository and file content access
- **Tool Orchestration** - OpenAI function calling for GitHub operations
- **Smart Caching** - localStorage with time-based invalidation

## 🏗️ Project Structure

```
dependency-heaven/
├── src/
│   ├── app/
│   │   ├── analyzer/
│   │   │   └── page.tsx         # Detailed dependency analysis page
│   │   ├── dashboard/
│   │   │   └── page.tsx         # Repository dashboard with scoring
│   │   ├── globals.css          # Global styles with Tailwind
│   │   ├── layout.tsx           # Root layout component
│   │   └── page.tsx             # Futuristic landing page
│   ├── components/
│   │   ├── AnalysisPanel.tsx    # Main analysis dashboard
│   │   ├── DependencyVisualization.tsx  # D3.js network graph
│   │   ├── IssuesList.tsx       # Clickable security issues
│   │   ├── PackageInputs.tsx    # Toggleable input interface
│   │   ├── PackagesList.tsx     # Analyzed packages list
│   │   ├── StatsGrid.tsx        # Statistics overview
│   │   └── VisualizationControls.tsx  # Filters and search
│   ├── hook/
│   │   └── useGitHubRepos.ts    # GitHub repository fetching hook
│   └── types/
│       └── package.ts           # TypeScript type definitions
├── main.py                      # FastAPI backend with AI integration
├── pyproject.toml              # Python dependencies
├── uv.lock                     # Python lock file
└── package.json                # Frontend dependencies
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ and npm
- Python 3.8+ with uv package manager
- OpenAI API key
- ACI.dev account for GitHub integration

### **Installation**

1. **Clone and install frontend dependencies:**
```bash
git clone <repository>
cd dependency-heaven
npm install
```

2. **Install backend dependencies:**
```bash
# Install uv package manager if not already installed
pip install uv

# Install Python dependencies
uv sync
```

3. **Environment Setup:**
```bash
# Create .env file with your API keys
cp .env.example .env
# Add your OPENAI_API_KEY and ACI credentials
```

4. **Run both servers:**
```bash
# Terminal 1 - Backend (Port 8000)
python main.py

# Terminal 2 - Frontend (Port 3000)
npm run dev
```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 💻 How It Works

### **Automated Workflow**
1. **Repository Discovery**: Dashboard automatically fetches all GitHub repositories via ACI.dev
2. **Dependency Analysis**: Each repository gets analyzed and scored (0-100) based on security and conflicts
3. **Visual Dashboard**: Repository cards show real-time dependency health with progress bars
4. **One-Click Analysis**: Click any repository card to view detailed dependency visualization

### **AI-Powered Issue Creation**
1. **Security Detection**: Platform identifies vulnerabilities and version conflicts
2. **Click to Create**: Click any detected issue to trigger AI analysis
3. **Enhanced Issues**: GPT-4 generates comprehensive GitHub issues with:
   - Problem summary and impact analysis
   - Specific fix recommendations
   - Best practices and resources
4. **Auto-Open**: Created issues automatically open in GitHub for immediate action

### **Advanced Features**
- **Smart Caching**: 5-minute caching prevents redundant API calls
- **Cross-Project Detection**: Identifies conflicts across entire organization
- **Interactive Graphs**: D3.js visualizations with drag-and-drop nodes
- **Toggle Interface**: Show/hide package inputs for streamlined workflow

## 🎯 Key Features Explained

### **GitHub Integration via ACI.dev**
- Uses `GITHUB__LIST_REPOSITORIES` to automatically discover repositories
- Calls `GITHUB__GET_FILE_CONTENT` to fetch package.json files
- Creates issues via `GITHUB__CREATE_ISSUE` with AI-enhanced content
- All operations orchestrated through OpenAI function calling

### **Intelligent Scoring System**
- **Multi-factor Analysis**: Security risks, dependency count, known vulnerabilities
- **Color-coded Visual**: Green (healthy) → Red (critical) progress bars
- **Real-time Updates**: Automatic scoring as repositories are analyzed
- **Cross-project Detection**: Identifies version conflicts across organization

### **AI-Enhanced Issue Creation**
- **GPT-4 Analysis**: Analyzes vulnerabilities using built-in knowledge base
- **Professional Format**: Markdown-formatted issues with impact analysis
- **Actionable Content**: Specific version updates, alternatives, migration steps
- **One-Click Workflow**: Detected issue → AI analysis → GitHub issue creation

### **Interactive Visualizations**
- **D3.js Network Graphs**: Force-directed layouts with drag-and-drop
- **Multi-type Dependencies**: Production, development, and peer dependencies
- **Conflict Highlighting**: Visual indicators for security risks and version conflicts
- **Responsive Interface**: Works seamlessly across desktop and mobile devices

### **Developer Experience**
- **Futuristic UI**: Animated landing page with modern design patterns
- **Smart Caching**: localStorage with time-based invalidation (5 minutes)
- **Toggle Controls**: Show/hide interface elements for streamlined workflow
- **Type Safety**: Full TypeScript coverage for robust development

## 🏭 Production Deployment

### **Frontend Build**
```bash
npm run build
npm start
```

### **Backend Production**
```bash
# Using uvicorn for production
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 🔧 Development Architecture

### **Frontend Patterns**
- **React Hooks**: useState, useEffect, useCallback for state management
- **TypeScript**: Full type safety with custom interfaces and generics
- **Component Architecture**: Modular components with clear separation of concerns
- **D3.js Integration**: useRef and useEffect for DOM manipulation and data binding

### **Backend Architecture**  
- **FastAPI**: Async endpoints with automatic OpenAPI documentation
- **Pydantic Models**: Request/response validation and serialization
- **ACI Integration**: Tool orchestration through OpenAI function calling
- **Error Handling**: Comprehensive exception handling with user-friendly messages

### **AI Integration**
- **Function Calling**: OpenAI GPT-4 orchestrates GitHub operations
- **Prompt Engineering**: Structured prompts for consistent, actionable issue content
- **Tool Definitions**: ACI function definitions for GitHub API operations
- **Response Processing**: Extract and format AI responses for UI consumption

## 🚀 Future Roadmap

### **Planned Features**
- **Context-Aware Code Reviews**: AI analyzes actual code impact of dependency updates
- **Automated Version Migrations**: Smart code transformations for major version updates  
- **Urgency Prioritization**: Risk-based scoring for update prioritization
- **Organization Analytics**: Team-wide dependency health dashboards
- **Integration APIs**: Webhook support for CI/CD pipeline integration

### **Deployment Options**

#### **Vercel (Frontend)**
```bash
# Deploy frontend to Vercel
npm run build
# Push to GitHub and connect to Vercel
```

#### **Railway/Render (Backend)**
```bash
# Deploy FastAPI backend to Railway/Render
# Set environment variables: OPENAI_API_KEY, ACI credentials
```

#### **Self-Hosted**
```bash
# Docker deployment (future)
docker-compose up -d
```

## 📄 API Documentation

When running the backend, visit [http://localhost:8000/docs](http://localhost:8000/docs) for interactive API documentation powered by FastAPI's automatic OpenAPI generation.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
