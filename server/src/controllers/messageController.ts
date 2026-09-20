import type { Request, Response } from 'express';
import { Message } from '../models/Message.js';
import { Contract } from '../models/Contract.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { notify } from '../utils/notify.js';

async function assertParty(contractId: string, userId: string) {
  const contract = await Contract.findById(contractId);
  if (!contract) throw new AppError('Contract not found.', 404);
  if (contract.clientId.toString() !== userId && contract.freelancerId.toString() !== userId) {
    throw new AppError('You are not a party to this contract.', 403);
  }
  return contract;
}

export const listMessages = asyncHandler(async (req: Request, res: Response) => {
  await assertParty(req.params.contractId, req.user!.userId);
  const messages = await Message.find({ contractId: req.params.contractId }).sort({ createdAt: 1 });
  res.json({ messages });
});

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const contract = await assertParty(req.params.contractId, req.user!.userId);
  const { text } = req.body as { text?: string };
  if (!text || !text.trim()) throw new AppError('Message text is required.');

  const senderId = req.user!.userId;
  const message = await Message.create({ contractId: contract._id, senderId, text: text.trim() });

  const recipientId =
    senderId === contract.clientId.toString() ? contract.freelancerId : contract.clientId;
  await notify(recipientId, 'message', text.trim().slice(0, 60), contract._id.toString());

  res.status(201).json({ message });
});
