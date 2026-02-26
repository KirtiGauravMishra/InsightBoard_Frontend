import React, { useState, useEffect } from 'react';
import './App.css';
import { api, Task, JobResponse } from './api';
import DependencyGraph from './components/DependencyGraph';

function App() {
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hasCycles, setHasCycles] = useState(false);
  const [cycleDetails, setCycleDetails] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');

  // Sample transcript from actual assignment
  const sampleTranscript = `**Meeting Title:** Project Odyssey - Pre-Launch Technical & GTM Sync
**Date:** November 21, 2023
**Attendees:** Priya (Product Manager), David (Lead Engineer), Maria (Marketing Lead), Sam (QA Lead)

**Priya:** Alright team, welcome to the sync for Project Odyssey. We're officially in the home stretch, with launch scheduled for two weeks from today. The goal here is to get a final status check, identify any remaining red flags, and ensure Engineering, QA, and Marketing are perfectly aligned. David, let's start with you. How is the engineering work looking?

**David:** It's been a challenging week, Priya. The good news is that the new multi-tenant architecture is fully deployed to staging. The bad news is we've uncovered a pretty nasty P0 blocker. The integration with the Stripe payment gateway is failing intermittently under load. During our stress tests last night, we saw a 20% transaction failure rate once we went past 100 concurrent users. This is a complete showstopper for launch.

**Priya:** A 20% failure rate is definitely a no-go. What's the immediate plan?

**David:** It's my only priority right now. I've been tracing the logs since 5 AM. It seems to be a race condition when new customer accounts are created simultaneously with their first subscription record. I need to get this fixed, patched, and redeployed by the end of this week, no excuses. After that, I will need Sam's team to run a full regression test over the weekend.

**Sam:** We can do that, David, but my team is already stretched. Our automated test suite for the CI/CD pipeline is still flaky because of environment timeouts. It's been failing randomly for a week. We've been having to do a lot of manual testing, which is slow. The signup and login flows have to be manually verified on Chrome, Firefox, and Safari for every single build. It's becoming a huge bottleneck.

**Priya:** Okay, two major issues. David, is the environment instability related to the payment gateway bug?

**David:** Unlikely. I think the timeouts are a separate issue, probably related to the database connection pool on the staging server. It's a lower priority than the payment bug, but it's clearly impacting QA. Let me be clear, the P0 bug is the mountain we have to climb this week. I can create a ticket to investigate the staging DB performance, but I won't be able to look at it until Odyssey is launched.

**Priya:** Understood. Sam, for now, you'll have to continue with manual verification for the critical paths. David, please provide a stable build to Sam by Monday morning for the full regression run. That's a hard dependency.

**David:** Got it. Stable build by Monday AM.

**Priya:** Let's switch to marketing. Maria, what do you need from the technical team?

**Maria:** We're moving full speed ahead. The launch day blog post is written, but I'm blocked. I need David to review the "How It Works" section for technical accuracy. It's a bit jargon-heavy, and I want to make sure we're not misrepresenting the new architecture. I need that review done by Thursday EOD to get it to our copy-editor on Friday.

**David:** I can do that. Send me the draft. It'll be a welcome distraction from the payment bug.

**Maria:** Thanks, David. The other major item is assets for the press kit. We need high-resolution screenshots of the new dashboard, specifically the new analytics view. With the staging environment being unstable, we can't get clean shots.

**Priya:** That's a problem. We can't use mockups for the press. This is a high-priority need. David, once the payment bug is fixed and the build is stable, can you coordinate with Maria to get her those screenshots? This needs to happen by Tuesday next week at the absolute latest.

**David:** It'll be tight, but I'll make it happen. I'll ping Maria as soon as the environment is clean.

**Maria:** Perfect. One last thing from me, more of an idea. I was thinking we should prepare an A/B test for the new homepage headline copy post-launch to optimize our conversion rate. It's not urgent, just something we should probably plan for.

**Priya:** Great idea, Maria. Let's not lose it. Can you create a brief document outlining the proposed headlines and the success metrics? We can review it in a couple of weeks. Consider it a low-priority backlog item for now. Okay, anything else?

**Sam:** Yes, one more thing. With all the focus on Project Odyssey, we've completely neglected the bug backlog for our legacy product, Titan. We have a memory leak issue in the Titan reporting service that's causing the server to crash twice a week. Customers are complaining. It's not a P0, but it's a high-visibility, high-annoyance bug. Someone needs to at least investigate it.

**Priya:** You're right, Sam. We can't let our existing customers suffer. David, I know you're swamped, but this is important. Can you allocate four hours next week to do a preliminary investigation and document your findings? We need to at least show progress.

**David:** It's a lot to juggle, but I understand. Four hours next week to investigate the Titan memory leak. I'll add it to my calendar.

**Priya:** Thank you, David. Okay, that was a lot to cover. Let's make sure we have this straight. The payment bug is the top priority for everyone. Everything else is secondary until that is resolved. Let's execute. Good work, team.`;

  // Poll for job status
  useEffect(() => {
    if (!jobId || status === 'completed' || status === 'failed') {
      console.log('⏸️ Polling stopped:', { jobId, status });
      return;
    }

    console.log('🔄 Starting polling for jobId:', jobId);

    const interval = setInterval(async () => {
      try {
        console.log('📡 Polling job status...');
        const response = await api.getJobStatus(jobId);
        console.log('📊 Job status response:', response);
        setStatus(response.status);

        if (response.status === 'completed' && response.data) {
          console.log('✅ Job completed! Tasks:', response.data.tasks.length);
          setTasks(response.data.tasks);
          setHasCycles(response.data.hasCycles);
          setCycleDetails(response.data.cycleDetails || []);
          setLoading(false);
        } else if (response.status === 'failed') {
          console.log('❌ Job failed:', response.error);
          setError(response.error || 'Processing failed');
          setLoading(false);
        }
      } catch (err: any) {
        console.error('❌ Polling error:', err);
        setError(err.message);
        setLoading(false);
      }
    }, 2000);

    return () => {
      console.log('🛑 Stopping polling interval');
      clearInterval(interval);
    };
  }, [jobId, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTasks([]);
    setHasCycles(false);
    setCycleDetails([]);

    try {
      const response: JobResponse = await api.submitTranscript(transcript);
      console.log('📤 Submit response:', response);
      setJobId(response.jobId);
      setStatus(response.status);

      // Handle cached/completed responses immediately
      if (response.status === 'completed' && response.data) {
        console.log('✅ Immediate completion! Tasks:', response.data.tasks.length);
        setTasks(response.data.tasks);
        setHasCycles(response.data.hasCycles);
        setCycleDetails(response.data.cycleDetails || []);
        setLoading(false);
      } else if (response.cached && response.data) {
        console.log('💾 Cached response! Tasks:', response.data.tasks.length);
        setTasks(response.data.tasks);
        setHasCycles(response.data.hasCycles);
        setCycleDetails(response.data.cycleDetails || []);
        setLoading(false);
        setStatus('completed');
      }
    } catch (err: any) {
      console.error('❌ Submit error:', err);
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    if (!jobId) return;

    try {
      const response = await api.completeTask(jobId, taskId);
      setTasks(response.updatedTasks);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#dc2626';
      case 'high':
        return '#f97316';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#3b82f6';
      default:
        return '#64748b';
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎯 InsightBoard Dependency Engine</h1>
        <p className="subtitle">Convert meeting transcripts into actionable task graphs</p>
      </header>

      <main className="container">
        <div className="input-section">
          <form onSubmit={handleSubmit}>
            <label htmlFor="transcript">Meeting Transcript:</label>
            <textarea
              id="transcript"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste your meeting transcript here..."
              rows={12}
              required
            />
            <div className="button-group">
              <button type="submit" disabled={loading || !transcript.trim()}>
                {loading ? '⏳ Processing...' : '🚀 Generate Dependency Graph'}
              </button>
              <button
                type="button"
                onClick={() => setTranscript(sampleTranscript)}
                className="secondary-btn"
              >
                📝 Load Sample Transcript
              </button>
            </div>
          </form>

          {status && (
            <div className={`status-badge status-${status}`}>
              Status: {status.toUpperCase()}
              {status === 'processing' && ' ⏳'}
              {status === 'completed' && ' ✅'}
              {status === 'failed' && ' ❌'}
            </div>
          )}

          {error && <div className="error-box">❌ {error}</div>}

          {hasCycles && (
            <div className="warning-box">
              ⚠️ <strong>Circular Dependencies Detected!</strong>
              <ul>
                {cycleDetails.map((cycle, idx) => (
                  <li key={idx}>{cycle}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {tasks.length > 0 && (
          <div className="results-section">
            <div className="results-header">
              <h2>📊 Dependency Graph ({tasks.length} tasks)</h2>
              <div className="view-toggle">
                <button
                  className={viewMode === 'graph' ? 'active' : ''}
                  onClick={() => setViewMode('graph')}
                >
                  🔗 Graph View
                </button>
                <button
                  className={viewMode === 'list' ? 'active' : ''}
                  onClick={() => setViewMode('list')}
                >
                  📋 List View
                </button>
              </div>
            </div>

            {viewMode === 'graph' ? (
              <DependencyGraph tasks={tasks} onTaskComplete={handleTaskComplete} />
            ) : (
              <div className="task-list">
                {tasks.map((task) => (
                  <div key={task.id} className={`task-card task-${task.status}`}>
                    <div className="task-header">
                      <span className="task-id">{task.id}</span>
                      <span
                        className="priority-badge"
                        style={{ background: getPriorityColor(task.priority) }}
                      >
                        {task.priority}
                      </span>
                      <span className={`status-badge status-${task.status}`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="task-description">{task.description}</p>
                    {task.dependencies.length > 0 && (
                      <p className="dependencies">
                        📌 Dependencies: {task.dependencies.join(', ')}
                      </p>
                    )}
                    {task.errorMessage && (
                      <p className="error-message">❌ {task.errorMessage}</p>
                    )}
                    {task.status === 'ready' && (
                      <button
                        className="complete-btn"
                        onClick={() => handleTaskComplete(task.id)}
                      >
                        ✓ Mark as Complete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>
          <strong>Level 3 Implementation</strong> - Async Processing + Cycle
          Detection + Interactive Graph Visualization
        </p>
        <p className="tech-stack">
          Tech Stack: React + TypeScript + React Flow | Node.js + Express +
          MongoDB | OpenAI GPT-3.5
        </p>
      </footer>
    </div>
  );
}

export default App;
