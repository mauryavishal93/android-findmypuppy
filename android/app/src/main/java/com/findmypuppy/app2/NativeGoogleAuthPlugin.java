package com.findmypuppy.app2;

import android.app.Activity;
import android.content.Intent;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;

@CapacitorPlugin(name = "NativeGoogleAuth", requestCodes = {NativeGoogleAuthPlugin.RC_SIGN_IN})
public class NativeGoogleAuthPlugin extends Plugin {

    static final int RC_SIGN_IN = 9001;

    @PluginMethod
    public void signIn(PluginCall call) {
        android.util.Log.d("NativeGoogleAuth", "signIn called");
        if (getActivity() == null) {
            android.util.Log.e("NativeGoogleAuth", "Activity not available");
            call.reject("Activity not available");
            return;
        }
        String serverClientId = call.getString("serverClientId");
        if (serverClientId == null || serverClientId.isEmpty()) {
            try {
                serverClientId = getContext().getString(R.string.server_client_id);
                android.util.Log.d("NativeGoogleAuth", "Using server_client_id from strings.xml: " + serverClientId.substring(0, 20) + "...");
            } catch (Exception e) {
                android.util.Log.e("NativeGoogleAuth", "Failed to get server_client_id from strings.xml", e);
                serverClientId = null;
            }
        } else {
            android.util.Log.d("NativeGoogleAuth", "Using serverClientId from call: " + serverClientId.substring(0, 20) + "...");
        }
        if (serverClientId == null || serverClientId.isEmpty()) {
            android.util.Log.e("NativeGoogleAuth", "Server client ID not configured");
            call.reject("Server client ID not configured. Set server_client_id in strings.xml or pass serverClientId.");
            return;
        }

        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken(serverClientId)
                .requestEmail()
                .build();

        GoogleSignInClient client = GoogleSignIn.getClient(getActivity(), gso);
        Intent signInIntent = client.getSignInIntent();
        android.util.Log.d("NativeGoogleAuth", "Starting Google Sign-In activity");
        getBridge().startActivityForPluginWithResult(call, signInIntent, RC_SIGN_IN);
    }

    @Override
    protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
        android.util.Log.d("NativeGoogleAuth", "handleOnActivityResult: requestCode=" + requestCode + ", resultCode=" + resultCode);
        PluginCall call = getSavedCall();
        if (call == null) {
            android.util.Log.e("NativeGoogleAuth", "No saved call found");
            return;
        }
        if (requestCode != RC_SIGN_IN) {
            android.util.Log.w("NativeGoogleAuth", "Request code mismatch: expected " + RC_SIGN_IN + ", got " + requestCode);
            return;
        }

        if (resultCode == Activity.RESULT_CANCELED) {
            android.util.Log.w("NativeGoogleAuth", "Sign-in cancelled by user (RESULT_CANCELED)");
            // Check if this is likely due to SHA-1 not being registered (common cause)
            String errorMsg = "Sign-in was cancelled.";
            call.reject(errorMsg);
            if (getSavedCall() != null) freeSavedCall();
            return;
        }

        if (data == null) {
            android.util.Log.e("NativeGoogleAuth", "Sign-in returned null data");
            call.reject("Sign-in was cancelled or failed.");
            if (getSavedCall() != null) freeSavedCall();
            return;
        }

        android.util.Log.d("NativeGoogleAuth", "Processing Google Sign-In result");
        Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
        task.addOnSuccessListener(account -> {
            android.util.Log.d("NativeGoogleAuth", "Google Sign-In success, getting ID token");
            PluginCall savedCall = getSavedCall();
            if (savedCall == null) {
                android.util.Log.e("NativeGoogleAuth", "No saved call in success listener");
                return;
            }
            
            String idToken = account.getIdToken();
            if (idToken == null || idToken.isEmpty()) {
                android.util.Log.e("NativeGoogleAuth", "No ID token received - SHA-1 may not be registered");
                savedCall.reject("No ID token. Add your app SHA-1 to the Android OAuth client in Google Cloud Console. Run: cd android && ./gradlew signingReport");
                if (getSavedCall() != null) freeSavedCall();
                return;
            }
            android.util.Log.d("NativeGoogleAuth", "ID token received, resolving call");
            JSObject ret = new JSObject();
            ret.put("idToken", idToken);
            ret.put("email", account.getEmail());
            ret.put("displayName", account.getDisplayName());
            savedCall.resolve(ret);
            if (getSavedCall() != null) freeSavedCall();
        }).addOnFailureListener(e -> {
            android.util.Log.e("NativeGoogleAuth", "Google Sign-In failure", e);
            PluginCall savedCall = getSavedCall();
            if (savedCall == null) {
                android.util.Log.e("NativeGoogleAuth", "No saved call in failure listener");
                return;
            }
            
            if (e instanceof ApiException) {
                ApiException apiException = (ApiException) e;
                int code = apiException.getStatusCode();
                String msg = apiException.getMessage();
                android.util.Log.e("NativeGoogleAuth", "ApiException code: " + code + ", message: " + msg);
                if (code == 10) {
                    msg = "Add your app SHA-1 to the Android OAuth client (com.findmypuppy.app2) in Google Cloud Console. Run: cd android && ./gradlew signingReport";
                } else if (code == 7) {
                    msg = "Network error. Check your internet connection.";
                } else if (code == 12501) {
                    msg = "Sign-in was cancelled by user.";
                } else if (code == 8) {
                    msg = "Internal error. Please try again.";
                }
                savedCall.reject("Google Sign-In failed: " + msg + " (Code: " + code + ")", "STATUS_" + code, apiException);
            } else {
                android.util.Log.e("NativeGoogleAuth", "Non-ApiException: " + e.getClass().getName() + ": " + e.getMessage());
                savedCall.reject("Google Sign-In failed: " + e.getMessage(), e);
            }
            if (getSavedCall() != null) freeSavedCall();
        });
    }
}
