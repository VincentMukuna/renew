import { useCallback, useState } from "react";

import { Alert, ScrollView, Text, TextInput, View } from "react-native";

import { Stack } from "expo-router";

import { Check, Pencil, Trash2, X } from "lucide-react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { PressableScale } from "@/components/shared/pressable-scale";
import {
  useArchiveCategory,
  useCreateCategory,
  useRenameCategory,
} from "@/features/subscriptions/hooks/use-category-mutations";
import { useCategories } from "@/features/subscriptions/hooks/use-categories";
import { selectionChange } from "@/lib/haptics";

const DEFAULT_CATEGORY_EMOJI = "📦";

function normalizeEmoji(value: string): string {
  return value.trim() || DEFAULT_CATEGORY_EMOJI;
}

export function CategoriesScreen() {
  const { theme } = useUnistyles();
  const { data: categories = [] } = useCategories();
  const createCategory = useCreateCategory();
  const renameCategory = useRenameCategory();
  const archiveCategory = useArchiveCategory();
  const [emoji, setEmoji] = useState(DEFAULT_CATEGORY_EMOJI);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingEmoji, setEditingEmoji] = useState(DEFAULT_CATEGORY_EMOJI);
  const [editingName, setEditingName] = useState("");

  const handleCreate = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) return;
    createCategory.mutate(
      { emoji: normalizeEmoji(emoji), name: trimmed },
      {
        onSuccess: () => {
          setEmoji(DEFAULT_CATEGORY_EMOJI);
          setName("");
        },
      },
    );
  }, [createCategory, emoji, name]);

  const handleRename = useCallback(() => {
    if (!editingId || !editingName.trim()) return;
    renameCategory.mutate(
      { id: editingId, emoji: normalizeEmoji(editingEmoji), name: editingName.trim() },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditingEmoji(DEFAULT_CATEGORY_EMOJI);
          setEditingName("");
        },
      },
    );
  }, [editingEmoji, editingId, editingName, renameCategory]);

  const cancelEdit = useCallback(() => {
    selectionChange();
    setEditingId(null);
    setEditingEmoji(DEFAULT_CATEGORY_EMOJI);
    setEditingName("");
  }, []);

  const confirmArchive = useCallback(
    (id: string, categoryName: string) => {
      Alert.alert("Archive category?", `Archive ${categoryName} if it is unused.`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          style: "destructive",
          onPress: () => archiveCategory.mutate(id),
        },
      ]);
    },
    [archiveCategory],
  );

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ title: "Categories" }} />
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>New category</Text>
        <View style={styles.createCard}>
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
          <TextInput
            autoCapitalize="words"
            autoCorrect={false}
            onChangeText={setName}
            onSubmitEditing={handleCreate}
            placeholder="Category name"
            placeholderTextColor={theme.colors.placeholder}
            returnKeyType="done"
            style={styles.input}
            value={name}
          />
          <PressableScale onPress={handleCreate} style={styles.action}>
            <Text style={styles.actionText}>Add</Text>
          </PressableScale>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.listCard}>
          {categories.map((category, index) => {
            const editing = editingId === category.id;
            return (
              <View key={category.id} style={[styles.row, index > 0 && styles.rowBorder]}>
                {editing ? (
                  <>
                    <TextInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      maxLength={4}
                      onChangeText={setEditingEmoji}
                      placeholder={DEFAULT_CATEGORY_EMOJI}
                      placeholderTextColor={theme.colors.placeholder}
                      returnKeyType="next"
                      style={styles.editEmojiInput}
                      value={editingEmoji}
                    />
                    <TextInput
                      autoCapitalize="words"
                      autoCorrect={false}
                      onChangeText={setEditingName}
                      onSubmitEditing={handleRename}
                      placeholder="Category name"
                      placeholderTextColor={theme.colors.placeholder}
                      returnKeyType="done"
                      style={styles.rowInput}
                      value={editingName}
                    />
                    <PressableScale hitSlop={8} onPress={cancelEdit} scaleTo={0.9}>
                      <X color={theme.colors.muted} size={17} strokeWidth={2} />
                    </PressableScale>
                    <PressableScale onPress={handleRename} style={styles.iconAction}>
                      <Check color={theme.colors.primaryForeground} size={16} strokeWidth={2.5} />
                    </PressableScale>
                  </>
                ) : (
                  <>
                    <PressableScale
                      onPress={() => {
                        selectionChange();
                        setEditingId(category.id);
                        setEditingEmoji(category.emoji);
                        setEditingName(category.name);
                      }}
                      style={styles.rowMain}
                    >
                      <View style={styles.categoryIcon}>
                        <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                      </View>
                      <View style={styles.rowCopy}>
                        <Text style={styles.rowLabel}>{category.name}</Text>
                        <Text style={styles.rowHint}>Shown on subscription forms and lists</Text>
                      </View>
                    </PressableScale>
                    <PressableScale
                      hitSlop={8}
                      onPress={() => {
                        selectionChange();
                        setEditingId(category.id);
                        setEditingEmoji(category.emoji);
                        setEditingName(category.name);
                      }}
                      scaleTo={0.9}
                    >
                      <Pencil color={theme.colors.iconMuted} size={16} strokeWidth={2} />
                    </PressableScale>
                    <PressableScale
                      hitSlop={8}
                      onPress={() => confirmArchive(category.id, category.name)}
                      scaleTo={0.9}
                    >
                      <Trash2 color={theme.colors.iconMuted} size={16} strokeWidth={2} />
                    </PressableScale>
                  </>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    gap: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.muted,
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
  createCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    padding: 0,
  },
  emojiInput: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    textAlign: "center",
    fontSize: 20,
    color: theme.colors.text,
  },
  action: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primaryForeground,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  rowMain: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  categoryIcon: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.name === "dark" ? "#1E2A5F" : "#EEF2FF",
  },
  categoryEmoji: {
    fontSize: 18,
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.text,
  },
  rowHint: {
    fontSize: 12,
    color: theme.colors.muted,
    marginTop: 2,
  },
  editEmojiInput: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    textAlign: "center",
    fontSize: 18,
    color: theme.colors.text,
  },
  rowInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    padding: 0,
  },
  iconAction: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
  },
}));
