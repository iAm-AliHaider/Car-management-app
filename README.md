# Car Management App

A comprehensive car management application with service booking and spare parts ordering capabilities.

## Features

- **User Authentication**: Secure login and registration system
- **Car Management**: Add, edit, and manage your vehicles
- **Service Booking**: Book maintenance and repair services
- **Spare Parts Ordering**: Order spare parts for your vehicles
- **Maintenance History**: Track all service records
- **Service Providers**: Manage service centers and providers

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express
- TypeScript
- MongoDB (Mongoose)
- JWT Authentication
- bcrypt

## Project Structure

```
Car-management-app/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── package.json
├── backend/           # Node.js backend API
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── config/
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Car-management-app
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Configure environment variables:

Backend (.env):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/car-management
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

Frontend (.env):
```env
VITE_API_URL=http://localhost:5000/api
```

### Running the Application

1. Start MongoDB:
```bash
mongod
```

2. Start the backend server:
```bash
cd backend
npm run dev
```

3. Start the frontend development server:
```bash
cd frontend
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Car Endpoints

- `GET /api/cars` - Get all user cars
- `POST /api/cars` - Add new car
- `GET /api/cars/:id` - Get car by ID
- `PUT /api/cars/:id` - Update car
- `DELETE /api/cars/:id` - Delete car

### Service Booking Endpoints

- `GET /api/bookings/service` - Get all service bookings
- `POST /api/bookings/service` - Create service booking
- `GET /api/bookings/service/:id` - Get booking by ID
- `PUT /api/bookings/service/:id` - Update booking
- `DELETE /api/bookings/service/:id` - Cancel booking

### Spare Parts Endpoints

- `GET /api/parts` - Get all spare parts
- `POST /api/parts/order` - Order spare parts
- `GET /api/parts/orders` - Get user's part orders
- `GET /api/parts/orders/:id` - Get order by ID

## Default Credentials

For testing purposes:
- Email: admin@carmanagement.com
- Password: admin123

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@carmanagement.com or open an issue in the repository.
