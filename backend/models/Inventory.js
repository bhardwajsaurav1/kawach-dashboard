const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  partId: { type: String, required: true, unique: true },
  partName: { type: String, required: true },
  availableQuantity: { type: Number, required: true, default: 0 },
  minimumStockLevel: { type: Number, required: true, default: 0 },
  supplierInfo: { type: String },
  partsIssued: { type: Number, default: 0 },
  partsReturned: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
