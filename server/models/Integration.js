const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      required: true,
      enum: ['google', 'whatsapp', 'sms', 'other'],
    },
    accountEmail: {
      type: String,
      trim: true,
      default: '',
    },
    encryptedTokens: {
      accessToken: { type: String, default: null },
      refreshToken: { type: String, default: null },
      iv: { type: String, default: null },
    },
    scopes: {
      type: [String],
      default: [],
    },
    connected: {
      type: Boolean,
      default: false,
    },
    lastSyncedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

integrationSchema.index({ userId: 1, provider: 1 }, { unique: true });

const Integration = mongoose.model('Integration', integrationSchema);
module.exports = Integration;
