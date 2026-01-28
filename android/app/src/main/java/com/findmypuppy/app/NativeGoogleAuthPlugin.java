package com.findmypuppy.app;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;

/**
 * Native Google Sign-In for Capacitor (Android)
 *
 * Why: Google Identity Services web button can be unreliable inside Android WebViews.
 * This plugin uses Google Play Services to sign in and returns an ID token that
 * the existing backend endpoint (/api/auth/google/signin) can verify.
 *
 * NOTE: To request an ID token on Android, you must use the WEB client id as serverClientId.
 */
@CapacitorPlugin(name = "NativeGoogleAuth")
public class NativeGoogleAuthPlugin extends Plugin {
    private static final String TAG = "NativeGoogleAuth";

    @PluginMethod
    public void signIn(PluginCall call) {
        try {
            final Activity activity = getActivity();
            if (activity == null) {
                call.reject("Activity not available");
                return;
            }

            // We need WEB client id here (server client id) to receive an idToken.
            String serverClientId = call.getString("serverClientId");
            if (serverClientId == null || serverClientId.trim().isEmpty()) {
                try {
                    int resId = getContext()
                            .getResources()
                            .getIdentifier("server_client_id", "string", getContext().getPackageName());
                    if (resId != 0) {
                        serverClientId = getContext().getString(resId);
                    }
                } catch (Exception ignored) {
                    // fall through to validation
                }
            }

            if (serverClientId == null || serverClientId.trim().isEmpty()) {
                call.reject("Missing serverClientId (Web Client ID). Provide it or define string resource server_client_id.");
                return;
            }

            GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                    .requestEmail()
                    .requestIdToken(serverClientId.trim())
                    .build();

            GoogleSignInClient googleSignInClient = GoogleSignIn.getClient(activity, gso);
            // By default, Google Sign-In may reuse the last account and skip the chooser.
            // Force account picker when requested (Android UX expectation for multi-account devices).
            boolean forceAccountPicker = call.getBoolean("forceAccountPicker", true);
            if (forceAccountPicker) {
                try {
                    Tasks.await(googleSignInClient.signOut());
                } catch (Exception e) {
                    Log.w(TAG, "signOut() before sign-in failed (continuing anyway): " + e.getMessage());
                }
            }

            Intent signInIntent = googleSignInClient.getSignInIntent();
            Log.d(TAG, "Starting native Google sign-in (forceAccountPicker=" + forceAccountPicker + ")");
            startActivityForResult(call, signInIntent, "handleSignInResult");
        } catch (Exception e) {
            Log.e(TAG, "Native Google sign-in start failed", e);
            call.reject("Native Google sign-in start failed: " + e.getMessage());
        }
    }

    @ActivityCallback
    private void handleSignInResult(PluginCall call, ActivityResult result) {
        if (call == null) return;

        if (result == null) {
            call.reject("No activity result received");
            return;
        }

        if (result.getResultCode() == Activity.RESULT_CANCELED) {
            call.reject("Google sign-in cancelled");
            return;
        }

        Intent data = result.getData();
        Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);

        try {
            GoogleSignInAccount account = task.getResult(ApiException.class);
            if (account == null) {
                call.reject("Google sign-in returned no account");
                return;
            }

            String idToken = account.getIdToken();
            if (idToken == null || idToken.isEmpty()) {
                call.reject("Google sign-in did not return an ID token. Ensure serverClientId (Web Client ID) is correct and SHA1 is configured in Google Cloud.");
                return;
            }

            JSObject res = new JSObject();
            res.put("idToken", idToken);
            res.put("email", account.getEmail());
            res.put("name", account.getDisplayName());
            res.put("googleId", account.getId());
            call.resolve(res);
        } catch (ApiException e) {
            Log.e(TAG, "Google sign-in failed", e);
            call.reject("Google sign-in failed: " + e.getStatusCode(), String.valueOf(e.getStatusCode()));
        } catch (Exception e) {
            Log.e(TAG, "Google sign-in result handling failed", e);
            call.reject("Google sign-in result handling failed: " + e.getMessage());
        }
    }
}

