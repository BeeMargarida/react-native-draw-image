package com.drawimage

import android.view.View

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.DrawImageViewManagerDelegate
import com.facebook.react.viewmanagers.DrawImageViewManagerInterface

abstract class DrawImageViewManagerSpec<T : View> : SimpleViewManager<T>(), DrawImageViewManagerInterface<T> {
  private val mDelegate: ViewManagerDelegate<T>

  init {
    mDelegate = DrawImageViewManagerDelegate(this)
  }

  override fun getDelegate(): ViewManagerDelegate<T>? {
    return mDelegate
  }
}
