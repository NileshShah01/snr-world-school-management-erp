/**
 * Payment Service - Core Business Logic for Fees and Payments
 */
const PaymentService = {
    /**
     * Records a payment and updates related fee records atomically.
     * @param {Object} paymentData { studentId, amount, method, remarks, session, reference, feeIds (optional - for manual allocation) }
     */
    async recordPayment(paymentData) {
        const { studentId, amount, method, remarks, session, reference, feeIds } = paymentData;
        
        if (!studentId || isNaN(amount) || amount <= 0) {
            throw new Error('Invalid payment data provided.');
        }

        const db = window.db || firebase.firestore();
        // Unique receipt: R-YYYYMMDD-TIMESTAMP-RANDOM4 (collision-proof)
        const now = new Date();
        const datePart = now.getFullYear().toString() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0');
        const timePart = Date.now().toString().slice(-6);
        const randPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const receiptNo = `R-${datePart}-${timePart}${randPart}`;
        
        // Fetch pending fees outside the transaction (Firestore transactions don't support query reads)
        let pendingFeeDocs;
        if (feeIds && feeIds.length > 0) {
            // Manual allocation: fetch ONLY selected fees
            const feePromises = feeIds.map(id => schoolData('fees').doc(id).get());
            const feeDocs = await Promise.all(feePromises);
            pendingFeeDocs = feeDocs.filter(d => d.exists);
        } else {
            // Auto-allocation (FIFO): fetch all pending/partial fees
            const feeQuerySnap = await schoolData('fees')
                .where('studentId', '==', studentId)
                .where('status', 'in', ['pending', 'partial'])
                .get();
            pendingFeeDocs = feeQuerySnap.docs;
        }

        return db.runTransaction(async (transaction) => {
            // 1. Re-fetch each fee document inside the transaction for atomicity
            const feeDocs = await Promise.all(
                pendingFeeDocs.map(d => transaction.get(d.ref))
            );
            const feeSnap = { docs: feeDocs.filter(d => d.exists) };
            
            // 2. Allocation Logic (FIFO)
            let remainingAmount = amount;
            const updates = [];
            const allocations = []; // Track which fees are paid
            
            // Sort fees by year and month to ensure FIFO
            const sortedDocs = feeSnap.docs.sort((a, b) => {
                const fa = a.data();
                const fb = b.data();
                const dateA = new Date(`${fa.month} ${fa.year}`);
                const dateB = new Date(`${fb.month} ${fb.year}`);
                return dateA - dateB;
            });

            for (const doc of sortedDocs) {
                if (remainingAmount <= 0) break;
                
                const fee = doc.data();
                const due = fee.amount - (fee.paidAmount || 0);
                const paymentForThisFee = Math.min(remainingAmount, due);
                
                const newPaidAmount = (fee.paidAmount || 0) + paymentForThisFee;
                const newStatus = newPaidAmount >= fee.amount ? 'paid' : 'partial';
                
                allocations.push({
                    feeId: doc.id,
                    feeType: fee.feeType || 'Tuition Fee',
                    month: fee.month,
                    year: fee.year,
                    amount: fee.amount,
                    paidNow: paymentForThisFee,
                    remainingAfter: fee.amount - newPaidAmount
                });

                updates.push({
                    ref: doc.ref,
                    data: {
                        paidAmount: newPaidAmount,
                        status: newStatus,
                        lastPaidDate: firebase.firestore.FieldValue.serverTimestamp(),
                        lastMethod: method
                    }
                });
                
                remainingAmount -= paymentForThisFee;
            }

            // 3. Create Receipt
            const paymentRef = schoolData('feePayments').doc();
            transaction.set(paymentRef, withSchool({
                studentId,
                amount,
                paymentMode: method,
                receiptNo,
                transactionId: reference || '',
                remarks: remarks || '',
                session: session || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                appliedAmount: amount - remainingAmount,
                excessAmount: remainingAmount,
                allocations: allocations // Store what was paid for itemized printing
            }));

            // 4. Commit all fee updates
            updates.forEach(upd => transaction.update(upd.ref, upd.data));

            return { paymentId: paymentRef.id, receiptNo };
        });
    },

    /**
     * Fetches detailed ledger for a student
     */
    async getStudentLedger(studentId) {
        const feesSnap = await schoolData('fees').where('studentId', '==', studentId).get();
        const paymentsSnap = await schoolData('feePayments').where('studentId', '==', studentId).orderBy('createdAt', 'desc').get();
        
        // Sort and process fees
        const ledger = feesSnap.docs.map(d => {
            const data = d.data();
            return { 
                id: d.id, 
                ...data,
                // Default missing fields for legacy records
                feeType: data.feeType || 'Tuition Fee',
                frequency: data.frequency || 'Monthly',
                dueDate: data.dueDate || '--',
                discount: data.discount || 0,
                dueAmount: (data.amount || 0) - (data.paidAmount || 0)
            };
        }).sort((a, b) => {
            // Sort by Date (Reverse Chronological for table)
            const dateA = new Date(`${a.month} ${a.year}`);
            const dateB = new Date(`${b.month} ${b.year}`);
            return dateB - dateA;
        });

        const history = paymentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        const totalAmount = ledger.reduce((sum, f) => sum + (f.amount || 0), 0);
        const totalPaid = ledger.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
        const totalDiscount = ledger.reduce((sum, f) => sum + (f.discount || 0), 0);
        
        return {
            ledger,
            history,
            summary: {
                total: totalAmount,
                paid: totalPaid,
                discount: totalDiscount,
                balance: totalAmount - totalPaid - totalDiscount
            }
        };
    }
};

window.PaymentService = PaymentService;
