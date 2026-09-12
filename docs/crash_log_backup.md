## Crash Details

**Crash Thread**: `Thread[main,5,main]`  
**Crash Timestamp**: `2026-09-11 07:19:28.676 UTC`  

**Crash Message**:
```
Attempt to invoke virtual method 'char java.lang.Character.charValue()' on a null object reference
```


### Stacktrace

```
java.lang.NullPointerException: Attempt to invoke virtual method 'char java.lang.Character.charValue()' on a null object reference
	at com.termux.app.SuggestionBarView.reloadWithInput(SuggestionBarView.java:2254)
	at com.termux.app.SuggestionBarView.lambda$refreshAllApps$9$com-termux-app-SuggestionBarView(SuggestionBarView.java:1223)
	at com.termux.app.SuggestionBarView$$ExternalSyntheticLambda0.run(D8$$SyntheticClass:0)
	at android.os.Handler.handleCallback(Handler.java:995)
	at android.os.Handler.dispatchMessage(Handler.java:103)
	at android.os.Looper.loopOnce(Looper.java:276)
	at android.os.Looper.loop(Looper.java:374)
	at android.app.ActivityThread.main(ActivityThread.java:9284)
	at java.lang.reflect.Method.invoke(Native Method)
	at com.android.internal.os.RuntimeInit$MethodAndArgsCaller.run(RuntimeInit.java:609)
	at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:981)

```
##


## Termux:Launcher App Info

**APP_NAME**: `Termux:Launcher`  
**PACKAGE_NAME**: `com.termux.launcher.nix`  
**VERSION_NAME**: `0.2.39-nix`  
**VERSION_CODE**: `1020`  
**UID**: `10122`  
**TARGET_SDK**: `28`  
**IS_DEBUGGABLE_BUILD**: `true`  
**SE_PROCESS_CONTEXT**: `u:r:untrusted_app_27:s0:c122,c256,c512,c768`  
**SE_FILE_CONTEXT**: `u:object_r:app_data_file:s0:c122,c256,c512,c768`  
**SE_INFO**: `null`  
**TERMUX_APP_PACKAGE_MANAGER**: `NIX`  
**TERMUX_APP_PACKAGE_VARIANT**: `NIX`  
**APK_RELEASE**: `GitHub`  
**SIGNING_CERTIFICATE_SHA256_DIGEST**: `B6DA01480EEFD5FBF2CD3771B8D1021EC791304BDD6C4BF41D3FAABAD48EE5E1`  
##


## Device Info

### Software

**OS_VERSION**: `6.1.145-android14-11-gd1b5b8b300b3-ab14477424`  
**SDK_INT**: `36`  
**RELEASE**: `16`  
**ID**: `BP2A.250605.031.A3`  
**DISPLAY**: `X6878-16.1.0.160SP08(OPPJ011PF001PJ)`  
**INCREMENTAL**: `101600041`  
**SECURITY_PATCH**: `2026-04-01`  
**IS_TREBLE_ENABLED**: `true`  
**TYPE**: `user`  
**TAGS**: `release-keys`  
**MAX_PHANTOM_PROCESSES**: `2147483647`  
**MONITOR_PHANTOM_PROCS**: `<unsupported>`  
**DEVICE_CONFIG_SYNC_DISABLED**: -  

### Hardware

**MANUFACTURER**: `INFINIX`  
**BRAND**: `Infinix`  
**MODEL**: `Infinix X6878`  
**PRODUCT**: `X6878-OPPJ`  
**BOARD**: `volcano`  
**HARDWARE**: `qcom`  
**DEVICE**: `Infinix-X6878`  
**SUPPORTED_ABIS**: `arm64-v8a`  
##
