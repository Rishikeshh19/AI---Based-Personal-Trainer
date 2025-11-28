# AI-Based Personal Trainer Assistant

## Overview
The AI-Based Personal Trainer Assistant is a distributed fitness management system designed to help gym members track their workouts, monitor progress, and receive personalized AI-driven suggestions. The system utilizes FastAPI for the backend and a simple HTML, CSS, and JavaScript frontend, ensuring a responsive and user-friendly experience.

## Features
- **User Authentication**: Secure signup and login for members and trainers using JWT.
- **Workout Tracking**: Members can log their workouts, including exercises, sets, reps, and calories burned.
- **Progress Monitoring**: Track individual progress over time with detailed reports.
- **AI Suggestions**: Receive personalized workout and nutrition recommendations based on performance data.
- **Real-time Updates**: Live workout statistics and progress tracking.

## Tech Stack
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: FastAPI
- **Database**: MongoDB / PostgreSQL
- **Caching**: Redis
- **Asynchronous Tasks**: Celery with RabbitMQ
- **Monitoring**: Prometheus and Logstash

## Setup Instructions

### Prerequisites
- Python 3.7 or higher
- Node.js (for frontend development)
- Docker (optional, for containerized setup)

### Backend Setup
1. Navigate to the `backend` directory.
2. Install the required Python packages:
   ```
   pip install -r requirements.txt
   ```
3. Start the FastAPI application:
   ```
   uvicorn app:app --reload
   ```

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Open `index.html` in a web browser to access the application.

### Running with Docker
1. Ensure Docker is installed and running.
2. In the root directory, run:
   ```
   docker-compose up
   ```

## Usage
- Access the application through your web browser.
- Use the login page to authenticate or create a new account.
- Log workouts and view progress on the dashboard.
- Receive AI-generated suggestions to enhance your fitness journey.

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.