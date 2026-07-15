import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView, Platform, View, Alert } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import Constants from 'expo-constants';
import { useRef } from 'react';

export default function App() {
  const webviewRef = useRef<WebView>(null);
  // Use custom Serveo Proxy with KeepAlive to bypass firewall, timeouts, Next.js blocks
  const WEBVIEW_URL = 'http://192.168.0.133:3000';

  const onMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'IAP_PURCHASE') {
        const { productId, amount, bonus, price } = data.payload;
        Alert.alert(
          "코인 결제 요청 (Native App)",
          `상품 ID: ${productId}\n결제 금액: ${price.toLocaleString()}원\n\n(실제 앱 심사 시 이 단계에서 구글/애플 결제 모듈이 뜹니다.)`,
          [
            { 
              text: "가상 결제 승인", 
              onPress: () => {
                webviewRef.current?.injectJavaScript(`
                  window.postMessage(JSON.stringify({ 
                    type: 'IAP_SUCCESS', 
                    payload: { productId: '${productId}', receipt: 'mock_receipt_${Date.now()}' } 
                  }), '*');
                  true;
                `);
              } 
            },
            { text: "취소", style: "cancel" }
          ]
        );
      }
    } catch (error) {
      console.error("WebView message parsing error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <View style={styles.webviewContainer}>
        <WebView 
          ref={webviewRef}
          source={{ uri: WEBVIEW_URL }} 
          style={styles.webview}
          onMessage={onMessage}
          bounces={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          cacheEnabled={false}
          cacheMode="LOAD_NO_CACHE"
          incognito={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? Constants.statusBarHeight : 0,
  },
  webviewContainer: {
    flex: 1,
    width: '100%',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
