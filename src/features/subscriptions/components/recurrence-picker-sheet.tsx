import {
  type ComponentType,
  type ReactNode,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";

import { Platform, Text, View } from "react-native";

import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  useBottomSheetScrollableCreator,
} from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { Check } from "lucide-react-native";
import { FullWindowOverlay } from "react-native-screens";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { PressableScale } from "@/components/shared/pressable-scale";
import { RECURRENCE_OPTIONS } from "@/features/subscriptions/lib/recurrence";
import { selectionChange } from "@/lib/haptics";
import type { Recurrence } from "@/types";

const SHEET_CONTAINER = (Platform.OS === "ios" ? FullWindowOverlay : undefined) as
  ComponentType<{ children?: ReactNode }> | undefined;

export type RecurrencePickerSheetRef = {
  present: () => void;
  dismiss: () => void;
};

type RecurrencePickerSheetProps = {
  selectedRecurrence?: Recurrence;
  onSelect: (recurrence: Recurrence) => void;
};

export const RecurrencePickerSheet = forwardRef<
  RecurrencePickerSheetRef,
  RecurrencePickerSheetProps
>(({ selectedRecurrence, onSelect }, ref) => {
  const { theme } = useUnistyles();
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["50%"], []);
  const renderScrollComponent = useBottomSheetScrollableCreator();

  useImperativeHandle(
    ref,
    () => ({
      present: () => sheetRef.current?.present(),
      dismiss: () => sheetRef.current?.dismiss(),
    }),
    [],
  );

  const close = useCallback(() => {
    sheetRef.current?.dismiss();
  }, []);

  const handleSelect = useCallback(
    (recurrence: Recurrence) => {
      selectionChange();
      onSelect(recurrence);
      close();
    },
    [onSelect, close],
  );

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
    ({ item }: { item: (typeof RECURRENCE_OPTIONS)[number] }) => {
      const selected = item.value === selectedRecurrence;

      return (
        <PressableScale
          onPress={() => handleSelect(item.value)}
          style={[styles.row, selected && styles.rowMatch]}
        >
          <Text numberOfLines={1} style={styles.rowName}>
            {item.label}
          </Text>
          {selected ? <Check color={theme.colors.primary} size={18} strokeWidth={2.25} /> : null}
        </PressableScale>
      );
    },
    [handleSelect, selectedRecurrence, theme.colors.primary],
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      containerComponent={SHEET_CONTAINER}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.sheetBackground}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>Recurrence</Text>
      </View>
      <FlashList
        data={RECURRENCE_OPTIONS}
        keyExtractor={(item) => item.value}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        renderScrollComponent={renderScrollComponent}
      />
    </BottomSheetModal>
  );
});

RecurrencePickerSheet.displayName = "RecurrencePickerSheet";

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
    paddingBottom: 12,
  },
  title: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.muted,
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  rowMatch: {
    backgroundColor: theme.colors.selected,
    borderWidth: 1,
    borderColor: theme.colors.selectedBorder,
  },
  rowName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
}));
