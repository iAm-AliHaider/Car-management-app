# Docker Setup for Car Management App

This guide explains how to run the Car Management Application using Docker and Docker Compose.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (version 20.10 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0 or higher)

Verify installations:
```bash
docker --version
docker-compose --version
```

## Quick Start

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd Car-management-app
   ```

2. **Start all services**:
   ```bash
   docker-compose up -d
   ```

   This will start:
   - MongoDB on port `27017`
   - Backend API on port `5000`
   - Frontend on port `5173`

3. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - MongoDB: mongodb://admin:admin123@localhost:27017

4. **View logs**:
   ```bash
   # All services
   docker-compose logs -f

   # Specific service
   docker-compose logs -f backend
   docker-compose logs -f frontend
   docker-compose logs -f mongodb
   ```

5. **Stop all services**:
   ```bash
   docker-compose down
   ```

## Services

### MongoDB
- **Image**: mongo:7.0
- **Port**: 27017
- **Credentials**:
  - Username: `admin`
  - Password: `admin123`
  - Database: `car_management`
- **Data Persistence**: Data is persisted in a Docker volume named `mongodb_data`

### Backend API
- **Port**: 5000
- **Technology**: Node.js, Express, TypeScript
- **Environment Variables**:
  - `NODE_ENV`: development
  - `PORT`: 5000
  - `MONGODB_URI`: mongodb://admin:admin123@mongodb:27017/car_management?authSource=admin
  - `JWT_SECRET`: your-super-secret-jwt-key-change-this-in-production
  - `JWT_EXPIRE`: 7d

### Frontend
- **Port**: 5173
- **Technology**: React, Vite, TypeScript, Tailwind CSS
- **Environment Variables**:
  - `VITE_API_URL`: http://localhost:5000

## Useful Commands

### Build and Start
```bash
# Build and start all services
docker-compose up --build

# Start in detached mode (background)
docker-compose up -d

# Rebuild specific service
docker-compose up --build backend
```

### Stop and Remove
```bash
# Stop all services
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop, remove containers, and remove volumes (deletes database data)
docker-compose down -v
```

### View Status
```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs

# Follow logs (real-time)
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
```

### Execute Commands in Containers
```bash
# Access backend container shell
docker-compose exec backend sh

# Access MongoDB shell
docker-compose exec mongodb mongosh -u admin -p admin123

# Run npm commands in backend
docker-compose exec backend npm install <package-name>

# Run npm commands in frontend
docker-compose exec frontend npm install <package-name>
```

### Restart Services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
```

## Development Workflow

The Docker setup includes volume mounts for hot-reloading during development:

- **Backend**: Changes to `./backend/src` are automatically reflected
- **Frontend**: Changes to `./frontend/src` trigger Vite's hot module replacement

No need to rebuild containers when editing source code!

## Database Management

### Access MongoDB
```bash
# Using docker-compose
docker-compose exec mongodb mongosh -u admin -p admin123 car_management

# Using MongoDB Compass
mongodb://admin:admin123@localhost:27017/car_management?authSource=admin
```

### Backup Database
```bash
# Create backup
docker-compose exec mongodb mongodump --username admin --password admin123 --authenticationDatabase admin --db car_management --out /backup

# Copy backup to host
docker cp car-management-mongodb:/backup ./mongodb-backup
```

### Restore Database
```bash
# Copy backup to container
docker cp ./mongodb-backup car-management-mongodb:/restore

# Restore
docker-compose exec mongodb mongorestore --username admin --password admin123 --authenticationDatabase admin --db car_management /restore/car_management
```

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory (copy from `.env.example`):

```bash
cp backend/.env.example backend/.env
```

Then customize as needed. Note: Docker Compose overrides these with values in `docker-compose.yml`.

### Frontend Environment Variables

The frontend uses Vite's environment variable system. The `VITE_API_URL` is set in `docker-compose.yml`.

For local development without Docker, create `frontend/.env.local`:
```
VITE_API_URL=http://localhost:5000
```

## Troubleshooting

### Port Already in Use
If you get port conflicts:
```bash
# Check what's using the port
lsof -i :5000  # or :5173, :27017

# Either stop the conflicting service or change ports in docker-compose.yml
```

### Backend Can't Connect to MongoDB
- Ensure MongoDB is healthy: `docker-compose ps`
- Check MongoDB logs: `docker-compose logs mongodb`
- The backend waits for MongoDB health check before starting

### Frontend Can't Connect to Backend
- Verify backend is running: `docker-compose ps`
- Check backend logs: `docker-compose logs backend`
- Ensure `VITE_API_URL` points to `http://localhost:5000`

### Containers Keep Restarting
```bash
# View logs for errors
docker-compose logs

# Check specific service
docker-compose logs backend
```

### Clean Slate
If things are really broken:
```bash
# Stop everything
docker-compose down -v

# Remove images
docker-compose rm

# Rebuild and start
docker-compose up --build
```

## Production Deployment

For production, you should:

1. **Change default credentials** in `docker-compose.yml`
2. **Use environment variables** for sensitive data
3. **Enable HTTPS** with a reverse proxy (nginx, traefik)
4. **Use production builds** for frontend
5. **Set up proper backup** strategies for MongoDB
6. **Configure resource limits** for containers

Example production changes:
```yaml
# docker-compose.prod.yml
services:
  mongodb:
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}

  backend:
    environment:
      NODE_ENV: production
      JWT_SECRET: ${JWT_SECRET}
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

## Getting Started with the App

Once the application is running:

1. Open http://localhost:5173 in your browser
2. Click "Register" to create a new account
3. Log in with your credentials
4. Start managing your cars, services, accidents, and more!

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

## Support

For issues or questions:
- Check the main README.md
- Review Docker logs
- Open an issue on the repository
