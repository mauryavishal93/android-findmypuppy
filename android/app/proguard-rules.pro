# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# Keep Google Play Services Auth (used by web view)
-keep class com.google.android.gms.auth.api.signin.** { *; }
-keep public class * extends com.getcapacitor.Plugin

# Razorpay ProGuard Rules
-keep class com.razorpay.** {*;}
-dontwarn com.razorpay.**
-keepattributes Signature
-keepattributes *Annotation*
-keep class org.json.** {*;}
-keep class com.findmypuppy.app.RazorpayPlugin { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * {
    @com.getcapacitor.PluginMethod public <methods>;
}

# Keep Razorpay SDK
-keepclassmembers class com.razorpay.Checkout {
    public *;
}
-keep class com.razorpay.** {*;}
-dontwarn com.razorpay.**
