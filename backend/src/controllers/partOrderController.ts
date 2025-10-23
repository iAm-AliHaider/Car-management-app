import { Response } from 'express';
import PartOrder from '../models/PartOrder';
import SparePart from '../models/SparePart';
import { AuthRequest } from '../middleware/auth';

// Get all part orders for user
export const getPartOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await PartOrder.find({ userId: req.user._id })
      .populate('carId', 'make model year licensePlate')
      .populate('items.partId', 'name partNumber')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error: any) {
    console.error('Get part orders error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Get part order by ID
export const getPartOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const order = await PartOrder.findOne({
      _id: req.params.id,
      userId: req.user._id
    })
      .populate('carId', 'make model year licensePlate')
      .populate('items.partId');

    if (!order) {
      return res.status(404).json({ message: 'Part order not found' });
    }

    res.json(order);
  } catch (error: any) {
    console.error('Get part order by ID error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Create part order
export const createPartOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { carId, items, shippingAddress, paymentMethod, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must have at least one item' });
    }

    // Verify parts exist and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const part = await SparePart.findById(item.partId);

      if (!part) {
        return res.status(404).json({ message: `Part ${item.partId} not found` });
      }

      if (part.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${part.name}. Available: ${part.stock}`
        });
      }

      orderItems.push({
        partId: item.partId,
        quantity: item.quantity,
        priceAtOrder: part.price
      });

      totalAmount += part.price * item.quantity;

      // Update stock
      part.stock -= item.quantity;
      await part.save();
    }

    const order = await PartOrder.create({
      userId: req.user._id,
      carId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      notes
    });

    const populatedOrder = await PartOrder.findById(order._id)
      .populate('carId', 'make model year licensePlate')
      .populate('items.partId');

    res.status(201).json(populatedOrder);
  } catch (error: any) {
    console.error('Create part order error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Update part order (status, payment, etc.)
export const updatePartOrder = async (req: AuthRequest, res: Response) => {
  try {
    const order = await PartOrder.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!order) {
      return res.status(404).json({ message: 'Part order not found' });
    }

    const { status, paymentStatus, paymentMethod, notes } = req.body;

    order.status = status || order.status;
    order.paymentStatus = paymentStatus || order.paymentStatus;
    order.paymentMethod = paymentMethod || order.paymentMethod;
    order.notes = notes !== undefined ? notes : order.notes;

    const updatedOrder = await order.save();
    const populatedOrder = await PartOrder.findById(updatedOrder._id)
      .populate('carId', 'make model year licensePlate')
      .populate('items.partId');

    res.json(populatedOrder);
  } catch (error: any) {
    console.error('Update part order error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Cancel part order
export const cancelPartOrder = async (req: AuthRequest, res: Response) => {
  try {
    const order = await PartOrder.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!order) {
      return res.status(404).json({ message: 'Part order not found' });
    }

    if (order.status === 'delivered' || order.status === 'shipped') {
      return res.status(400).json({
        message: 'Cannot cancel order that is already shipped or delivered'
      });
    }

    // Return stock
    for (const item of order.items) {
      const part = await SparePart.findById(item.partId);
      if (part) {
        part.stock += item.quantity;
        await part.save();
      }
    }

    order.status = 'cancelled';
    await order.save();

    res.json({ message: 'Order cancelled successfully' });
  } catch (error: any) {
    console.error('Cancel part order error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
