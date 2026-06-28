import { useCallback, useLayoutEffect, useState } from "react";

import { ScrollView, Text, TextInput, View } from "react-native";

import { router, useNavigation } from "expo-router";

import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { HeaderSaveButton } from "@/components/navigation/header-save-button";
import { useCreateCategory } from "@/features/subscriptions/hooks/use-category-mutations";

const DEFAULT_CATEGORY_EMOJI = "📦";

function normalizeEmoji(value: string): string {
  return value.trim() || DEFAULT_CATEGORY_EMOJI;
}

function closeAddCategory() {
  if (router.canGoBack()) {
    router.back();
  }
}

export function AddCategoryScreen() {
  const { theme } = useUnistyles();
  const navigation = useNavigation();
  const createCategory = useCreateCategory();
  const [emoji, setEmoji] = useState(DEFAULT_CATEGORY_EMOJI);
  const [name, setName] = useState("");
  const trimmedName = name.trim();
  const canSave = trimmedName.length > 0 && !createCategory.isPending;

  const handleSave = useCallback(() => {
    if (!canSave) {
      return;
    }

    createCategory.mutate(
      {
        emoji: normalizeEmoji(emoji),
        name: trimmedName,
      },
      {
        onSuccess: closeAddCategory,
      },
    );
  }, [canSave, createCategory, emoji, trimmedName]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderSaveButton
          disabled={!canSave}
          label={createCategory.isPending ? "Saving…" : "Save"}
          onPress={handleSave}
        />
      ),
    });
  }, [canSave, createCategory.isPending, handleSave, navigation]);

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Details</Text>
        <View style={styles.fieldsRow}>
          <View style={styles.emojiField}>
            <Text style={styles.fieldLabel}>Emoji</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={4}
              onChangeText={setEmoji}
              placeholder={DEFAULT_CATEGORY_EMOJI}
              placeholderTextColor={theme.colors.placeholder}
              returnKeyType="next"
              style={styles.emojiInput}
              value={emoji}
            />
          </View>
          <View style={styles.nameField}>
            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              autoCapitalize="words"
              autoCorrect={false}
              autoFocus
              onChangeText={setName}
              onSubmitEditing={handleSave}
              placeholder="Category name"
              placeholderTextColor={theme.colors.placeholder}
              returnKeyType="done"
              style={styles.nameInput}
              value={name}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: theme.name === "light" ? 0.025 : 0.05,
    shadowRadius: theme.name === "light" ? 1.5 : 2,
    elevation: theme.name === "light" ? 0 : 1,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.primary,
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
  fieldsRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 14,
  },
  emojiField: {
    width: 76,
  },
  nameField: {
    flex: 1,
    minWidth: 0,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  emojiInput: {
    fontSize: 26,
    color: theme.colors.text,
    paddingVertical: 6,
  },
  nameInput: {
    fontSize: 16,
    color: theme.colors.text,
    paddingVertical: 8,
  },
}));
