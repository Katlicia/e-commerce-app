import React, { useEffect, useState } from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { getBanner } from "@mobile/shared/redux/bannerSlice";

function AdBannerImage({ uri, onPress }) {
  const [ratio, setRatio] = useState(1.8);

  return (
    <TouchableOpacity
      style={{ flex: 1 }}
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
    >
      <Image
        source={{ uri }}
        style={{ width: "100%", aspectRatio: ratio }}
        resizeMode="cover"
        className="rounded-sm"
        onLoad={(e) => {
          const { width, height } = e.nativeEvent.source;
          if (width && height) setRatio(width / height);
        }}
      />
    </TouchableOpacity>
  );
}

export default function HomeAdBanners({ type }) {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const images = useSelector((state) => state.banner.banners?.[type]);

  useEffect(() => {
    dispatch(getBanner(type));
  }, [type]);

  if (!images?.length) return null;

  const handlePress = (link) => {
    if (!link) return;
    if (link.startsWith("cat:")) {
      navigation.navigate("Category", { filter: { category: link.slice(4) } });
    } else if (link.startsWith("brand:")) {
      navigation.navigate("Category", { filter: { brand: link.slice(6) } });
    } else {
      navigation.navigate("Category", { filter: { category: link } });
    }
  };

  return (
    <View className="flex-row px-3 gap-1 my-3">
      {images.map((img, i) => (
        <AdBannerImage
          key={i}
          uri={img.url}
          onPress={img.link ? () => handlePress(img.link) : null}
        />
      ))}
    </View>
  );
}
