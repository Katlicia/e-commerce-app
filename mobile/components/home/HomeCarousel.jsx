import React, { useEffect, useRef, useState } from "react";
import { View, FlatList, Image, useWindowDimensions } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getBanner } from "@mobile/shared/redux/bannerSlice";

export default function HomeCarousel() {
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const images = useSelector((state) => state.banner.banners?.["carousel"]);
  const flatListRef = useRef(null);
  const currentRef = useRef(0);
  const [dotIndex, setDotIndex] = useState(0);

  useEffect(() => {
    dispatch(getBanner("carousel"));
  }, []);

  useEffect(() => {
    if (!images?.length) return;
    const count = images.length;

    const id = setInterval(() => {
      const next = currentRef.current + 1;
      currentRef.current = next;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setDotIndex(next % count);

      if (next === count) {
        // scrolled to clone of first image — silently jump back to real index 0
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index: 0, animated: false });
          currentRef.current = 0;
        }, 380);
      }
    }, 4000);

    return () => clearInterval(id);
  }, [images]);

  if (!images?.length) return null;

  // append clone of first item so the forward jump to it looks seamless
  const loopData = [...images, images[0]];

  const handleScrollEnd = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    if (idx >= images.length) {
      flatListRef.current?.scrollToIndex({ index: 0, animated: false });
      currentRef.current = 0;
      setDotIndex(0);
    } else {
      currentRef.current = idx;
      setDotIndex(idx);
    }
  };

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={loopData}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onMomentumScrollEnd={handleScrollEnd}
        renderItem={({ item }) => (
          <View
            style={{
              width,
              height: width * 0.5,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={{ uri: item.url }}
              style={{ width: "95%", height: "100%" }}
              resizeMode="contain"
            />
          </View>
        )}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          paddingVertical: 6,
          gap: 5,
        }}
      >
        {images.map((_, i) => (
          <View
            key={i}
            style={{
              width: dotIndex === i ? 16 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: dotIndex === i ? "#ff7700" : "#ccc",
            }}
          />
        ))}
      </View>
    </View>
  );
}
