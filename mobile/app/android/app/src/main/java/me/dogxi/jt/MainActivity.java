package me.dogxi.jt;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebSettings;

import androidx.core.view.WindowCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.parseColor("#1D4481"));
        WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView()).setAppearanceLightStatusBars(false);
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().setOverScrollMode(View.OVER_SCROLL_NEVER);
            WebSettings settings = getBridge().getWebView().getSettings();
            settings.setTextZoom(100);
        }
    }
}
