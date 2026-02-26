import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface Task {
  id: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dependencies: string[];
  status?: 'ready' | 'blocked' | 'error' | 'completed';
  errorMessage?: string;
}

export interface JobResponse {
  success: boolean;
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message?: string;
  cached?: boolean;
  data?: {
    tasks: Task[];
    hasCycles: boolean;
    cycleDetails: string[];
    completedAt: Date;
  };
  error?: string;
}

export const api = {
  // Submit transcript
  submitTranscript: async (transcript: string): Promise<JobResponse> => {
    const response = await axios.post(`${API_URL}/transcripts`, { transcript });
    return response.data;
  },

  // Check job status
  getJobStatus: async (jobId: string): Promise<JobResponse> => {
    const response = await axios.get(`${API_URL}/jobs/${jobId}`);
    return response.data;
  },

  // Mark task as completed
  completeTask: async (jobId: string, taskId: string): Promise<{ updatedTasks: Task[] }> => {
    const response = await axios.put(`${API_URL}/jobs/${jobId}/tasks/${taskId}/complete`);
    return response.data;
  },

  // Get all jobs
  getAllJobs: async () => {
    const response = await axios.get(`${API_URL}/jobs`);
    return response.data;
  }
};
