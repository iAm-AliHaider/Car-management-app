import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SparePart from '../models/SparePart';

dotenv.config();

const spareParts = [
  {
    name: 'Engine Oil Filter',
    partNumber: 'OF-1001',
    category: 'Filters',
    description: 'High-performance engine oil filter for most vehicle models',
    price: 12.99,
    stock: 50,
    manufacturer: 'AutoParts Pro',
    compatibleModels: ['Toyota Camry', 'Honda Accord', 'Nissan Altima']
  },
  {
    name: 'Brake Pad Set',
    partNumber: 'BP-2002',
    category: 'Brakes',
    description: 'Premium ceramic brake pads for superior stopping power',
    price: 89.99,
    stock: 30,
    manufacturer: 'BrakeMax',
    compatibleModels: ['Ford F-150', 'Chevrolet Silverado']
  },
  {
    name: 'Air Filter',
    partNumber: 'AF-3003',
    category: 'Filters',
    description: 'High-flow air filter for improved engine performance',
    price: 24.99,
    stock: 75,
    manufacturer: 'AirFlow Systems',
    compatibleModels: ['Most vehicles']
  },
  {
    name: 'Spark Plug Set',
    partNumber: 'SP-4004',
    category: 'Engine',
    description: 'Iridium spark plugs for better fuel efficiency',
    price: 39.99,
    stock: 40,
    manufacturer: 'SparkTech',
    compatibleModels: ['Toyota', 'Honda', 'Mazda']
  },
  {
    name: 'Battery 12V',
    partNumber: 'BT-5005',
    category: 'Electrical',
    description: 'Maintenance-free automotive battery with 3-year warranty',
    price: 149.99,
    stock: 20,
    manufacturer: 'PowerCell',
    compatibleModels: ['Universal']
  },
  {
    name: 'Wiper Blade Set',
    partNumber: 'WB-6006',
    category: 'Body',
    description: 'All-season wiper blades for clear visibility',
    price: 19.99,
    stock: 60,
    manufacturer: 'ClearView',
    compatibleModels: ['Most vehicles']
  },
  {
    name: 'Transmission Fluid',
    partNumber: 'TF-7007',
    category: 'Fluids',
    description: 'Synthetic transmission fluid for smooth shifting',
    price: 34.99,
    stock: 45,
    manufacturer: 'FluidPro',
    compatibleModels: ['Automatic transmissions']
  },
  {
    name: 'Shock Absorber',
    partNumber: 'SA-8008',
    category: 'Suspension',
    description: 'Heavy-duty shock absorber for improved ride comfort',
    price: 129.99,
    stock: 25,
    manufacturer: 'RideSmooth',
    compatibleModels: ['SUVs and Trucks']
  },
  {
    name: 'Radiator Coolant',
    partNumber: 'RC-9009',
    category: 'Fluids',
    description: 'Advanced coolant for optimal engine temperature',
    price: 18.99,
    stock: 55,
    manufacturer: 'CoolMax',
    compatibleModels: ['All vehicles']
  },
  {
    name: 'Timing Belt',
    partNumber: 'TB-1010',
    category: 'Engine',
    description: 'Durable timing belt for precise engine timing',
    price: 79.99,
    stock: 35,
    manufacturer: 'EnginePro',
    compatibleModels: ['Honda', 'Toyota', 'Subaru']
  }
];

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/car-management';
    await mongoose.connect(mongoURI);

    console.log('Connected to MongoDB');

    // Clear existing spare parts
    await SparePart.deleteMany({});
    console.log('Cleared existing spare parts');

    // Insert new spare parts
    await SparePart.insertMany(spareParts);
    console.log('Seeded spare parts successfully');

    console.log('\nSample spare parts added:');
    spareParts.forEach((part, index) => {
      console.log(`${index + 1}. ${part.name} - $${part.price}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
