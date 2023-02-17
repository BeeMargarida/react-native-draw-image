package com.drawimage

import android.graphics.Color
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

@ReactModule(name = DrawImageViewManager.NAME)
class DrawImageViewManager :
  DrawImageViewManagerSpec<DrawImageView>() {
  override fun getName(): String {
    return NAME
  }

  public override fun createViewInstance(context: ThemedReactContext): DrawImageView {
    return DrawImageView(context)
  }

  @ReactProp(name = "color")
  override fun setColor(view: DrawImageView?, color: String?) {
    view?.setBackgroundColor(Color.parseColor(color))
  }

  companion object {
    const val NAME = "DrawImageView"
  }
}
