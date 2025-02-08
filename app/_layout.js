import { useEffect, useRef, useState } from "react";
import { AppState, LogBox, Text, Alert, Platform } from "react-native";

import { Stack } from "expo-router";
import { BlurView } from "expo-blur";
import Toast from "react-native-toast-message";
// import { Mixpanel } from "mixpanel-react-native";
import * as Notifications from "expo-notifications";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
} from "@tanstack/react-query";

import tw from "@utils/tailwind";
import MainAlert from "@components/Alert";
import AppContext from "@utils/context";
import constants from "@utils/constants";
import * as Linking from "expo-linking";
import branch from "react-native-branch";
import * as Clipboard from "expo-clipboard";

LogBox.ignoreAllLogs();
const queryClient = new QueryClient();
// const mixpanel = new Mixpanel(constants.MIXPANEL_PROJECT_TOKEN, true);
// mixpanel.init();

// if (__DEV__) {
//   mixpanel.optOutTracking();
// }

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const toastConfig = {
  main: ({ text1 }) => (
    <BlurView
      intensity={75}
      style={tw`w-[80%] rounded-2xl overflow-hidden items-center justify-center border border-white/70 p-5`}
    >
      <Text style={tw.style(`text-white`, { fontFamily: "Cabin_600SemiBold" })}>
        {text1}
      </Text>
    </BlurView>
  ),
};

export default function Layout() {
  const alertRef = useRef();
  const responseListener = useRef();
  const [appState, setAppState] = useState(null);

  useEffect(() => {
    // responseListener.current =
    //   Notifications.addNotificationResponseReceivedListener(
    //     ({ notification }) => {
    //       if (notification?.request?.content?.data?.event) {
    //         mixpanel.track(notification?.request?.content?.data?.event);
    //       }

    //       mixpanel.track("tapped_notification");
    //     },
    //   );

    const subscription = AppState.addEventListener("change", (status) => {
      setAppState(status);
      focusManager.setFocused(status === "active");
    });

    return () => {
      subscription.remove();
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const onHandleNavigate = (params, uri) => {
    Alert.alert("Branch params: " + JSON.stringify(params));
    Alert.alert("Branch uri: " + uri);
    // readDeepLink().then((object) => {
    //   replace(ROUTES.READ_DEEP_LINK, {
    //       routeID: currentRoute,
    //       params: params,
    //       lastParams: object.lastParams,
    //       installParams: object.installParams,
    //       sourceURL: clickedURL,
    //       deepLinkURL: uri,
    //   });
    // });
  };

  useEffect(() => {
    branch.subscribe({
      onOpenStart: ({ uri, cachedInitialEvent }) => {
        // cachedInitialEvent is true if the event was received by the
        // native layer before JS loaded.
        console.log("Branch will open " + uri);
        Alert.alert("Branch will open " + uri);
        Alert.alert("Branch will open " + cachedInitialEvent);
      },
      onOpenComplete: ({ error, params, uri }) => {
        if (error) {
          console.error("Error from Branch opening uri " + uri);
          Alert.alert("Error from Branch opening uri " + uri);
          return;
        }

        console.log("Branch opened 1" + uri);
        Alert.alert("Branch opened 1" + uri);
        // handle params
        if (params["+clicked_branch_link"]) {
          console.log("Branch opened 2" + uri);
          Alert.alert("Branch opened 2" + uri);
        }

        if (params) {
          if (params.$deeplink_path) {
            console.log("Branch opened 3" + uri);
            Alert.alert("Branch opened 3" + uri);
          }
        }
      },
    });
  }, []);

  useEffect(() => {
    const unsubscribe = branch.subscribe(({ error, params, uri }) => {
      if (error) {
        console.error("Error from Branch: " + error);
        Alert.alert("Error from Branch: " + error);
        return;
      }
      if (!params["+clicked_branch_link"] && !params["+non_branch_link"]) {
        // this is one of those responses you can ignore
        Alert.alert("Branch ignored");
        return;
      }
      // console.log('params non_branch_link', params?.['+non_branch_link']);
      Alert.alert("Branch uri: " + uri);
      onHandleNavigate(params, uri);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkClipboardForLink = async () => {
      if (Platform.OS === "ios") {
        const clipboardContent = await Clipboard.getStringAsync();
        console.log("Deferred deep link:", clipboardContent);
        Alert.alert("Deferred deep link: " + clipboardContent);
      }
    };

    checkClipboardForLink();
  }, []);

  const url = Linking.useURL();

  useEffect(() => {
    if (url) {
      const { path } = Linking.parse(url);
      if (path) {
        // Remove leading slash if present
        const username = path.replace(/^\//, "");
        Alert.alert(username);
      }
    }
  }, [url]);

  useEffect(() => {
    const getInitialURL = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        const { path } = Linking.parse(url);
        Alert.alert(path);
      } else {
        Alert.alert("no url");
      }
    };
    getInitialURL();
  }, []);

  return (
    <>
      <GestureHandlerRootView style={tw`flex-1`}>
        <AppContext.Provider value={{ appState, alert: alertRef }}>
          <QueryClientProvider client={queryClient}>
            <BottomSheetModalProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" options={{ headerShown: false }} />

                <Stack.Screen
                  name="contact"
                  options={{
                    presentation: "modal",
                    contentStyle: { backgroundColor: "#00000000" },
                  }}
                />

                <Stack.Screen
                  name="pages"
                  options={{
                    presentation: "modal",
                    contentStyle: { backgroundColor: "#00000000" },
                  }}
                />

                <Stack.Screen
                  name="requests"
                  options={{
                    presentation: "modal",
                    contentStyle: { backgroundColor: "#00000000" },
                  }}
                />

                <Stack.Screen
                  name="profile"
                  options={{
                    presentation: "modal",
                    contentStyle: { backgroundColor: "#00000000" },
                  }}
                />

                <Stack.Screen
                  name="page"
                  options={{ presentation: "transparentModal" }}
                />

                <Stack.Screen
                  name="external_page"
                  options={{ presentation: "transparentModal" }}
                />

                <Stack.Screen
                  name="(context)/welcome_context"
                  options={{ presentation: "fullScreenModal" }}
                />
              </Stack>
            </BottomSheetModalProvider>
          </QueryClientProvider>

          <MainAlert ref={alertRef} />
        </AppContext.Provider>
      </GestureHandlerRootView>

      <Toast config={toastConfig} />
    </>
  );
}
