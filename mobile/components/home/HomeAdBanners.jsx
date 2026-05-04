import React, { useEffect, useState } from "react";
import { Image, TouchableOpacity, ScrollView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { getBanner } from "@mobile/shared/redux/bannerSlice";

function AdBannerImage({ uri, onPress }) {
  const [ratio, setRatio] = useState(4);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.85 : 1}>
      <Image
        source={{ uri }}
        style={{ aspectRatio: ratio, height: 80 }}
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
      navigation.navigate("ProductList", {
        filter: { category: link.slice(4) },
      });
    } else if (link.startsWith("brand:")) {
      navigation.navigate("ProductList", { filter: { brand: link.slice(6) } });
    } else {
      navigation.navigate("ProductList", { filter: { category: link } });
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="my-3"
      contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
    >
      {images.map((img, i) => (
        <AdBannerImage
          key={i}
          uri={img.url}
          onPress={img.link ? () => handlePress(img.link) : null}
        />
      ))}
    </ScrollView>
  );
}
