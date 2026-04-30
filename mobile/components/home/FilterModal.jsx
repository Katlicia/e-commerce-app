import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axiosInstance from "@mobile/shared/utils/axiosInstance";

function flattenTree(nodes) {
  const result = [];
  const recurse = (node) => {
    result.push(node);
    (node.children ?? []).forEach(recurse);
  };
  nodes.forEach(recurse);
  return result;
}

function ModalHeader({ onBack, title, right }) {
  return (
    <View className="flex-row items-center px-5 py-4 border-b border-border-subtle">
      <View style={{ width: 60 }}>
        <TouchableOpacity onPress={onBack} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color="#212529" />
        </TouchableOpacity>
      </View>
      <Text className="flex-1 text-center text-lg font-bold text-text-primary">
        {title}
      </Text>
      <View style={{ width: 60, alignItems: "flex-end" }}>{right}</View>
    </View>
  );
}

function SearchBar({ value, onChange, placeholder }) {
  return (
    <View
      className="flex-row items-center bg-bg-light mx-4 my-3 px-3 gap-2 rounded-xl"
      style={{ height: 40 }}
    >
      <Ionicons name="search-outline" size={16} color="#adb5bd" />
      <TextInput
        className="flex-1 text-sm text-text-primary"
        placeholder={placeholder}
        placeholderTextColor="#adb5bd"
        value={value}
        onChangeText={onChange}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChange("")} hitSlop={6}>
          <Ionicons name="close-circle" size={16} color="#adb5bd" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const Checkbox = React.memo(function Checkbox({ selected }) {
  return (
    <View
      style={{
        width: 22,
        height: 22,
        borderRadius: 4,
        backgroundColor: selected ? "#F83B0A" : "transparent",
        borderWidth: 2,
        borderColor: selected ? "#F83B0A" : "#dee2e6",
      }}
    />
  );
});

function Chip({ label, onRemove }) {
  return (
    <View className="flex-row items-center bg-bg-light rounded-full px-2.5 py-1 gap-1">
      <Text className="text-xs text-text-secondary">{label}</Text>
      <TouchableOpacity onPress={onRemove} hitSlop={6}>
        <Ionicons name="close-circle" size={14} color="#adb5bd" />
      </TouchableOpacity>
    </View>
  );
}

const CategoryRow = React.memo(function CategoryRow({
  node,
  depth,
  selected,
  onToggle,
  expanded,
  onExpand,
}) {
  const id = String(node._id);
  const isSelected = selected.some((c) => String(c._id) === id);
  const hasChildren = (node.children ?? []).length > 0;
  const isExpanded = expanded[id];

  return (
    <View>
      <View
        style={{ paddingLeft: 20 + depth * 20 }}
        className="flex-row items-center pr-4 py-3.5 border-b border-border-subtle"
      >
        <TouchableOpacity
          className="flex-row items-center gap-3 flex-1"
          onPress={() => onToggle(node)}
          activeOpacity={0.7}
        >
          <Checkbox selected={isSelected} />
          <View className="flex-row items-center gap-2 flex-1">
            <Text
              className={`text-base ${isSelected ? "text-primary font-semibold" : "text-text-primary"}`}
            >
              {node.name}
            </Text>
            <Text className="text-sm text-text-muted">
              ({node.productCount})
            </Text>
          </View>
        </TouchableOpacity>
        {hasChildren && (
          <TouchableOpacity
            onPress={() => onExpand(id)}
            hitSlop={8}
            className="pl-3"
          >
            <Ionicons
              name={isExpanded ? "chevron-down" : "chevron-forward"}
              size={18}
              color="#adb5bd"
            />
          </TouchableOpacity>
        )}
      </View>
      {hasChildren &&
        isExpanded &&
        node.children.map((child) => (
          <CategoryRow
            key={String(child._id)}
            node={child}
            depth={depth + 1}
            selected={selected}
            onToggle={onToggle}
            expanded={expanded}
            onExpand={onExpand}
          />
        ))}
    </View>
  );
});

function CategoryView({ selected, onBack, onChange }) {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    axiosInstance
      .get("/categories")
      .then((res) => setTree(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const allFlat = useMemo(() => flattenTree(tree), [tree]);

  const filtered = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return allFlat.filter((c) => c.name.toLowerCase().includes(q));
  }, [search, allFlat]);

  const toggleCategory = useCallback(
    (cat) =>
      onChange((prev) =>
        prev.some((c) => String(c._id) === String(cat._id))
          ? prev.filter((c) => String(c._id) !== String(cat._id))
          : [...prev, { _id: String(cat._id), name: cat.name }],
      ),
    [onChange],
  );

  const toggleExpand = useCallback(
    (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] })),
    [],
  );

  const renderSearchItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        className="flex-row items-center gap-3 px-5 py-3.5 border-b border-border-subtle"
        onPress={() => toggleCategory(item)}
        activeOpacity={0.7}
      >
        <Checkbox
          selected={selected.some((c) => String(c._id) === String(item._id))}
        />
        <Text className="text-base text-text-primary flex-1">{item.name}</Text>
        {item.productCount > 0 && (
          <Text className="text-sm text-text-muted">({item.productCount})</Text>
        )}
      </TouchableOpacity>
    ),
    [toggleCategory, selected],
  );

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <ModalHeader
        onBack={onBack}
        title="Kategori"
        right={
          selected.length > 0 ? (
            <TouchableOpacity onPress={() => onChange([])}>
              <Text className="text-primary font-semibold text-sm">
                TEMİZLE
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Kategori ara..."
      />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#ff7700" />
        </View>
      ) : filtered ? (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item._id)}
          renderItem={renderSearchItem}
          ListEmptyComponent={
            <View className="items-center py-10">
              <Text className="text-text-muted">Kategori bulunamadı</Text>
            </View>
          }
        />
      ) : (
        <ScrollView>
          {tree.map((node) => (
            <CategoryRow
              key={String(node._id)}
              node={node}
              depth={0}
              selected={selected}
              onToggle={toggleCategory}
              expanded={expanded}
              onExpand={toggleExpand}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function BrandView({ selected, onBack, onChange }) {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(selected);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axiosInstance
      .get("/products/brands")
      .then((res) => setBrands(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return brands;
    const q = search.toLowerCase();
    return brands.filter((b) => b.name.toLowerCase().includes(q));
  }, [search, brands]);

  const toggle = useCallback(
    (brandName) =>
      setPending((prev) =>
        prev.includes(brandName)
          ? prev.filter((b) => b !== brandName)
          : [...prev, brandName],
      ),
    [],
  );

  const renderBrandItem = useCallback(
    ({ item }) => {
      const isSelected = pending.includes(item.name);
      return (
        <TouchableOpacity
          className="flex-row items-center gap-3 px-5 py-3.5 border-b border-border-subtle"
          onPress={() => toggle(item.name)}
          activeOpacity={0.7}
        >
          <Checkbox selected={isSelected} />
          <View className="flex-row items-center gap-2 flex-1">
            <Text
              className={`text-base ${isSelected ? "text-primary font-semibold" : "text-text-primary"}`}
            >
              {item.name}
            </Text>
            <Text className="text-sm text-text-muted">({item.count})</Text>
          </View>
        </TouchableOpacity>
      );
    },
    [pending, toggle],
  );

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <ModalHeader
        onBack={onBack}
        title="Markalar"
        right={
          pending.length > 0 ? (
            <TouchableOpacity onPress={() => setPending([])}>
              <Text className="text-primary font-semibold text-sm">
                TEMİZLE
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Marka ara..."
      />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#ff7700" />
        </View>
      ) : (
        <>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.name}
            renderItem={renderBrandItem}
            ListEmptyComponent={
              <View className="items-center py-10">
                <Text className="text-text-muted">Marka bulunamadı</Text>
              </View>
            }
          />
          <View className="px-5 py-4">
            <TouchableOpacity
              className="bg-brand-red rounded-sm py-4 flex-row items-center justify-center gap-2"
              onPress={() => {
                onChange(pending);
                onBack();
              }}
              activeOpacity={0.85}
            >
              <Text className="text-white font-bold text-base">Uygula</Text>
              <Ionicons name="arrow-forward" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

function PriceView({ minPrice, maxPrice, onBack, onChange }) {
  const [min, setMin] = useState(minPrice);
  const [max, setMax] = useState(maxPrice);

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <ModalHeader onBack={onBack} title="Fiyat Aralığı" right={null} />
      <View className="px-5 pt-8">
        <View className="flex-row items-center gap-3">
          <TextInput
            className="flex-1 border border-border-input rounded-lg px-4 py-3 text-base text-text-primary"
            placeholder="En Az"
            placeholderTextColor="#adb5bd"
            keyboardType="numeric"
            value={min}
            onChangeText={setMin}
          />
          <Text className="text-text-muted text-lg">—</Text>
          <TextInput
            className="flex-1 border border-border-input rounded-lg px-4 py-3 text-base text-text-primary"
            placeholder="En Çok"
            placeholderTextColor="#adb5bd"
            keyboardType="numeric"
            value={max}
            onChangeText={setMax}
          />
        </View>
        <TouchableOpacity
          className="bg-brand-red rounded-sm py-4 mt-8 flex-row items-center justify-center gap-2"
          onPress={() => {
            onChange(min, max);
            onBack();
          }}
          activeOpacity={0.85}
        >
          <Text className="text-white font-bold text-base">Uygula</Text>
          <Ionicons name="arrow-forward" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function FilterModal({
  visible,
  onClose,
  onApply,
  initialFilter = {},
}) {
  const insets = useSafeAreaInsets();
  const [view, setView] = useState("main");
  const [categories, setCategories] = useState(initialFilter.categories ?? []);
  const [brands, setBrands] = useState(initialFilter.brands ?? []);
  const [minPrice, setMinPrice] = useState(initialFilter.minPrice ?? "");
  const [maxPrice, setMaxPrice] = useState(initialFilter.maxPrice ?? "");

  useEffect(() => {
    if (visible) {
      setView("main");
      setCategories(initialFilter.categories ?? []);
      setBrands(initialFilter.brands ?? []);
      setMinPrice(initialFilter.minPrice ?? "");
      setMaxPrice(initialFilter.maxPrice ?? "");
    }
  }, [visible]);

  const activeCount =
    categories.length + brands.length + (minPrice || maxPrice ? 1 : 0);

  const MainView = (
    <View style={{ flex: 1, backgroundColor: "white", paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <View className="flex-row items-center px-5 py-4 border-b border-border-subtle">
        <TouchableOpacity onPress={onClose} hitSlop={8}>
          <Ionicons name="close" size={22} color="#212529" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-text-primary">
          Filtrele{" "}
          {activeCount > 0 && (
            <Text className="text-primary">({activeCount})</Text>
          )}
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <View className="px-5">
        <TouchableOpacity
          className="flex-row items-center py-4 border-b border-border-subtle gap-3"
          onPress={() => setView("category")}
          activeOpacity={1.0}
        >
          <Text className="text-base text-text-primary font-medium w-16">
            Kategori
          </Text>
          <View className="flex-1 flex-row flex-wrap gap-1.5">
            {categories.map((c) => (
              <Chip
                key={c._id}
                label={c.name}
                onRemove={() =>
                  setCategories((prev) => prev.filter((x) => x._id !== c._id))
                }
              />
            ))}
          </View>
          <Ionicons name="chevron-forward" size={18} color="#adb5bd" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center py-4 border-b border-border-subtle gap-3"
          onPress={() => setView("brand")}
          activeOpacity={0.7}
        >
          <Text className="text-base text-text-primary font-medium w-16">
            Marka
          </Text>
          <View className="flex-1 flex-row flex-wrap gap-1.5">
            {brands.map((b) => (
              <Chip
                key={b}
                label={b}
                onRemove={() =>
                  setBrands((prev) => prev.filter((x) => x !== b))
                }
              />
            ))}
          </View>
          <Ionicons name="chevron-forward" size={18} color="#adb5bd" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center py-4 border-b border-border-subtle gap-3"
          onPress={() => setView("price")}
          activeOpacity={0.7}
        >
          <Text className="text-base text-text-primary font-medium w-16">
            Fiyat
          </Text>
          <View className="flex-1 flex-row flex-wrap gap-1.5">
            {(minPrice || maxPrice) && (
              <Chip
                label={`${minPrice || "0"}₺ - ${maxPrice || "∞"}₺`}
                onRemove={() => {
                  setMinPrice("");
                  setMaxPrice("");
                }}
              />
            )}
          </View>
          <Ionicons name="chevron-forward" size={18} color="#adb5bd" />
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-brand-red rounded-md py-4 mt-6 flex-row items-center justify-center gap-2"
          onPress={() => onApply({ categories, brands, minPrice, maxPrice })}
          activeOpacity={0.85}
        >
          <Text className="text-white font-bold text-base">Ürüne Git</Text>
          <Ionicons name="arrow-forward" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => (view !== "main" ? setView("main") : onClose())}
      statusBarTranslucent
    >
      {view === "main" ? (
        MainView
      ) : (
        <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: "white" }}>
          {view === "category" && (
            <CategoryView
              selected={categories}
              onBack={() => setView("main")}
              onChange={setCategories}
            />
          )}
          {view === "brand" && (
            <BrandView
              selected={brands}
              onBack={() => setView("main")}
              onChange={setBrands}
            />
          )}
          {view === "price" && (
            <PriceView
              minPrice={minPrice}
              maxPrice={maxPrice}
              onBack={() => setView("main")}
              onChange={(min, max) => {
                setMinPrice(min);
                setMaxPrice(max);
              }}
            />
          )}
        </View>
      )}
    </Modal>
  );
}
