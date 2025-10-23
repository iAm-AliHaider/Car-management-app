# Car Management App - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "token": "jwt_token_here"
}
```

---

### Login
**POST** `/auth/login`

Authenticate user and receive token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "token": "jwt_token_here"
}
```

---

### Get Current User
**GET** `/auth/me`

Get currently authenticated user's information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890"
}
```

---

## Car Endpoints

### Get All User Cars
**GET** `/cars`

Get all cars belonging to the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "car_id",
    "userId": "user_id",
    "make": "Toyota",
    "model": "Camry",
    "year": 2020,
    "licensePlate": "ABC123",
    "vin": "1HGBH41JXMN109186",
    "color": "Blue",
    "mileage": 45000,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### Get Car by ID
**GET** `/cars/:id`

Get a specific car by ID.

**Headers:**
```
Authorization: Bearer <token>
```

---

### Create Car
**POST** `/cars`

Add a new car to the user's account.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "licensePlate": "ABC123",
  "vin": "1HGBH41JXMN109186",
  "color": "Blue",
  "mileage": 45000
}
```

---

### Update Car
**PUT** `/cars/:id`

Update car information.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "mileage": 46000,
  "color": "Red"
}
```

---

### Delete Car
**DELETE** `/cars/:id`

Delete a car from the user's account.

**Headers:**
```
Authorization: Bearer <token>
```

---

## Service Booking Endpoints

### Get All Service Bookings
**GET** `/services`

Get all service bookings for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

---

### Get Service Booking by ID
**GET** `/services/:id`

Get a specific service booking.

---

### Create Service Booking
**POST** `/services`

Create a new service booking.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "carId": "car_id",
  "serviceType": "Oil Change",
  "description": "Regular oil change and filter replacement",
  "scheduledDate": "2024-02-15T10:00:00Z",
  "serviceProvider": "Quick Lube Auto Center",
  "estimatedCost": 79.99,
  "notes": "Use synthetic oil"
}
```

**Service Types:**
- Oil Change
- Tire Rotation
- Brake Service
- Engine Repair
- Transmission Service
- Battery Replacement
- Air Conditioning
- General Maintenance
- Inspection
- Other

---

### Update Service Booking
**PUT** `/services/:id`

Update service booking details or status.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "completed",
  "actualCost": 85.99
}
```

**Status Values:**
- pending
- confirmed
- in-progress
- completed
- cancelled

---

### Delete Service Booking
**DELETE** `/services/:id`

Cancel/delete a service booking.

**Headers:**
```
Authorization: Bearer <token>
```

---

## Spare Parts Endpoints

### Get All Spare Parts
**GET** `/parts`

Get all available spare parts with optional filters.

**Query Parameters:**
- `category` (optional): Filter by category
- `search` (optional): Search in name, part number, or description

**Example:**
```
GET /parts?category=Filters&search=oil
```

---

### Get Spare Part by ID
**GET** `/parts/:id`

Get details of a specific spare part.

---

### Create Spare Part
**POST** `/parts`

Add a new spare part (admin function).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Engine Oil Filter",
  "partNumber": "OF-1001",
  "category": "Filters",
  "description": "High-performance oil filter",
  "price": 12.99,
  "stock": 50,
  "manufacturer": "AutoParts Pro",
  "compatibleModels": ["Toyota Camry", "Honda Accord"]
}
```

---

## Part Order Endpoints

### Get All Part Orders
**GET** `/orders`

Get all part orders for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

---

### Get Part Order by ID
**GET** `/orders/:id`

Get details of a specific order.

---

### Create Part Order
**POST** `/orders`

Create a new parts order.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "carId": "car_id",
  "items": [
    {
      "partId": "part_id_1",
      "quantity": 2
    },
    {
      "partId": "part_id_2",
      "quantity": 1
    }
  ],
  "shippingAddress": "123 Main St, City, State 12345",
  "paymentMethod": "Credit Card",
  "notes": "Please deliver to front door"
}
```

---

### Update Part Order
**PUT** `/orders/:id`

Update order status or payment information.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "shipped",
  "paymentStatus": "paid"
}
```

**Order Status Values:**
- pending
- processing
- shipped
- delivered
- cancelled

**Payment Status Values:**
- pending
- paid
- failed

---

### Cancel Part Order
**PUT** `/orders/:id/cancel`

Cancel an order and restore inventory.

**Headers:**
```
Authorization: Bearer <token>
```

---

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request**
```json
{
  "message": "Validation error message"
}
```

**401 Unauthorized**
```json
{
  "message": "Not authorized, no token"
}
```

**404 Not Found**
```json
{
  "message": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "message": "Server error message"
}
```

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Get Cars
```bash
curl -X GET http://localhost:5000/api/cars \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Car
```bash
curl -X POST http://localhost:5000/api/cars \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"make":"Toyota","model":"Camry","year":2020,"licensePlate":"ABC123"}'
```
