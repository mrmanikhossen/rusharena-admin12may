import { connectDB } from "@/lib/connectDB";
import User from "@/models/user";
import Transactions from "@/models/transection";
import smsLog from "@/models/smsLog";
import dipositScema from "@/models/dipositScema";
import { catchError, response } from "@/lib/healperFunc";

export async function POST(req) {
  try {
    await connectDB();

    // --- Parse body safely (supports both JSON & form-data)

    let body;
    try {
      body = await req.json();
    } catch {
      const text = await req.text();
      const params = new URLSearchParams(text);
      body = Object.fromEntries(params.entries());
    }

    const { key, time } = body;

    if (!key || typeof key !== "string") {
      return response(false, 400, "Invalid or missing 'key'");
    }

    // --- Extract values via regex
    const amountMatchB = key.match(/received Tk\s*([\d.]+)/i);
    const fromMatch = key.match(/from\s*(01[3-9]\d{8})/i);
    const trxIdMatch = key.match(/TrxID\s*([A-Z0-9]+)/i);

    const amountMatchN = key.match(/Amount: Tk\s*([\d.]+)/i);
    const senderMatch = key.match(/Sender:\s*(01[3-9]\d{8})/i);
    const txnIdMatch = key.match(/TxnID:\s*([A-Z0-9]+)/i);

    // ✅ FIXED LOGIC
    let amount = null;
    if (amountMatchB) amount = parseFloat(amountMatchB[1]);
    else if (amountMatchN) amount = parseFloat(amountMatchN[1]);

    let senderNumber = null;
    if (senderMatch) senderNumber = senderMatch[1];
    else if (fromMatch) senderNumber = fromMatch[1];

    let trxId = null;
    if (trxIdMatch) trxId = trxIdMatch[1];
    else if (txnIdMatch) trxId = txnIdMatch[1];

    const service = senderMatch ? "Nagad" : fromMatch ? "Bkash" : "Unknown";

    // --- Validate extracted data
    if (!amount || isNaN(amount) || amount <= 0) {
      return response(false, 400, "Invalid amount");
    }

    if (!trxId || trxId.length < 5) {
      return response(false, 400, "Invalid transaction ID");
    }

    const existingTx = await smsLog.findOne({ transactionId: trxId });
    if (existingTx)
      return response(false, 409, "Duplicate transaction detected");

    // --- Find matching deposit request
    const deposit = await dipositScema.findOne({ trxId: trxId });

    if (!deposit) {
      // Log as pending SMS if no deposit request found
      await smsLog.create({
        service,
        senderNumber,
        amount,
        transactionId: trxId,
        receivedAt: new Date(),
      });

      return response(
        true,
        200,
        "No deposit found. Logged SMS for later matching.",
      );
    }

    // --- Create a transaction record
    const newTx = await Transactions.create({
      userId: deposit.userId,
      type: "deposit",
      method: service,
      phone: senderNumber,
      id: trxId,
      amount,
      createdAt: new Date(),
    });

    if (!newTx)
      return response(false, 500, "Failed to create transaction record");

    // --- Update user balance
    const updatedUser = await User.findByIdAndUpdate(
      deposit.userId,
      { $inc: { dipositbalance: amount } },
      { new: true },
    );

    if (!updatedUser)
      return response(false, 404, "User not found while updating balance");

    // --- Clean up: delete matched deposit request
    await deposit.deleteOne();

    return response(true, 200, "Deposit successful and balance updated");
  } catch (err) {
    console.error("❌ Deposit route error:", err);
    return catchError(err);
  }
}
