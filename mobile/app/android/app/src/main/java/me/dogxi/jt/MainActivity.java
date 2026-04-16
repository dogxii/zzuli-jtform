package me.dogxi.jt;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;
import android.webkit.WebSettings;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final int STATUS_BAR_COLOR = Color.parseColor("#1D4481");
    private static final int NAVIGATION_BAR_COLOR = Color.WHITE;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        applySystemBarStyle();
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();
            webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
            webView.setVerticalScrollBarEnabled(false);
            WebSettings settings = webView.getSettings();
            settings.setTextZoom(100);
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        applySystemBarStyle();
    }

    private void applySystemBarStyle() {
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
        getWindow().setStatusBarColor(STATUS_BAR_COLOR);
        getWindow().setNavigationBarColor(NAVIGATION_BAR_COLOR);
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        if (controller != null) {
            controller.setAppearanceLightStatusBars(false);
            controller.setAppearanceLightNavigationBars(true);
        }
    }
}
