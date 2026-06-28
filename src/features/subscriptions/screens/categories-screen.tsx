import { useCallback, useState } from "react";

import { Alert, ScrollView, Text, TextInput, View } from "react-native";

import { Stack } from "expo-router";

import { Trash2 } from "lucide-react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { PressableScale } from "@/components/shared/pressable-scale";
import {
  useArchiveCategory,
  useCreateCategory,
  useRenameCategory,
} from "@/features/subscriptions/hooks/use-category-mutations";
import { useCategories } from "@/features/subscriptions/hooks/use-categories";

export function CategoriesScreen() {
  const { theme } = useUnistyles();
  const { data: categories = [] } = useCategories();
  const createCategory = useCreateCategory();
  const renameCategory = useRenameCategory();
  const archiveCategory = useArchiveCategory();
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleCreate = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) return;
    createCategory.mutate(trimmed, { onSuccess: () => setName("") });
  }, [createCategory, name]);

  const handleRename = useCallback(() => {
    if (!editingId || !editingName.trim()) return;
    renameCategory.mutate(
      { id: editingId, name: editingName.trim() },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditingName("");
        },
      },
    );
  }, [editingId, editingName, renameCategory]);

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
        <View style={styles.card}>
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
                    <PressableScale onPress={handleRename} style={styles.smallAction}>
                      <Text style={styles.smallActionText}>Save</Text>
                    </PressableScale>
                  </>
                ) : (
                  <>
                    <PressableScale
                      onPress={() => {
                        setEditingId(category.id);
                        setEditingName(category.name);
                      }}
                      style={styles.rowMain}
                    >
                      <Text style={styles.rowLabel}>{category.name}</Text>
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
  card: {
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
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.text,
  },
  rowInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    padding: 0,
  },
  smallAction: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
  },
  smallActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary,
  },
}));
