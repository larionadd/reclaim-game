package ua.reclaim.game;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import org.json.JSONObject;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {
    private static final int EXPORT_SAVE = 11;
    private static final int IMPORT_SAVE = 12;
    private WebView web;
    private String pendingSave;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(0xff171c17);
        getWindow().setNavigationBarColor(0xff171c17);
        web = new WebView(this);
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        web.getSettings().setAllowFileAccess(false);
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                if (!"reclaim.local".equals(request.getUrl().getHost())) return null;
                String path = request.getUrl().getPath();
                if (path == null || path.equals("/")) path = "/index.html";
                if (path.contains("..")) return null;
                try {
                    InputStream stream = getAssets().open("web" + path);
                    return new WebResourceResponse(mime(path), "UTF-8", stream);
                } catch (Exception error) { return null; }
            }
        });
        web.addJavascriptInterface(new SaveBridge(), "ReclaimAndroid");
        setContentView(web);
        web.loadUrl("https://reclaim.local/index.html");
    }

    private static String mime(String path) {
        if (path.endsWith(".html")) return "text/html";
        if (path.endsWith(".js")) return "text/javascript";
        if (path.endsWith(".css")) return "text/css";
        if (path.endsWith(".svg")) return "image/svg+xml";
        if (path.endsWith(".webp")) return "image/webp";
        if (path.endsWith(".png")) return "image/png";
        if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
        if (path.endsWith(".json")) return "application/json";
        return "application/octet-stream";
    }

    public class SaveBridge {
        @JavascriptInterface public void exportSave(String json) {
            runOnUiThread(() -> {
                pendingSave = json;
                Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("application/json");
                intent.putExtra(Intent.EXTRA_TITLE, "reclaim-save.json");
                startActivityForResult(intent, EXPORT_SAVE);
            });
        }
        @JavascriptInterface public void importSave() {
            runOnUiThread(() -> {
                Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("application/json");
                startActivityForResult(intent, IMPORT_SAVE);
            });
        }
    }

    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (result != RESULT_OK || data == null || data.getData() == null) return;
        try {
            if (request == EXPORT_SAVE && pendingSave != null) {
                try (OutputStream out = getContentResolver().openOutputStream(data.getData())) {
                    if (out != null) out.write(pendingSave.getBytes(StandardCharsets.UTF_8));
                }
                pendingSave = null;
            } else if (request == IMPORT_SAVE) {
                try (InputStream in = getContentResolver().openInputStream(data.getData()); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                    byte[] buffer = new byte[8192]; int size;
                    while ((size = in.read(buffer)) != -1) {
                        if (out.size() + size > 10_000_000) throw new IllegalArgumentException("Save too large");
                        out.write(buffer, 0, size);
                    }
                    String json = out.toString("UTF-8");
                    web.evaluateJavascript("window.reclaimImportSave(" + JSONObject.quote(json) + ")", null);
                }
            }
        } catch (Exception error) { android.util.Log.e("RECLAIM", "Save transfer failed", error); }
    }
}
