import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView, Platform, View, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import { useRef, useEffect, useState } from 'react';
import {
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  type Purchase,
  type PurchaseError,
  finishTransaction,
  requestPurchase,
  getProducts
} from 'react-native-iap';

const iapSkus = [
  'com.sajuhub.coin.5k',
  'com.sajuhub.coin.10k',
  'com.sajuhub.coin.30k',
  'com.sajuhub.coin.50k',
  'com.sajuhub.coin.100k'
];

export default function App() {
  const webviewRef = useRef<WebView>(null);
  const [connected, setConnected] = useState(false);
  
  // Production URL for testing the live site.
  // To test local dev server, change this to your PC's local IP (e.g. http://192.168.x.x:3000)
  const WEBVIEW_URL = 'https://saju-web.vercel.app';

  useEffect(() => {
    // 1. Initialize IAP connection
    initConnection()
      .then(result => {
          const isConnected = typeof result === 'boolean' ? result : true;
          setConnected(isConnected);
          
          if (isConnected) {
              // Pre-fetch product lists (required for requestPurchase to work)
              getProducts({ skus: iapSkus })
                .then(res => console.log("IAP Products Fetched:", res))
                .catch(e => console.warn("IAP getProducts Error:", e));
          }
      })
      .catch(e => console.warn("IAP Init Error", e));

    // 2. Setup standard listeners
    const purchaseUpdateSubscription = purchaseUpdatedListener(
      async (rawPurchase: Purchase) => {
        try {
          const purchase: any = rawPurchase;
          // iOS uses transactionReceipt, Android uses purchaseToken inside receipt
          const receipt = purchase.transactionReceipt || purchase.purchaseToken;
          if (receipt) {
            // Signal success back to webview via postMessage
            webviewRef.current?.injectJavaScript(`
              try {
                window.postMessage(JSON.stringify({ 
                  type: 'IAP_SUCCESS', 
                  payload: { 
                    productId: '${purchase.productId}', 
                    receipt: '${receipt}', 
                    platform: '${Platform.OS}' 
                  } 
                }));
              } catch(e) {}
              true;
            `);
            
            // Finish transaction explicitly to prevent refund/re-delivery
            await finishTransaction({ purchase, isConsumable: true });
          }
        } catch (error) {
          console.error("Purchase Update processing failed", error);
        }
      }
    );

    const purchaseErrorSubscription = purchaseErrorListener(
      (error: PurchaseError) => {
        console.warn('Purchase Error', error);
        webviewRef.current?.injectJavaScript(`
          try {
            window.postMessage(JSON.stringify({ type: 'IAP_FAIL', error: '${error.message}' }));
          } catch(e) {}
          true;
        `);
      }
    );

    return () => {
      purchaseUpdateSubscription.remove();
      purchaseErrorSubscription.remove();
    };
  }, []);

  const handleWebViewMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'IAP_PURCHASE') {
        const { productId } = data.payload;
        
        if (!connected) {
          Alert.alert("결제 가능", "로컬 테스트 모드 통신입니다 (react-native-iap 에뮬레이터 불가 처리).");
          // Fake success for dev env if native module is missing
          webviewRef.current?.injectJavaScript(`
            window.postMessage(JSON.stringify({ 
              type: 'IAP_SUCCESS', 
              payload: { 
                productId: '${productId}', 
                receipt: 'mock_receipt_1234', 
                platform: '${Platform.OS}' 
              } 
            }));
            true;
          `);
          return;
        }

        try {
          await requestPurchase({ sku: productId } as any);
        } catch (err: any) {
          console.warn("requestPurchase failed:", err);
          Alert.alert("결제 요청 오류", err.message || "알 수 없는 오류가 발생했습니다.");
        }
      }
    } catch (e) {
      console.warn("WebView Message Parsing Error:", e);
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
          onMessage={handleWebViewMessage}
          bounces={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
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
