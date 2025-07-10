package com.rn_tbn

import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AudioPlayerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "AudioPlayerModule"

    @ReactMethod
    fun play(url: String) {
        val intent = Intent(reactApplicationContext, AudioPlayerService::class.java)
        intent.putExtra("action", "play")
        intent.putExtra("url", url)
        reactApplicationContext.startService(intent)
    }

    @ReactMethod
    fun pause() {
        val intent = Intent(reactApplicationContext, AudioPlayerService::class.java)
        intent.putExtra("action", "pause")
        reactApplicationContext.startService(intent)
    }

    @ReactMethod
    fun resume() {
        val intent = Intent(reactApplicationContext, AudioPlayerService::class.java)
        intent.putExtra("action", "resume")
        reactApplicationContext.startService(intent)
    }

    @ReactMethod
    fun stop() {
        val intent = Intent(reactApplicationContext, AudioPlayerService::class.java)
        intent.putExtra("action", "stop")
        reactApplicationContext.startService(intent)
    }

    @ReactMethod
    fun setVolume(volume: Double) {
        val intent = Intent(reactApplicationContext, AudioPlayerService::class.java)
        intent.putExtra("action", "setVolume")
        intent.putExtra("volume", volume.toFloat())
        reactApplicationContext.startService(intent)
    }
} 