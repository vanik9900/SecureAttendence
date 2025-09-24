# SecureAttend Setup Guide

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.9+ (for local development)
- PostgreSQL 13+ (for local development)

## Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SecureAttend
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

4. **Default credentials**
   - Admin: admin@secureattend.com / admin123
   - User: user@secureattend.com / user123

## Local Development Setup

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Set up database**
   ```bash
   # Make sure PostgreSQL is running
   # Update DATABASE_URL in .env
   ```

6. **Run the backend**
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run the frontend**
   ```bash
   npm run dev
   ```

## Configuration

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/secureattend
SECRET_KEY=your-secret-key-change-in-production
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
FACE_RECOGNITION_THRESHOLD=0.6
LIVENESS_DETECTION_THRESHOLD=0.8
MASK_DETECTION_THRESHOLD=0.7
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Features

### Core Features
- ✅ **Face Recognition**: Real-time identification using webcam
- ✅ **Liveness Detection**: Prevents spoofing with photo/video attacks
- ✅ **Mask Handling**: Works with face coverings and obstructions
- ✅ **Admin Dashboard**: Complete management interface
- ✅ **Attendance Database**: Secure storage and reporting

### Advanced Features
- ✅ **Anomaly Alerts**: Real-time suspicious activity detection
- ✅ **API Integration**: RESTful APIs for third-party integration
- ✅ **Role-based Access Control**: Admin and user permissions
- ✅ **Data Security**: GDPR compliant with encryption

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - User logout

### Attendance
- `GET /api/attendance/records` - Get attendance records
- `GET /api/attendance/stats` - Get attendance statistics
- `GET /api/attendance/today` - Get today's attendance

### ML Processing
- `POST /api/ml/process-attendance` - Process attendance with face recognition
- `POST /api/ml/add-face` - Add user face encoding
- `DELETE /api/ml/remove-face/{user_id}` - Remove user face encoding
- `GET /api/ml/system-stats` - Get ML system statistics

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/alerts` - Get system alerts
- `GET /api/admin/settings` - Get system settings
- `PUT /api/admin/settings/{key}` - Update system setting

### Users
- `GET /api/users/` - Get users list (Admin only)
- `POST /api/users/` - Create user (Admin only)
- `PUT /api/users/{user_id}` - Update user (Admin only)
- `DELETE /api/users/{user_id}` - Delete user (Admin only)

## Machine Learning Models

### Face Detection
- **MTCNN**: Multi-task Cascaded Convolutional Networks
- **YOLO**: You Only Look Once (alternative)
- **Haar Cascade**: OpenCV fallback

### Face Recognition
- **FaceNet**: Converts faces to embeddings
- **ArcFace**: State-of-the-art recognition
- **Cosine Similarity**: For face matching

### Liveness Detection
- **CNN**: Texture analysis
- **RNN**: Temporal analysis
- **Optical Flow**: Motion detection
- **Blink Detection**: Eye movement analysis

### Mask Detection
- **MobileNetV2**: Binary classification
- **ResNet50**: High accuracy detection
- **Mask-aware Recognition**: Focus on visible features

## Security Features

- **JWT Authentication**: Secure token-based auth
- **HTTPS Encryption**: All communications encrypted
- **Biometric Data Encryption**: Face encodings are encrypted
- **GDPR Compliance**: Data protection and privacy
- **Role-based Access**: Admin and user permissions
- **Anomaly Detection**: Real-time security monitoring

## Troubleshooting

### Common Issues

1. **Camera not working**
   - Check browser permissions
   - Ensure HTTPS in production
   - Try different browsers

2. **Face recognition not working**
   - Ensure good lighting
   - Check face is clearly visible
   - Try removing glasses/masks

3. **Database connection issues**
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env
   - Check network connectivity

4. **ML models not loading**
   - Check models directory exists
   - Verify file permissions
   - Check available memory

### Performance Optimization

1. **Reduce processing time**
   - Lower image resolution
   - Adjust confidence thresholds
   - Use GPU acceleration

2. **Improve accuracy**
   - Add more training data
   - Fine-tune thresholds
   - Use better lighting

3. **Scale the system**
   - Use load balancers
   - Implement caching
   - Use distributed processing

## Support

For technical support or questions:
- Check the API documentation at `/docs`
- Review the logs for error messages
- Contact the development team

## License

This project is licensed under the MIT License - see the LICENSE file for details.
