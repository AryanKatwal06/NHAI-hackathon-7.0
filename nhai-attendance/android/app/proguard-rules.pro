# ─── REACT NATIVE ─────────────────────────────────────────────────────────────
# Keep React Native core — R8 must not touch these
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-keepclassmembers class *  { @com.facebook.react.uimanager.annotations.ReactProp <methods>; }
-keepclassmembers class *  { @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>; }
-dontwarn com.facebook.react.**

# ─── HERMES ENGINE ────────────────────────────────────────────────────────────
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# ─── TENSORFLOW LITE ─────────────────────────────────────────────────────────
# TFLite classes must not be renamed or removed — they are loaded by name
-keep class org.tensorflow.lite.** { *; }
-keep class org.tensorflow.lite.gpu.** { *; }
-dontwarn org.tensorflow.lite.**

# ─── SQLITE / QUICK-SQLITE ────────────────────────────────────────────────────
-keep class io.ospfranco.** { *; }
-dontwarn io.ospfranco.**

# ─── MEDIAPIPE / MLKIT ────────────────────────────────────────────────────────
-keep class com.google.mlkit.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.mlkit.**
-dontwarn com.google.android.gms.**

# ─── REACT NATIVE VISION CAMERA ───────────────────────────────────────────────
-keep class com.mrousavy.camera.** { *; }
-dontwarn com.mrousavy.camera.**

# ─── REACT NATIVE KEYCHAIN ────────────────────────────────────────────────────
-keep class com.oblador.keychain.** { *; }
-dontwarn com.oblador.keychain.**

# ─── REACT NATIVE DEVICE INFO ─────────────────────────────────────────────────
-keep class com.learnium.RNDeviceInfo.** { *; }

# ─── REACT NATIVE GEOLOCATION ─────────────────────────────────────────────────
-keep class com.agontuk.** { *; }

# ─── REACT NATIVE PERMISSIONS ─────────────────────────────────────────────────
-keep class com.zoontek.rnpermissions.** { *; }

# ─── REACT NATIVE LINEAR GRADIENT ────────────────────────────────────────────
-keep class com.BV.LinearGradient.** { *; }

# ─── REACT NATIVE SVG ─────────────────────────────────────────────────────────
-keep class com.horcrux.svg.** { *; }

# ─── REACT NATIVE CONFIG ──────────────────────────────────────────────────────
-keep class com.lugg.reactnativeconfig.** { *; }

# ─── GENERAL JAVA / KOTLIN ────────────────────────────────────────────────────
# Keep all native methods (JNI) — these are called by name from native code
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep serializable classes (JSON deserialization)
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Keep Parcelable implementations
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# ─── SUPPRESS WARNINGS FOR KNOWN SAFE REMOVALS ───────────────────────────────
-dontwarn sun.misc.**
-dontwarn java.lang.invoke.**
-dontwarn okhttp3.**
-dontwarn okio.**
