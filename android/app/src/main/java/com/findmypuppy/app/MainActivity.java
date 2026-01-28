package com.findmypuppy.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.webkit.WebView;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.PluginHandle;
import com.razorpay.PaymentData;
import com.razorpay.PaymentResultWithDataListener;

public class MainActivity extends BridgeActivity implements PaymentResultWithDataListener {
    private String googleClientId;
    private Handler handler = new Handler(Looper.getMainLooper());
    private static final int REQ_POST_NOTIFICATIONS = 11005;
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Register local plugins before super.onCreate for better reliability in some Capacitor versions
        registerPlugin(RazorpayPlugin.class);
        registerPlugin(NativeGoogleAuthPlugin.class);
        
        // Get Google Client ID from resources
        // IMPORTANT: For the Web SDK (Google Identity Services) to work in a WebView,
        // we MUST use the Web Client ID (server_client_id), NOT the Android Client ID.
        try {
            int resId = getResources().getIdentifier("server_client_id", "string", getPackageName());
            if (resId != 0) {
                googleClientId = getResources().getString(resId);
                android.util.Log.d("MainActivity", "Google Web Client ID loaded for injection: " + googleClientId);
            } else {
                android.util.Log.e("MainActivity", "Google server_client_id resource not found");
            }
        } catch (Exception e) {
            android.util.Log.e("MainActivity", "Failed to load Google Client ID", e);
        }
        
        super.onCreate(savedInstanceState);

        // Ask for notification permission on Android 13+ (required to show notifications).
        requestNotificationPermissionIfNeeded();

        // Schedule hourly notifications in the background (WorkManager).
        HourlyNotificationScheduler.schedule(this);
        
        // Inject Google Client ID after web view is ready
        // Use multiple delays to ensure it's injected at the right time
        injectGoogleClientIdDelayed(200);
        injectGoogleClientIdDelayed(500);
        injectGoogleClientIdDelayed(1000);
        injectGoogleClientIdDelayed(2000);
        injectGoogleClientIdDelayed(3000);
    }
    
    @Override
    public void onStart() {
        super.onStart();
        // Re-inject on start to ensure it's available
        injectGoogleClientIdDelayed(1000);
    }
    
    @Override
    public void onResume() {
        super.onResume();
        // Re-inject on resume to ensure it's available after app comes back
        injectGoogleClientIdDelayed(200);
        injectGoogleClientIdDelayed(500);
        injectGoogleClientIdDelayed(1000);
    }
    
    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            // Inject when window gains focus
            injectGoogleClientIdDelayed(100);
        }
    }
    
    private void injectGoogleClientIdDelayed(long delayMs) {
        if (googleClientId == null || googleClientId.isEmpty()) {
            android.util.Log.w("MainActivity", "Google Client ID is null or empty, cannot inject");
            return;
        }
        
        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                injectGoogleClientId();
            }
        }, delayMs);
    }
    
    private void injectGoogleClientId() {
        if (googleClientId == null || googleClientId.isEmpty()) {
            return;
        }
        
        // Wait for web view to be ready
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();
            webView.post(new Runnable() {
                @Override
                public void run() {
                    try {
                        // Inject into window object multiple times to ensure it's available
                        // Also trigger a custom event so React can listen for it
                        // Get client ID dynamically from the variable loaded in onCreate
                        String escapedClientId = googleClientId != null ? googleClientId.replace("'", "\\'").replace("\n", "\\n").replace("\r", "\\r") : "";
                        
                        if (escapedClientId.isEmpty()) {
                            android.util.Log.e("MainActivity", "Google Client ID is empty, skipping injection");
                            return;
                        }
                        
                        String js = "(function() {" +
                            "try {" +
                            "  var clientId = '" + escapedClientId + "';" +
                            "  window.VITE_GOOGLE_CLIENT_ID = clientId;" +
                            "  window.googleClientId = clientId;" +
                            "  " +
                            "  // Make it available globally" +
                            "  if (typeof globalThis !== 'undefined') {" +
                            "    globalThis.VITE_GOOGLE_CLIENT_ID = clientId;" +
                            "    globalThis.googleClientId = clientId;" +
                            "  }" +
                            "  " +
                            "  // Set up a getter for import.meta.env if it exists" +
                            "  if (typeof import !== 'undefined' && import.meta) {" +
                            "    try {" +
                            "      import.meta.env = import.meta.env || {};" +
                            "      Object.defineProperty(import.meta.env, 'VITE_GOOGLE_CLIENT_ID', {" +
                            "        get: function() { return window.VITE_GOOGLE_CLIENT_ID || clientId; }," +
                            "        configurable: true," +
                            "        enumerable: true" +
                            "      });" +
                            "    } catch(e) {" +
                            "      try {" +
                            "        import.meta.env.VITE_GOOGLE_CLIENT_ID = clientId;" +
                            "      } catch(e2) {" +
                            "        console.warn('Could not set import.meta.env.VITE_GOOGLE_CLIENT_ID:', e2);" +
                            "      }" +
                            "    }" +
                            "  }" +
                            "  " +
                            "  // Dispatch custom event for React components" +
                            "  if (typeof window !== 'undefined') {" +
                            "    var event = new CustomEvent('googleClientIdReady', { " +
                            "      detail: { clientId: clientId }" +
                            "    });" +
                            "    window.dispatchEvent(event);" +
                            "    // Also dispatch on document" +
                            "    if (typeof document !== 'undefined') {" +
                            "      document.dispatchEvent(event);" +
                            "    }" +
                            "  }" +
                            "  " +
                            "  console.log('[Android] Google Client ID injected successfully');" +
                            "} catch(e) {" +
                            "  console.error('[Android] Error injecting Google Client ID:', e);" +
                            "}" +
                            "})();";
                        webView.evaluateJavascript(js, null);
                        android.util.Log.d("MainActivity", "Google Client ID injected into web view: " + googleClientId);
                    } catch (Exception e) {
                        android.util.Log.e("MainActivity", "Failed to inject Google Client ID", e);
                    }
                }
            });
        } else {
            android.util.Log.w("MainActivity", "WebView not ready, will retry");
            // Retry after a delay
            injectGoogleClientIdDelayed(500);
        }
    }

    private void requestNotificationPermissionIfNeeded() {
        if (Build.VERSION.SDK_INT < 33) return;
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED) {
            return;
        }
        ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.POST_NOTIFICATIONS}, REQ_POST_NOTIFICATIONS);
    }

    @Override
    public void onPaymentSuccess(String razorpayPaymentId, PaymentData paymentData) {
        android.util.Log.d("MainActivity", "Razorpay Success: " + razorpayPaymentId);
        PluginHandle handle = getBridge().getPlugin("RazorpayCheckout");
        if (handle != null) {
            RazorpayPlugin plugin = (RazorpayPlugin) handle.getInstance();
            if (plugin != null) {
                plugin.onPaymentSuccess(razorpayPaymentId, paymentData);
            }
        }
    }

    @Override
    public void onPaymentError(int code, String description, PaymentData paymentData) {
        android.util.Log.e("MainActivity", "Razorpay Error: " + code + " - " + description);
        PluginHandle handle = getBridge().getPlugin("RazorpayCheckout");
        if (handle != null) {
            RazorpayPlugin plugin = (RazorpayPlugin) handle.getInstance();
            if (plugin != null) {
                plugin.onPaymentError(code, description, paymentData);
            }
        }
    }
}
