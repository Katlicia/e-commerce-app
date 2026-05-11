import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import {
  getUserQuestions,
  deleteUserQuestion,
} from "@mobile/shared/redux/questionSlice";
import ScreenHeader from "../components/ScreenHeader";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function QuestionCard({ item, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const productImg = item.product?.images?.[0]?.url;

  return (
    <View className="mx-4 mb-3 rounded-xl border border-border-subtle bg-white overflow-hidden">
      <View className="flex-row items-start gap-3 p-3">
        {productImg ? (
          <Image
            source={{ uri: productImg }}
            style={{
              width: 52,
              height: 52,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#f0f0f0",
            }}
            resizeMode="contain"
          />
        ) : (
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 8,
              backgroundColor: "#f5f5f5",
            }}
            className="items-center justify-center"
          >
            <Ionicons name="cube-outline" size={24} color="#adb5bd" />
          </View>
        )}

        <View style={{ flex: 1 }}>
          {item.product?.name && (
            <Text
              className="text-sm font-sans-semibold text-text-primary mb-1"
              numberOfLines={2}
            >
              {item.product.name}
            </Text>
          )}
          <Text className="text-sm text-text-secondary" numberOfLines={3}>
            <Text className="font-sans-semibold text-text-primary">S: </Text>
            {item.question}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={18} color="#adb5bd" />
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center gap-2 px-3 pb-3">
        <Text className="text-xs text-text-muted">
          {formatDate(item.createdAt)}
        </Text>

        <View
          style={{
            backgroundColor: item.isAnswered ? "#d1e7dd" : "#fff3cd",
            borderRadius: 20,
            paddingHorizontal: 10,
            paddingVertical: 2,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              color: item.isAnswered ? "#0f5132" : "#856404",
            }}
          >
            {item.isAnswered ? "Cevaplandı" : "Beklemede"}
          </Text>
        </View>

        {item.answers?.length > 0 && (
          <TouchableOpacity
            onPress={() => setExpanded((v) => !v)}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Text style={{ fontSize: 12, color: "#F83B0A", fontWeight: "600" }}>
              {expanded ? "Gizle" : `${item.answers.length} Cevap`}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {expanded && item.answers?.length > 0 && (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: "#f0f0f0",
            borderLeftWidth: 3,
            borderLeftColor: "#e5e8ec",
          }}
          className="mx-3 mb-3 pl-3 pt-2 gap-2"
        >
          {item.answers.map((a) => (
            <View key={a._id} className="mb-1">
              <Text className="text-sm text-text-secondary">
                <Text
                  style={{
                    fontWeight: "600",
                    color: a.isAdmin ? "#F83B0A" : "#212529",
                  }}
                >
                  {a.isAdmin ? "Mağaza" : `${a.name} ${a.surname}`}:{" "}
                </Text>
                {a.answer}
              </Text>
              <Text className="text-xs text-text-muted mt-0.5">
                {formatDate(a.createdAt)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function QuestionsScreen({ navigation }) {
  const dispatch = useDispatch();
  const { questions = [], loading = false } = useSelector(
    (state) => state.question ?? {},
  );

  useEffect(() => {
    dispatch(getUserQuestions());
  }, []);

  const handleDelete = (productId, questionId) => {
    Alert.alert("Soruyu Sil", "Bu soruyu silmek istediğinize emin misiniz?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: () => dispatch(deleteUserQuestion({ productId, questionId })),
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-light" edges={["top"]}>
      <ScreenHeader title="Soru Cevap" />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F83B0A" />
        </View>
      ) : questions.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <Ionicons name="help-circle-outline" size={52} color="#dee2e6" />
          <Text className="text-text-muted text-sm text-center">
            Henüz soru sormadınız. Ürün sayfasından soru sorabilirsiniz.
          </Text>
        </View>
      ) : (
        <FlatList
          data={questions}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <QuestionCard
              item={item}
              onDelete={() => handleDelete(item.product?._id, item._id)}
            />
          )}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
