package com.findmypuppy.app;

import android.app.Activity;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.razorpay.Checkout;
import com.razorpay.PaymentData;

import org.json.JSONObject;

/**
 * Razorpay Capacitor Plugin
 * Integrates Razorpay Native Android SDK
 */
@CapacitorPlugin(name = "RazorpayCheckout")
public class RazorpayPlugin extends Plugin {

    private static final String TAG = "RazorpayPlugin";
    private PluginCall savedCall;

    @PluginMethod
    public void openCheckout(PluginCall call) {
        savedCall = call;

        try {
            String key = call.getString("key");
            String orderId = call.getString("orderId");
            
            // Be more robust with amount parsing
            Object amountObj = call.getData().get("amount");
            int amount;
            if (amountObj instanceof Number) {
                amount = ((Number) amountObj).intValue();
            } else if (amountObj instanceof String) {
                amount = (int) Double.parseDouble((String) amountObj);
            } else {
                call.reject("Invalid amount format");
                return;
            }

            String currency = call.getString("currency", "INR");
            String name = call.getString("name", "Find My Puppy");
            String description = call.getString("description", "Purchase Hints");
            String email = call.getString("email", "");
            String contact = call.getString("contact", "");

            Log.d(TAG, "Opening checkout for order: " + orderId + ", amount: " + amount);

            if (key == null || orderId == null) {
                call.reject("Key and Order ID are required");
                return;
            }

            final Activity activity = getActivity();
            if (activity == null) {
                call.reject("Activity not found");
                return;
            }

            Checkout checkout = new Checkout();
            checkout.setKeyID(key);

            JSONObject options = new JSONObject();
            options.put("name", name);
            options.put("description", description);
            options.put("order_id", orderId);
            options.put("currency", currency);
            options.put("amount", amount);

            JSONObject prefill = new JSONObject();
            prefill.put("email", email);
            prefill.put("contact", contact);
            options.put("prefill", prefill);

            // Open Razorpay Checkout on main thread
            activity.runOnUiThread(() -> {
                try {
                    checkout.open(activity, options);
                } catch (Exception e) {
                    Log.e(TAG, "Error opening Razorpay UI", e);
                    call.reject("Error opening Razorpay UI: " + e.getMessage());
                }
            });

        } catch (Exception e) {
            Log.e(TAG, "Error preparing Razorpay", e);
            call.reject("Error preparing Razorpay: " + e.getMessage());
        }
    }

    public void onPaymentSuccess(String paymentId, PaymentData data) {
        if (savedCall != null) {
            JSObject res = new JSObject();
            res.put("paymentId", paymentId);
            res.put("orderId", data.getOrderId());
            res.put("signature", data.getSignature());
            savedCall.resolve(res);
            savedCall = null;
        }
    }

    public void onPaymentError(int code, String description, PaymentData data) {
        if (savedCall != null) {
            JSObject error = new JSObject();
            error.put("code", code);
            error.put("description", description);
            savedCall.reject(description, String.valueOf(code), error);
            savedCall = null;
        }
    }
}

