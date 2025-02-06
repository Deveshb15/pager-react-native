import { Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { useLocalSearchParams } from "expo-router";

import tw from "@utils/tailwind";
import SafeView from "@components/SafeView";

export default function UsernamePage() {
  const { username } = useLocalSearchParams();

  return (
    <BlurView intensity={75} style={tw`flex flex-1`} tint="dark">
      <SafeView>
        <View style={tw`flex flex-1 justify-center items-center`}>
          <Text
            style={tw.style(`text-white text-xl`, {
              fontFamily: "Cabin_600SemiBold",
            })}
          >
            {username}
          </Text>
        </View>
      </SafeView>
    </BlurView>
  );
}
