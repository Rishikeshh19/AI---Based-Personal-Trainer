const API_BASE_URL = 'http://localhost:8000/api'; // Adjust the base URL as needed

// Function to handle API calls
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming token is stored in localStorage
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
}

// API functions
const api = {
    // Authentication
    login: async (credentials) => {
        return await apiCall('/auth/login', 'POST', credentials);
    },
    signup: async (userData) => {
        return await apiCall('/auth/signup', 'POST', userData);
    },

    // Member endpoints
    member: {
        getProfile: async () => {
            return await apiCall('/members/profile');
        },
        updateProfile: async (profileData) => {
            return await apiCall('/members/profile', 'PUT', profileData);
        },
        getProgress: async () => {
            return await apiCall('/members/progress');
        },
        assignTrainer: async (trainerId) => {
            return await apiCall('/members/assign-trainer', 'PUT', { trainerId });
        },
        getCurrentTrainer: async () => {
            return await apiCall('/members/current-trainer');
        }
    },

    // Trainer endpoints
    trainer: {
        getProfile: async () => {
            return await apiCall('/trainers/profile');
        },
        updateProfile: async (profileData) => {
            return await apiCall('/trainers/profile', 'PUT', profileData);
        },
        getAssignedClients: async () => {
            return await apiCall('/trainers/clients');
        },
        getClientDetails: async (clientId) => {
            return await apiCall(`/trainers/clients/${clientId}`);
        },
        removeClient: async (clientId) => {
            return await apiCall(`/trainers/clients/${clientId}`, 'DELETE');
        }
    },

    // Workouts
    addWorkout: async (workoutData) => {
        return await apiCall('/workouts', 'POST', workoutData);
    },
    getMemberWorkouts: async (memberId) => {
        return await apiCall(`/workouts/member/${memberId}`);
    },

    // Progress Reports
    getProgressReports: async (memberId) => {
        return await apiCall(`/progress/member/${memberId}`);
    },

    // AI Suggestions
    getAISuggestions: async (memberId) => {
        return await apiCall(`/ai-suggestions/member/${memberId}`);
    },

    // Messages
    messages: {
        send: async (receiverId, message) => {
            return await apiCall('/messages', 'POST', { receiverId, message });
        },
        getConversation: async (userId) => {
            return await apiCall(`/messages/${userId}`);
        },
        getAll: async () => {
            return await apiCall('/messages');
        },
        markAsRead: async (messageId) => {
            return await apiCall(`/messages/${messageId}/read`, 'PUT');
        },
        getUnreadCount: async () => {
            return await apiCall('/messages/unread/count');
        }
    }
};

// Expose api globally so it can be used from inline scripts
if (typeof window !== 'undefined') {
    window.api = api;
}