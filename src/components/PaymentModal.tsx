import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Loader2, AlertCircle, Landmark } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: {
    name: string;
    price_monthly: number;
    price_annual: number;
  };
  billingCycle: 'monthly' | 'annual';
  tenantCurrency: string; // e.g. 'USD', 'XAF'
  onPaymentSuccess: (invoiceId: string) => void;
}

interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  reference: string;
}

export default function PaymentModal({
  isOpen,
  onClose,
  selectedPlan,
  billingCycle,
  tenantCurrency,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [step, setStep] = useState<'select_method' | 'enter_credentials' | 'processing' | 'success' | 'failed'>('select_method');
  const [selectedMethod, setSelectedMethod] = useState<'paypal' | 'campay_mtn' | 'campay_orange' | 'bank_transfer' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);

  // User input credentials state
  const [mtnPhone, setMtnPhone] = useState('');
  const [mtnName, setMtnName] = useState('');
  const [orangePhone, setOrangePhone] = useState('');
  const [orangeName, setOrangeName] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  
  const pollIntervalRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const currentPrice = billingCycle === 'annual' ? selectedPlan.price_annual : selectedPlan.price_monthly;
  const displayPriceStr = `${tenantCurrency} ${currentPrice}/${billingCycle === 'annual' ? 'yr' : 'mo'}`;

  const getToken = () => {
    return localStorage.getItem('neslead_session_token') || localStorage.getItem('token') || '';
  };

  const pollForPaymentCompletion = (reference: string, popup: Window | null) => {
    const MAX_POLL_MS = 5 * 60 * 1000;
    const pollStart = Date.now();

    const interval = setInterval(async () => {
      if (Date.now() - pollStart > MAX_POLL_MS) {
        clearInterval(interval);
        if (popup) popup.close();
        setErrorMessage('Payment timed out after 5 minutes. If you completed payment, contact support.');
        setStep('failed');
        return;
      }

      try {
        const res = await fetch(`/api/payment/status/${reference}`, {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await res.json();
        if (data.status === 'PAID') {
          clearInterval(interval);
          if (popup) popup.close();
          setStep('success');
          onPaymentSuccess(data.invoiceId);
        } else if (data.status === 'FAILED') {
          clearInterval(interval);
          if (popup) popup.close();
          setErrorMessage('Payment was declined or cancelled.');
          setStep('failed');
        }
        // If status is PENDING, keep polling
      } catch (err) {
        // Network blip — keep polling, don't fail yet
      }
    }, 4000);

    pollIntervalRef.current = interval;
  };

  const initiatePaypal = async () => {
    setSelectedMethod('paypal');
    setStep('processing');
    setErrorMessage(null);
    try {
      const res = await fetch('/api/payment/paypal/create-subscription', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}` 
        },
        body: JSON.stringify({
          plan: selectedPlan.name,
          billing_cycle: billingCycle
        })
      });
      const data = await res.json();
      if (data.approvalUrl) {
        // Open PayPal in a popup window, not a redirect
        const popup = window.open(data.approvalUrl, 'paypal_checkout', 'width=500,height=700,scrollbars=yes');
        pollForPaymentCompletion(data.subscriptionId, popup);
      } else {
        setErrorMessage(data.error || 'PayPal setup failed.');
        setStep('failed');
      }
    } catch (err) {
      setErrorMessage('Network error. Please try again.');
      setStep('failed');
    }
  };

  const initiateCampay = async (operator: 'mtn' | 'orange', overridePhone?: string) => {
    setSelectedMethod(operator === 'mtn' ? 'campay_mtn' : 'campay_orange');
    setStep('processing');
    setErrorMessage(null);
    try {
      const res = await fetch('/api/payment/campay/initiate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}` 
        },
        body: JSON.stringify({
          plan: selectedPlan.name,
          billing_cycle: billingCycle,
          operator,
          phone: overridePhone
        })
      });
      const data = await res.json();
      if (data.reference) {
        pollForPaymentCompletion(data.reference, null);
      } else {
        setErrorMessage(data.error || 'Mobile money initiation failed.');
        setStep('failed');
      }
    } catch (err) {
      setErrorMessage('Network error. Please try again.');
      setStep('failed');
    }
  };

  const showBankTransferDetails = () => {
    setSelectedMethod('bank_transfer');
    setErrorMessage(null);
    // This does not initiate a real payment.
    // It creates a PENDING invoice and shows bank account details.
    // The super admin will manually mark it as PAID later.
    fetch('/api/payment/bank-transfer/initiate', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}` 
      },
      body: JSON.stringify({ plan: selectedPlan.name, billing_cycle: billingCycle })
    })
      .then(r => r.json())
      .then(data => {
        if (data.invoiceId) {
          // Show bank details inline — do not redirect
          // Store invoiceId in state for display
          setBankDetails({
            bankName: data.bankName || 'Standard Chartered Bank',
            accountNumber: data.accountNumber || '0100928374920',
            accountName: data.accountName || 'NesLead Ltd',
            amount: data.amount || currentPrice,
            reference: data.invoiceId,
          });
          setStep('processing'); // repurpose step to show bank details
        } else {
          setErrorMessage(data.error || 'Bank transfer initiation failed.');
          setStep('failed');
        }
      })
      .catch(() => {
        setErrorMessage('Network error. Please try again.');
        setStep('failed');
      });
  };

  const handleClose = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-md p-6 rounded-3xl border shadow-2xl relative"
        style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
      >
        {/* Close Button - Only show if not processing (unless it's bank transfer display) */}
        {(step !== 'processing' || selectedMethod === 'bank_transfer') && (
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        )}

        {step === 'select_method' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-xl font-black tracking-tight text-white">Complete Your Upgrade</h3>
              <p className="text-sm text-neutral-400 font-medium">
                Upgrading to <span className="text-indigo-400 font-bold">{selectedPlan.name}</span> for <span className="text-indigo-400 font-extrabold">{displayPriceStr}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {/* PayPal */}
              <button
                id="pay_paypal_btn"
                onClick={() => {
                  setSelectedMethod('paypal');
                  setStep('enter_credentials');
                }}
                className="flex items-center justify-between p-4 rounded-2xl border bg-neutral-900 border-neutral-800 hover:bg-neutral-800 transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-650 flex items-center justify-center text-white font-black text-xl bg-blue-600">
                    P
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">PayPal</div>
                    <div className="text-xs text-neutral-500 font-semibold">Credit/Debit Card or PayPal Account</div>
                  </div>
                </div>
              </button>

              {/* MTN Mobile Money */}
              <button
                id="pay_mtn_btn"
                onClick={() => {
                  setSelectedMethod('campay_mtn');
                  setStep('enter_credentials');
                }}
                className="flex items-center justify-between p-4 rounded-2xl border bg-yellow-950/20 border-yellow-500/20 hover:bg-yellow-950/40 transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-black font-black text-xs">
                    MTN
                  </div>
                  <div>
                    <div className="text-sm font-black text-amber-500">MTN Mobile Money</div>
                    <div className="text-xs text-neutral-400 font-semibold">Instant Mobile Money Payment</div>
                  </div>
                </div>
              </button>

              {/* Orange Money */}
              <button
                id="pay_orange_btn"
                onClick={() => {
                  setSelectedMethod('campay_orange');
                  setStep('enter_credentials');
                }}
                className="flex items-center justify-between p-4 rounded-2xl border bg-orange-950/20 border-orange-500/20 hover:bg-orange-950/40 transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black text-xs">
                    Orange
                  </div>
                  <div>
                    <div className="text-sm font-black text-orange-500">Orange Money</div>
                    <div className="text-xs text-neutral-400 font-semibold">Instant Mobile Money Payment</div>
                  </div>
                </div>
              </button>

              {/* Bank Transfer */}
              <button
                id="pay_bank_btn"
                onClick={showBankTransferDetails}
                className="flex items-center justify-between p-4 rounded-2xl border bg-neutral-900 border-neutral-800 hover:bg-neutral-800 transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center">
                    <Landmark className="w-5 h-5 text-neutral-300" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-neutral-300">Bank Transfer</div>
                    <div className="text-xs text-neutral-500 font-semibold">Manual — 1-3 business days</div>
                  </div>
                </div>
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={handleClose}
                className="text-xs font-bold text-neutral-500 hover:text-neutral-300 transition duration-150 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {step === 'enter_credentials' && (
          <div className="space-y-6 animate-fade-in" id="credentials-form-container">
            <div className="space-y-1">
              <h3 className="text-xl font-black tracking-tight text-white">
                {selectedMethod === 'campay_mtn' && 'MTN MoMo Credentials'}
                {selectedMethod === 'campay_orange' && 'Orange Money Credentials'}
                {selectedMethod === 'paypal' && 'Payment Credentials'}
              </h3>
              <p className="text-xs text-neutral-450 text-neutral-400 font-medium">
                Please enter your credentials to proceed with the subscription payment.
              </p>
            </div>

            <div className="space-y-4">
              {selectedMethod === 'campay_mtn' && (
                <div className="space-y-3" id="form-mtn-momo">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1">MTN Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 677123456"
                      value={mtnPhone}
                      onChange={(e) => setMtnPhone(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={mtnName}
                      onChange={(e) => setMtnName(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none text-white"
                    />
                  </div>
                </div>
              )}

              {selectedMethod === 'campay_orange' && (
                <div className="space-y-3" id="form-orange-money">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1">Orange Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 699123456"
                      value={orangePhone}
                      onChange={(e) => setOrangePhone(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={orangeName}
                      onChange={(e) => setOrangeName(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none text-white"
                    />
                  </div>
                </div>
              )}

              {selectedMethod === 'paypal' && (
                <div className="space-y-4" id="form-paypal-multi">
                  <div className="flex gap-2 p-1 bg-neutral-950 rounded-xl mb-1" id="paypal-card-tab-switcher">
                    <button
                      type="button"
                      onClick={() => setPaypalEmail(paypalEmail || 'default@example.com')}
                      className={`flex-1 py-1.5 text-center text-[10px] uppercase tracking-wider font-extrabold rounded-lg transition-all ${paypalEmail !== '' ? 'bg-neutral-800 text-white' : 'text-neutral-500'}`}
                    >
                      PayPal
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaypalEmail('')}
                      className={`flex-1 py-1.5 text-center text-[10px] uppercase tracking-wider font-extrabold rounded-lg transition-all ${paypalEmail === '' ? 'bg-neutral-800 text-white' : 'text-neutral-500'}`}
                    >
                      Credit Card
                    </button>
                  </div>

                  {paypalEmail !== '' ? (
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1">PayPal Account Email</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. name@domain.com"
                        value={paypalEmail === 'default@example.com' ? '' : paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none text-white"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1">Card Holder Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. John Doe"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1">Card Number</label>
                        <input
                          type="text"
                          required
                          placeholder="•••• •••• •••• ••••"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none text-white font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1">Expiry Date</label>
                          <input
                            type="text"
                            required
                            placeholder="MM / YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1">CVV / CVC</label>
                          <input
                            type="password"
                            required
                            placeholder="•••"
                            maxLength={4}
                            value={cardCVV}
                            onChange={(e) => setCardCVV(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Campay Sandbox Notice */}
            {['campay_mtn', 'campay_orange'].includes(selectedMethod || '') && (
              <p className="text-[11px] text-amber-500/90 font-bold bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 leading-normal" id="sandbox-alert-notice">
                ⚠️ Sandbox mode: Only test amounts up to 25 XAF are accepted. Use production mode for real payments.
              </p>
            )}

            <div className="space-y-3 pt-2">
              <button
                type="button"
                id="proceed-payment-btn"
                onClick={() => {
                  if (selectedMethod === 'campay_mtn') {
                    initiateCampay('mtn', mtnPhone);
                  } else if (selectedMethod === 'campay_orange') {
                    initiateCampay('orange', orangePhone);
                  } else if (selectedMethod === 'paypal') {
                    initiatePaypal();
                  }
                }}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl uppercase tracking-wider transition cursor-pointer shadow-lg shadow-indigo-500/15"
              >
                Proceed to Payment
              </button>
              <button
                type="button"
                id="back-to-methods-btn"
                onClick={() => {
                  setStep('select_method');
                  setSelectedMethod(null);
                }}
                className="w-full py-3 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 text-xs font-bold rounded-xl border border-neutral-800 transition cursor-pointer"
              >
                Go Back
              </button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="space-y-6 py-6 text-center">
            {selectedMethod === 'bank_transfer' && bankDetails ? (
              // Repurposed processing view for Bank Transfer details
              <div className="space-y-5 text-left">
                <div className="text-center pb-2">
                  <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center mx-auto mb-2">
                    <Landmark className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-black text-white">Bank Transfer Details</h3>
                  <p className="text-xs text-neutral-400">Please make details exact to finalize upgrade.</p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-900 space-y-3 text-sm font-medium border border-neutral-800">
                  <div className="flex justify-between border-b border-neutral-800 pb-2">
                    <span className="text-neutral-500">Bank Name</span>
                    <span className="text-white font-bold">{bankDetails.bankName}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800 pb-2">
                    <span className="text-neutral-500">Account Number</span>
                    <span className="text-indigo-400 font-mono font-bold">{bankDetails.accountNumber}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800 pb-2">
                    <span className="text-neutral-500">Account Name</span>
                    <span className="text-white font-bold">{bankDetails.accountName}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800 pb-2">
                    <span className="text-neutral-500">Amount to Send</span>
                    <span className="text-emerald-400 font-bold">{tenantCurrency} {bankDetails.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Payment Ref</span>
                    <span className="text-amber-400 font-mono font-bold">{bankDetails.reference}</span>
                  </div>
                </div>

                <p className="text-xs text-amber-500 font-semibold bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                  ⚠️ Note: Use the Payment Ref above as transaction reference/memo. Once transferred, the super admin will verify your payment and activate your plan.
                </p>

                <div className="text-center pt-2">
                  <button
                    onClick={handleClose}
                    className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-black rounded-xl transition cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              // General spinner processing
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-white">Processing your payment...</h4>
                  <p className="text-xs text-neutral-400">Please do not close this window.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-6 py-6 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">Payment Confirmed!</h3>
              <p className="text-sm text-neutral-400 font-medium">Your plan is being upgraded. Thank you for your payment.</p>
            </div>
            <button
              onClick={handleClose}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black text-sm font-black rounded-xl transition duration-150 cursor-pointer"
            >
              Done
            </button>
          </div>
        )}

        {step === 'failed' && (
          <div className="space-y-6 py-6 text-center">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">Payment Failed</h3>
              <p className="text-sm text-neutral-400 font-medium px-4">
                {errorMessage || "Payment could not be completed."}
              </p>
            </div>
            <div className="space-y-3 pt-2">
              <button
                onClick={() => setStep('select_method')}
                className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-black rounded-xl transition duration-150 cursor-pointer"
              >
                Try Again
              </button>
              <button
                onClick={handleClose}
                className="text-xs font-bold text-neutral-500 hover:text-neutral-300 transition duration-150 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
