# InsightBoard Frontend - Interactive Dependency Graph Viewer

React-based frontend for visualizing task dependencies from meeting transcripts with interactive graph UI.

## 🌐 Live Demo

- **Frontend**: Coming soon (deploying to Vercel)
- **Backend API**: https://github.com/KirtiGauravMishra/InsightBoard_Backend

## 🎯 Features Implemented

### ✅ Level 3 (Bonus)
- **Interactive Visualization** - React Flow node-based UI
- **Visual Status Indicators** - color-coded task states
- **Task Completion** - click to mark tasks as complete
- **Real-time Updates** - dependencies unlock automatically
- **Graph View** - see task relationships visually
- **List View** - traditional list display

## 🎨 Status Colors

| Status | Color | Meaning |
|--------|-------|---------|
| 🟢 **Ready** | Green | No dependencies, can start |
| 🔴 **Blocked** | Red | Has pending dependencies |
| ✅ **Completed** | Blue | Task finished |
| ⚠️ **Error** | Orange | Part of circular dependency |

## 🎨 Priority Badges

- **🔥 Critical** - Red badge
- **⚡ High** - Orange badge
- **📌 Medium** - Yellow badge
- **📋 Low** - Blue badge

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Visualization**: React Flow (node-based graphs)
- **HTTP Client**: Axios
- **Styling**: CSS3 with custom components
- **State Management**: React Hooks (useState, useEffect)
- **Deployment**: Vercel

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- Backend running on port 5000

### Installation

```bash
# Clone repo
git clone https://github.com/KirtiGauravMishra/InsightBoard_Frontend.git
cd InsightBoard_Frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Set backend URL in .env:
# REACT_APP_API_URL=http://localhost:5000/api

# Start dev server
npm start
```

App runs on: http://localhost:3000

## 📁 Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── DependencyGraph.tsx    # React Flow visualization
│   │   └── DependencyGraph.css    # Graph styling
│   ├── App.tsx                     # Main app component
│   ├── App.css                     # App styling
│   ├── api.ts                      # API client (Axios)
│   ├── index.tsx                   # React entry point
│   └── index.css                   # Global styles
└── package.json
```

## 🎮 Usage

1. **Load Sample Transcript**
   - Click "📝 Load Sample Transcript" button
   - Pre-filled meeting transcript appears

2. **Generate Graph**
   - Click "🚀 Generate Dependency Graph"
   - Wait 10-20 seconds for AI processing
   - Graph displays automatically

3. **View Tasks**
   - Toggle between "🔀 Graph View" and "📋 List View"
   - See task dependencies visually

4. **Complete Tasks**
   - Click "✅ Mark Complete" on ready tasks
   - Watch dependent tasks unlock automatically
   - Blocked tasks become ready when dependencies finish

## 🎯 Key Features

### Async Job Polling
```typescript
// Polls backend every 2 seconds for job status
useEffect(() => {
  const interval = setInterval(async () => {
    const response = await api.getJobStatus(jobId);
    if (response.status === 'completed') {
      setTasks(response.data.tasks);
    }
  }, 2000);
}, [jobId]);
```

### Client-Side Dependency Updates
```typescript
// When task completes, unlock dependent tasks
const handleTaskComplete = async (taskId: string) => {
  await api.completeTask(jobId, taskId);
  
  // Update local state immediately
  setTasks(prev => prev.map(t => {
    if (t.id === taskId) return { ...t, status: 'Completed' };
    
    // Unlock tasks that depended on this
    const isBlocked = t.dependencies.some(dep => 
      tasks.find(dt => dt.id === dep)?.status !== 'Completed'
    );
    return { ...t, status: isBlocked ? 'Blocked' : 'Ready' };
  }));
};
```

## 🔌 API Integration

```typescript
// api.ts - Axios client
export const api = {
  submitTranscript: async (transcript: string) => {
    const response = await axios.post(
      `${API_URL}/transcripts`,
      { transcript }
    );
    return response.data;
  },
  
  getJobStatus: async (jobId: string) => {
    const response = await axios.get(`${API_URL}/jobs/${jobId}`);
    return response.data;
  },
  
  completeTask: async (jobId: string, taskId: string) => {
    const response = await axios.put(
      `${API_URL}/jobs/${jobId}/tasks/${taskId}/complete`
    );
    return response.data;
  }
};
```

## 🎨 React Flow Nodes

```typescript
// Custom node component
const CustomNode = ({ data }: NodeProps) => (
  <div className={`custom-node ${data.status.toLowerCase()}`}>
    <div className="node-header">
      <strong>{data.label}</strong>
      <span className={`badge priority-${data.priority}`}>
        {data.priority}
      </span>
    </div>
    
    <div className="node-body">
      <p>{data.description}</p>
      <span className={`status-badge ${data.status}`}>
        {data.status}
      </span>
    </div>
    
    {data.status === 'Ready' && (
      <button onClick={() => data.onComplete(data.id)}>
        ✅ Mark Complete
      </button>
    )}
  </div>
);
```

## 🔑 Environment Variables

```env
REACT_APP_API_URL=http://localhost:5000/api
```

For production (Vercel):
```env
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

## 📦 Build for Production

```bash
# Create optimized build
npm run build

# Serve locally to test
npx serve -s build
```

## 🐛 Troubleshooting

**CORS error:**
- Verify backend has `cors()` middleware enabled
- Check `REACT_APP_API_URL` matches backend URL

**Tasks not loading:**
- Check browser console for errors
- Verify backend is running and accessible
- Check network tab for API responses

**Graph not rendering:**
- Clear browser cache
- Check React Flow is installed: `npm list react-flow-renderer`
- Verify tasks have valid `id` and `dependencies`

## 🧪 Testing

```bash
# Run tests (if configured)
npm test

# Build and check for errors
npm run build
```

## 📝 Assignment Details

**Level Completed**: Level 3

**Key Features**:
1. **React Flow Visualization**: Interactive node-based dependency graph
2. **Status Management**: Visual indicators for task states
3. **Task Completion**: Client-side completion with dependency updates
4. **Async Handling**: Polling for job status, loading states

## 📄 License

MIT

## 👤 Author

Kirti Gaurav Mishra
- GitHub: [@KirtiGauravMishra](https://github.com/KirtiGauravMishra)
- Email: kirtigauravmishra@gmail.com

## 🔗 Related Repositories

- **Backend API**: https://github.com/KirtiGauravMishra/InsightBoard_Backend

## 🎥 Demo

![InsightBoard Demo](https://via.placeholder.com/800x400?text=InsightBoard+Dependency+Graph)

*Screenshot: Interactive dependency graph with task completion*
