import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import axiosInstance from "@mobile/shared/utils/axiosInstance";
import { ProductCard } from "../components/ProductCard";
import FilterModal from "../components/home/FilterModal";

const PAGE_LIMIT = 20;
const GUTTER = 12;
const GAP = 8;

const SORT_OPTIONS = [
  { label: "En Düşük Fiyat", value: "price" },
  { label: "En Yüksek Fiyat", value: "-price" },
  { label: "Yeni Gelenler", value: "-createdAt" },
  { label: "Çok Satanlar", value: "-soldCount" },
];

const BADGE_LABELS = {
  indirimli: "Flaş İndirimler",
  "en-cok-satan": "Çok Satanlar",
  "gunun-firsati": "Günün Fırsatı",
  yeni: "Yeni Ürünler",
  "ayin-urunleri": "Ayın Ürünleri",
  "monthly-featured": "Ayın Ürünleri",
  kampanyalar: "Kampanyalar",
  "listeli-urunler": "Listeli Ürünler",
};

function buildUrl(resolved, filterParams, query, sort, page) {
  const parts = [`page=${page}`, `limit=${PAGE_LIMIT}`];
  if (resolved.badge) parts.push(`badge=${resolved.badge}`);

  if (filterParams.categories?.length > 0) {
    parts.push(
      `category=${filterParams.categories.map((c) => c._id).join(",")}`,
    );
  } else if (resolved.categoryId) {
    parts.push(`category=${resolved.categoryId}`);
  }

  // Brand: modal selection overrides route param
  if (filterParams.brands.length > 0) {
    parts.push(
      `brand=${filterParams.brands.map(encodeURIComponent).join(",")}`,
    );
  } else if (resolved.brand) {
    parts.push(`brand=${encodeURIComponent(resolved.brand)}`);
  }

  if (resolved.stockLte != null) parts.push(`stockLte=${resolved.stockLte}`);
  if (filterParams.minPrice) parts.push(`minPrice=${filterParams.minPrice}`);
  if (filterParams.maxPrice) parts.push(`maxPrice=${filterParams.maxPrice}`);
  if (query) parts.push(`keyword=${encodeURIComponent(query)}`);
  if (sort) parts.push(`sort=${sort}`);
  return `/products?${parts.join("&")}`;
}

export default function CategoryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const filter = route.params?.filter ?? null;
  const initialKeyword = route.params?.initialKeyword ?? "";
  const canGoBack = navigation.canGoBack();

  const cardWidth = Math.floor((width - GUTTER * 2 - GAP) / 2);

  const [resolved, setResolved] = useState(null);
  const [title, setTitle] = useState("");
  const [query, setQuery] = useState(initialKeyword);
  const [sort, setSort] = useState("");
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sortVisible, setSortVisible] = useState(false);
  const [pendingSort, setPendingSort] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterParams, setFilterParams] = useState({
    categories: [],
    brands: [],
    minPrice: "",
    maxPrice: "",
  });

  const debounceRef = useRef(null);
  const queryRef = useRef(initialKeyword);
  const sortRef = useRef("");

  // Resolve filter params once on mount
  useEffect(() => {
    async function resolve() {
      if (!filter) {
        setTitle("Tüm Ürünler");
        setResolved({});
        return;
      }
      if (filter.featuredList) {
        setTitle(BADGE_LABELS[filter.featuredList] || filter.featuredList);
        setResolved({ featuredList: filter.featuredList });
      } else if (filter.badge) {
        setTitle(BADGE_LABELS[filter.badge] || filter.badge);
        setResolved({ badge: filter.badge });
      } else if (filter.category) {
        try {
          const res = await axiosInstance.get(`/categories/${filter.category}`);
          setTitle(res.data?.name || filter.category);
          setResolved({ categoryId: res.data?._id });
        } catch {
          setTitle(filter.category);
          setResolved({});
        }
      } else if (filter.brand) {
        setTitle(filter.brand);
        setResolved({ brand: filter.brand });
      } else if (filter.campaignId) {
        try {
          const res = await axiosInstance.get(
            `/campaigns/${filter.campaignId}`,
          );
          setTitle(res.data?.title || "Kampanya");
          setResolved({
            campaignId: filter.campaignId,
            campaignProducts: res.data?.products || [],
          });
        } catch {
          setTitle("Kampanya");
          setResolved({ campaignProducts: [] });
        }
      } else if (filter.stockLte != null) {
        setTitle("Stokları Eritiyoruz");
        setResolved({ stockLte: filter.stockLte });
      } else {
        setTitle("Tüm Ürünler");
        setResolved({});
      }
    }
    resolve();
  }, []);

  const fetchProducts = useCallback(
    async (pg, q, s, fp) => {
      if (resolved === null) return;
      if (pg === 1) setLoading(true);
      else setLoadingMore(true);

      const activeFp = fp ?? filterParams;
      try {
        if (resolved.featuredList) {
          const res = await axiosInstance.get(
            `/featured-lists/${resolved.featuredList}`,
          );
          const list = res.data.products || [];
          setProducts(list);
          setTotal(list.length);
          setHasMore(false);
          setPage(1);
        } else if (resolved.campaignProducts) {
          const list = resolved.campaignProducts;
          setProducts(list);
          setTotal(list.length);
          setHasMore(false);
          setPage(1);
        } else {
          const url = buildUrl(resolved, activeFp, q, s, pg);
          const res = await axiosInstance.get(url);
          const data = res.data;
          const list = Array.isArray(data) ? data : (data.products ?? []);
          const tot = typeof data.total === "number" ? data.total : list.length;

          setTotal(tot);
          setProducts((prev) => (pg === 1 ? list : [...prev, ...list]));
          setHasMore(list.length === PAGE_LIMIT);
          setPage(pg);
        }
      } catch {
        if (pg === 1) setProducts([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [resolved, filterParams],
  );

  // Load on filter resolve
  useEffect(() => {
    if (resolved !== null) {
      fetchProducts(1, queryRef.current, sortRef.current);
    }
  }, [resolved]);

  const handleQueryChange = (text) => {
    setQuery(text);
    queryRef.current = text;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => fetchProducts(1, text, sortRef.current),
      400,
    );
  };

  const openSort = () => {
    setPendingSort(sort);
    setSortVisible(true);
  };

  const handleSortConfirm = () => {
    setSort(pendingSort);
    sortRef.current = pendingSort;
    setSortVisible(false);
    fetchProducts(1, queryRef.current, pendingSort);
  };

  const handleFilterApply = (fp) => {
    setFilterParams(fp);
    setFilterVisible(false);
    fetchProducts(1, queryRef.current, sortRef.current, fp);
  };

  const filterCount =
    filterParams.categories.length +
    filterParams.brands.length +
    (filterParams.minPrice || filterParams.maxPrice ? 1 : 0);

  const handleLoadMore = () => {
    if (!loadingMore && !loading && hasMore) {
      fetchProducts(page + 1, queryRef.current, sortRef.current);
    }
  };

  const placeholder =
    title && total > 0 ? `${title} (${total} Ürün)` : title || "Ürün ara...";

  return (
    <SafeAreaView className="flex-1 bg-bg-light" edges={["top"]}>
      {/* Header */}
      <View className="bg-white px-3 py-2.5 flex-row items-center gap-2">
        {canGoBack && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color="#212529" />
          </TouchableOpacity>
        )}
        <View
          className="flex-1 flex-row items-center bg-bg-light rounded-xl px-3 gap-2"
          style={{ height: 40 }}
        >
          <TextInput
            className="flex-1 text-sm text-text-primary"
            placeholder={placeholder}
            placeholderTextColor="#adb5bd"
            value={query}
            onChangeText={handleQueryChange}
            returnKeyType="search"
          />
          <Ionicons name="search-outline" size={18} color="#adb5bd" />
        </View>
        <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="notifications-outline" size={22} color="#212529" />
        </TouchableOpacity>
      </View>

      {/* Sort / Filter bar */}
      <View className="bg-white flex-row px-3 py-2 gap-2">
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-1 bg-bg-light rounded-sm py-2"
          onPress={openSort}
        >
          <MaterialIcons name="swap-vert" size={16} color="#F83B0A" />
          <Text className="text-sm text-text-secondary font-medium">
            Sırala
          </Text>
          {sort !== "" && (
            <View className="w-1.5 h-1.5 rounded-full bg-primary ml-0.5" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-1 bg-bg-light rounded-sm py-2"
          onPress={() => setFilterVisible(true)}
        >
          <MaterialIcons name="tune" size={16} color="#F83B0A" />
          <Text className="text-sm text-text-secondary font-medium">
            Filtrele
          </Text>
          {filterCount > 0 && (
            <View className="bg-primary rounded-full min-w-[16px] h-4 items-center justify-center px-1 ml-0.5">
              <Text className="text-white text-2xs font-bold">
                {filterCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Product grid */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#ff7700" size="large" />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={{
            paddingHorizontal: GUTTER,
            gap: GAP,
            marginBottom: GAP,
          }}
          contentContainerStyle={{ paddingVertical: 8 }}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              cardWidth={cardWidth}
              noMargin
              gridMode
            />
          )}
          ListFooterComponent={
            loadingMore ? (
              <View className="py-4 items-center">
                <ActivityIndicator color="#ff7700" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons name="search-outline" size={48} color="#adb5bd" />
              <Text className="text-text-muted mt-3 text-base">
                Ürün bulunamadı
              </Text>
            </View>
          }
        />
      )}

      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={handleFilterApply}
        initialFilter={filterParams}
      />

      {/* Sort bottom sheet */}
      <Modal
        visible={sortVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSortVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Pressable
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
            }}
            onPress={() => setSortVisible(false)}
          />
          <View
            className="bg-white px-5 pt-4"
            style={{
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingBottom: Math.max(32, insets.bottom + 16),
            }}
          >
            <Text className="text-lg font-bold text-text-primary mb-1 text-center pb-5">
              Sıralama
            </Text>

            {SORT_OPTIONS.map((opt) => {
              const selected = pendingSort === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  className="flex-row items-center gap-3 py-4"
                  onPress={() => setPendingSort(opt.value)}
                  activeOpacity={0.7}
                >
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      borderWidth: 2,
                      borderColor: selected ? "#F83B0A" : "#adb5bd",
                      backgroundColor: selected ? "#F83B0A" : "transparent",
                    }}
                  />
                  <Text
                    className={`text-base ${selected ? "text-text-primary font-semibold" : "text-text-primary"}`}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              className="bg-brand-red rounded-sm py-4 mt-8 flex-row items-center justify-center gap-2"
              onPress={handleSortConfirm}
              activeOpacity={0.85}
            >
              <Text className="text-white font-bold text-base">Ürüne Git</Text>
              <Image
                source={require("../assets/arrow.png")}
                style={{ width: 40, height: 18 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
