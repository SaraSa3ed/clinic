const express = require('express');
const router = express.Router();

// Mock data for requisitions
const mockRequisitions = [
  {
    id: 1,
    requestNumber: 'REQ-001',
    status: 'approved',
    requestedBy: 'أحمد محمد',
    department: 'المشتريات',
    requestDate: '2024-01-15',
    items: [
      {
        id: 1,
        productName: 'قماش قطني',
        quantity: 100,
        unit: 'متر',
        estimatedCost: 5000
      }
    ],
    totalEstimatedCost: 5000,
    priority: 'عادي',
    notes: 'طلب عاجل للموسم الجديد'
  },
  {
    id: 2,
    requestNumber: 'REQ-002',
    status: 'pending',
    requestedBy: 'فاطمة أحمد',
    department: 'التصميم',
    requestDate: '2024-01-16',
    items: [
      {
        id: 2,
        productName: 'أزرار',
        quantity: 200,
        unit: 'قطعة',
        estimatedCost: 1000
      }
    ],
    totalEstimatedCost: 1000,
    priority: 'عالي',
    notes: 'مطلوب لتصميم جديد'
  },
  {
    id: 3,
    requestNumber: 'REQ-003',
    status: 'approved',
    requestedBy: 'محمد علي',
    department: 'الإنتاج',
    requestDate: '2024-01-17',
    items: [
      {
        id: 3,
        productName: 'خيوط',
        quantity: 50,
        unit: 'كيلو',
        estimatedCost: 2500
      }
    ],
    totalEstimatedCost: 2500,
    priority: 'عادي',
    notes: 'مخزون عادي'
  }
];

// Get all requisitions
router.get('/', async (req, res) => {
  try {
    const { status, limit } = req.query;
    
    let filteredRequisitions = mockRequisitions;
    
    // Filter by status if provided
    if (status && status !== 'all') {
      filteredRequisitions = mockRequisitions.filter(req => req.status === status);
    }
    
    // Apply limit if provided
    if (limit) {
      filteredRequisitions = filteredRequisitions.slice(0, parseInt(limit));
    }
    
    res.json({
      status: 'success',
      data: filteredRequisitions
    });
  } catch (error) {
    console.error('Error fetching requisitions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch requisitions'
    });
  }
});

// Get requisition by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const requisition = mockRequisitions.find(req => req.id === parseInt(id));
    
    if (!requisition) {
      return res.status(404).json({
        status: 'fail',
        message: 'Requisition not found'
      });
    }
    
    res.json({
      status: 'success',
      data: requisition
    });
  } catch (error) {
    console.error('Error fetching requisition:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch requisition'
    });
  }
});

// Create new requisition
router.post('/', async (req, res) => {
  try {
    const newRequisition = {
      id: mockRequisitions.length + 1,
      requestNumber: `REQ-${String(mockRequisitions.length + 1).padStart(3, '0')}`,
      status: 'pending',
      ...req.body,
      requestDate: new Date().toISOString().split('T')[0]
    };
    
    mockRequisitions.push(newRequisition);
    
    res.status(201).json({
      status: 'success',
      data: newRequisition
    });
  } catch (error) {
    console.error('Error creating requisition:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create requisition'
    });
  }
});

// Update requisition
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const requisitionIndex = mockRequisitions.findIndex(req => req.id === parseInt(id));
    
    if (requisitionIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Requisition not found'
      });
    }
    
    mockRequisitions[requisitionIndex] = {
      ...mockRequisitions[requisitionIndex],
      ...req.body
    };
    
    res.json({
      status: 'success',
      data: mockRequisitions[requisitionIndex]
    });
  } catch (error) {
    console.error('Error updating requisition:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update requisition'
    });
  }
});

// Delete requisition
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const requisitionIndex = mockRequisitions.findIndex(req => req.id === parseInt(id));
    
    if (requisitionIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Requisition not found'
      });
    }
    
    const deletedRequisition = mockRequisitions.splice(requisitionIndex, 1)[0];
    
    res.json({
      status: 'success',
      message: 'Requisition deleted successfully',
      data: deletedRequisition
    });
  } catch (error) {
    console.error('Error deleting requisition:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete requisition'
    });
  }
});

module.exports = router;
