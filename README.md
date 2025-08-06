# Dependency Heaven - Multi-Package Dependency Analyzer

A Next.js 15 React application for analyzing multiple package.json files and visualizing cross-project dependencies with TypeScript and Tailwind CSS.

## 🚀 Features

- **Multi-Package Analysis**: Add and analyze multiple package.json files simultaneously
- **Interactive D3.js Visualization**: Network graph showing dependency relationships
- **Conflict Detection**: Identifies version conflicts across packages  
- **Security Analysis**: Flags packages with known vulnerabilities
- **Cross-Package Dependencies**: Visualizes shared dependencies between projects
- **Real-time Validation**: Instant JSON validation with error highlighting
- **Responsive Design**: Tailwind CSS for mobile-first responsive design
- **TypeScript**: Full type safety and IntelliSense support

## 🛠️ Tech Stack

- **Next.js 15** - App Router with TypeScript
- **React 18** - Modern React with hooks
- **TypeScript** - Full type safety
- **Tailwind CSS** - Utility-first styling
- **D3.js** - Data visualization
- **ESLint** - Code linting

## 🏗️ Project Structure

```
dependency-heaven/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global styles with Tailwind
│   │   ├── layout.tsx           # Root layout component
│   │   └── page.tsx             # Home page component
│   ├── components/
│   │   ├── AnalysisPanel.tsx    # Main analysis dashboard
│   │   ├── DependencyVisualization.tsx  # D3.js network graph
│   │   ├── IssuesList.tsx       # Security/conflict warnings
│   │   ├── PackageInputs.tsx    # Tabbed input interface
│   │   ├── PackagesList.tsx     # Analyzed packages list
│   │   ├── StatsGrid.tsx        # Statistics overview
│   │   └── VisualizationControls.tsx  # Filters and search
│   └── types/
│       └── package.ts           # TypeScript type definitions
├── public/                      # Static assets
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
├── postcss.config.mjs          # PostCSS configuration
└── package.json                # Dependencies and scripts
```

## 🚀 Getting Started

1. **Clone and install dependencies:**
```bash
git clone <repository>
cd dependency-heaven
npm install
```

2. **Run development server:**
```bash
npm run dev
```

3. **Open [http://localhost:3000](http://localhost:3000)**

## 💻 Usage

1. **Add Packages**: Use tabs to add multiple package.json files
2. **Paste Content**: Copy package.json content into text areas
3. **Load Samples**: Click "Load Sample" for test data
4. **Analyze**: Click "Analyze All Packages" for visualization
5. **Explore**: Use filters, search, and click packages to explore

## 🎯 Key Features Explained

### Multi-Package Support
- Tabbed interface for managing multiple packages
- Individual or batch analysis
- Cross-package conflict detection

### Visualization
- Interactive D3.js force-directed network graph
- Color-coded dependency types
- Drag-and-drop nodes
- Hover tooltips with package details

### Issue Detection
- **Security**: Flags known vulnerable packages
- **Conflicts**: Detects version mismatches across packages
- **Dependencies**: Shows shared dependencies between projects

### Filtering & Search
- Filter by conflicts, security issues, or critical paths
- Real-time search across all packages
- Click packages to highlight their dependencies

## 🏭 Production Build

```bash
npm run build
npm start
```

## 🔧 Development

The app uses modern React patterns:
- **React Hooks**: useState, useEffect, useCallback
- **TypeScript**: Full type safety with custom interfaces
- **CSS Modules**: Scoped component styling with Tailwind
- **D3.js Integration**: useRef and useEffect for DOM manipulation

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
