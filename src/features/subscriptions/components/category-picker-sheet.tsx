import {
  type ComponentType,
  type ReactNode,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { Platform, Text, type TextInput, View } from "react-native";

import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetTextInput,
  useBottomSheetScrollableCreator,
} from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { Check, Search } from "lucide-react-native";
import { FullWindowOverlay } from "react-native-screens";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { PressableScale } from "@/components/shared/pressable-scale";
import { selectionChange } from "@/lib/haptics";
import type { Category } from "@/types";

const SHEET_CONTAINER = (Platform.OS === "ios" ? FullWindowOverlay : undefined) as
  ComponentType<{ children?: ReactNode }> | undefined;

function normalizeCategoryQuery(value: string): string {
  return value.trim().toLowerCase();
}

export type CategoryPickerSheetRef = {
  present: () => void;
  dismiss: () => void;
};

type CategoryPickerSheetProps = {
  categories: Category[];
  selectedCategoryId?: string;
  onSelect: (category: Category) => void;
};

export const CategoryPickerSheet = forwardRef<CategoryPickerSheetRef, CategoryPickerSheetProps>(
  ({ categories, selectedCategoryId, onSelect }, ref) => {
    const { theme } = useUnistyles();
    const sheetRef = useRef<BottomSheetModal>(null);
    const inputRef = useRef<TextInput>(null);
    const [query, setQuery] = useState("");
    const snapPoints = useMemo(() => ["90%"], []);
    const renderScrollComponent = useBottomSheetScrollableCreator();

    useImperativeHandle(
      ref,
      () => ({
        present: () => sheetRef.current?.present(),
        dismiss: () => sheetRef.current?.dismiss(),
      }),
      [],
    );

    const trimmed = query.trim();
    const normalizedQuery = normalizeCategoryQuery(query);

    const filtered = useMemo(() => {
      if (normalizedQuery.length === 0) {
        return categories;
      }

      return categories.filter((category) =>
        normalizeCategoryQuery(`${category.emoji} ${category.name}`).includes(normalizedQuery),
      );
    }, [categories, normalizedQuery]);

    const exactMatch = useMemo(() => {
      if (normalizedQuery.length === 0) {
        return undefined;
      }

      return categories.find(
        (category) => normalizeCategoryQuery(category.name) === normalizedQuery,
      );
    }, [categories, normalizedQuery]);

    const close = useCallback(() => {
      sheetRef.current?.dismiss();
    }, []);

    const selectCategory = useCallback(
      (category: Category) => {
        selectionChange();
        onSelect(category);
        close();
      },
      [onSelect, close],
    );

    const handleSubmit = useCallback(() => {
      if (exactMatch) {
        selectCategory(exactMatch);
      }
    }, [exactMatch, selectCategory]);

    const handleSheetChange = useCallback((index: number) => {
      if (index >= 0) {
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    }, []);

    const handleDismiss = useCallback(() => {
      setQuery("");
    }, []);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
        />
      ),
      [],
    );

    const renderItem = useCallback(
      ({ item }: { item: Category }) => (
        <CategoryRow
          category={item}
          isExactMatch={item.id === exactMatch?.id}
          isSelected={item.id === selectedCategoryId}
          onPress={() => selectCategory(item)}
        />
      ),
      [exactMatch?.id, selectCategory, selectedCategoryId],
    );

    const keyExtractor = useCallback((item: Category) => item.id, []);

    const listEmpty = useMemo(() => {
      if (trimmed.length > 0) {
        return (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No categories match “{trimmed}”.</Text>
          </View>
        );
      }

      return (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Start typing to search categories.</Text>
        </View>
      );
    }, [trimmed]);

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backdropComponent={renderBackdrop}
        containerComponent={SHEET_CONTAINER}
        onChange={handleSheetChange}
        onDismiss={handleDismiss}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.sheetBackground}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Category</Text>
        </View>
        <View style={styles.searchWrap}>
          <Search color={theme.colors.muted} size={18} strokeWidth={1.75} />
          <BottomSheetTextInput
            ref={inputRef as never}
            autoCapitalize="words"
            autoCorrect={false}
            onChangeText={setQuery}
            onSubmitEditing={handleSubmit}
            placeholder="Search categories"
            placeholderTextColor={theme.colors.placeholder}
            returnKeyType="done"
            style={styles.searchInput}
            submitBehavior="submit"
            value={query}
          />
        </View>
        <FlashList
          data={filtered}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListEmptyComponent={listEmpty}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          renderScrollComponent={renderScrollComponent}
        />
      </BottomSheetModal>
    );
  },
);

CategoryPickerSheet.displayName = "CategoryPickerSheet";

type CategoryRowProps = {
  category: Category;
  isExactMatch: boolean;
  isSelected: boolean;
  onPress: () => void;
};

function CategoryRow({ category, isExactMatch, isSelected, onPress }: CategoryRowProps) {
  const { theme } = useUnistyles();
  const highlighted = isExactMatch || isSelected;

  return (
    <PressableScale onPress={onPress} style={[styles.row, highlighted && styles.rowMatch]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{category.emoji}</Text>
      </View>
      <View style={styles.rowBody}>
        <Text numberOfLines={1} style={styles.rowName}>
          {category.name}
        </Text>
      </View>
      {highlighted ? <Check color={theme.colors.primary} size={18} strokeWidth={2.25} /> : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create((theme) => ({
  sheetBackground: {
    backgroundColor: theme.colors.sheet,
  },
  handle: {
    backgroundColor: theme.colors.sheetHandle,
    width: 36,
  },
  headerRow: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  title: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.muted,
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    padding: 0,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  rowMatch: {
    backgroundColor: theme.colors.selected,
    borderWidth: 1,
    borderColor: theme.colors.selectedBorder,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceMuted,
  },
  avatarText: {
    fontSize: 18,
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
  },
  rowName: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
  empty: {
    paddingTop: 40,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    color: theme.colors.mutedLight,
    textAlign: "center",
    lineHeight: 19,
  },
}));
