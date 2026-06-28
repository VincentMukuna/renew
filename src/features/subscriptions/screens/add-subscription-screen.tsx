import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

import { ScrollView, Switch, Text, TextInput, View } from "react-native";

import { router, useLocalSearchParams, useNavigation } from "expo-router";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, ChevronRight, X } from "lucide-react-native";
import { Controller, useForm, useWatch } from "react-hook-form";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { HeaderSaveButton } from "@/components/navigation/header-save-button";
import { PressableScale } from "@/components/shared/pressable-scale";
import { completeOnboarding } from "@/features/onboarding/lib/onboarding-storage";
import { useSettingsStore } from "@/features/settings/hooks/use-settings-store";
import {
  CategoryPickerSheet,
  type CategoryPickerSheetRef,
} from "@/features/subscriptions/components/category-picker-sheet";
import {
  RecurrencePickerSheet,
  type RecurrencePickerSheetRef,
} from "@/features/subscriptions/components/recurrence-picker-sheet";
import { StartDatePickerModal } from "@/features/subscriptions/components/start-date-picker-modal";
import { useAddSubscription } from "@/features/subscriptions/hooks/use-add-subscription";
import { useCategories } from "@/features/subscriptions/hooks/use-categories";
import { formatStartDate, resolveQuickDate } from "@/features/subscriptions/lib/format-dates";
import { recurrenceLabels } from "@/features/subscriptions/lib/recurrence";
import {
  type AddSubscriptionFormValues,
  addSubscriptionSchema,
  formValuesToCreateInput,
} from "@/features/subscriptions/schemas/subscription-schemas";
import { selectionChange } from "@/lib/haptics";
import { HOME_ROUTE } from "@/lib/navigation/routes";
import { formatCurrencyPrefix } from "@/lib/utils/formatters";

const QUICK_DATES = ["Today", "Tomorrow", "Friday", "Next week"];

const defaultValues: AddSubscriptionFormValues = {
  name: "",
  categoryId: "",
  planName: "",
  cost: "",
  startDate: resolveQuickDate("Today"),
  recurrence: "monthly",
  isActive: true,
};

function exitAddSubscription() {
  if (router.canGoBack()) {
    router.back();
  }
}

export function AddSubscriptionScreen() {
  const { theme } = useUnistyles();
  const navigation = useNavigation();
  const { categoryId: presetCategoryId, from } = useLocalSearchParams<{
    categoryId?: string;
    from?: string;
  }>();
  const fromOnboarding = from === "onboarding";
  const addSubscription = useAddSubscription();
  const { data: categories = [] } = useCategories();
  const defaultCurrency = useSettingsStore((state) => state.defaultCurrency);

  const categoryPickerRef = useRef<CategoryPickerSheetRef>(null);
  const recurrencePickerRef = useRef<RecurrencePickerSheetRef>(null);
  const planRef = useRef<TextInput>(null);

  const [quickDate, setQuickDate] = useState<string | null>("Today");
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isValid },
  } = useForm<AddSubscriptionFormValues>({
    resolver: zodResolver(addSubscriptionSchema),
    defaultValues: {
      ...defaultValues,
      categoryId: typeof presetCategoryId === "string" ? presetCategoryId : "",
    },
    mode: "onChange",
  });

  const categoryId = useWatch({ control, name: "categoryId" });
  const recurrence = useWatch({ control, name: "recurrence" });

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === categoryId),
    [categories, categoryId],
  );

  const openCategoryPicker = useCallback(() => {
    selectionChange();
    categoryPickerRef.current?.present();
  }, []);

  const clearCategory = useCallback(() => {
    selectionChange();
    setValue("categoryId", "", { shouldValidate: true });
  }, [setValue]);

  const openRecurrencePicker = useCallback(() => {
    selectionChange();
    recurrencePickerRef.current?.present();
  }, []);

  const onSubmit = useCallback(
    (values: AddSubscriptionFormValues) => {
      addSubscription.mutate(formValuesToCreateInput(values), {
        onSuccess: async () => {
          if (fromOnboarding) {
            await completeOnboarding();
            router.dismissTo(HOME_ROUTE);
            return;
          }

          exitAddSubscription();
        },
      });
    },
    [addSubscription, fromOnboarding],
  );

  const handleSave = useCallback(() => {
    void handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderSaveButton
          disabled={!isValid || addSubscription.isPending}
          label={addSubscription.isPending ? "Saving…" : "Save"}
          onPress={handleSave}
        />
      ),
    });
  }, [addSubscription.isPending, handleSave, isValid, navigation]);

  return (
    <BottomSheetModalProvider>
      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Field label="Name">
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                autoCapitalize="words"
                autoCorrect={false}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="e.g. Netflix, Spotify, iCloud"
                placeholderTextColor={theme.colors.placeholder}
                style={styles.input}
                value={value}
              />
            )}
          />
        </Field>

        <Field label="Category">
          <Controller
            control={control}
            name="categoryId"
            render={() =>
              selectedCategory ? (
                <View style={styles.categoryChip}>
                  <PressableScale onPress={openCategoryPicker} style={styles.categoryChipMain}>
                    <View style={styles.categoryAvatar}>
                      <Text style={styles.categoryAvatarText}>{selectedCategory.emoji}</Text>
                    </View>
                    <Text numberOfLines={1} style={styles.categoryChipName}>
                      {selectedCategory.name}
                    </Text>
                  </PressableScale>
                  <PressableScale
                    hitSlop={8}
                    onPress={clearCategory}
                    style={styles.categoryClear}
                    scaleTo={0.9}
                  >
                    <X color={theme.colors.muted} size={18} strokeWidth={2} />
                  </PressableScale>
                </View>
              ) : (
                <PressableScale onPress={openCategoryPicker} style={styles.pickerField}>
                  <Text style={styles.pickerPlaceholder}>Choose a category</Text>
                  <ChevronRight color={theme.colors.placeholder} size={18} strokeWidth={2} />
                </PressableScale>
              )
            }
          />
        </Field>

        <Field label="Plan">
          <Controller
            control={control}
            name="planName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                ref={planRef}
                autoCapitalize="words"
                autoCorrect={false}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="e.g. Standard, Pro, Family"
                placeholderTextColor={theme.colors.placeholder}
                style={styles.input}
                value={value}
              />
            )}
          />
        </Field>

        <Field label="Cost">
          <Controller
            control={control}
            name="cost"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <Text style={styles.prefix}>{formatCurrencyPrefix(defaultCurrency)}</Text>
                <TextInput
                  keyboardType="number-pad"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="0"
                  placeholderTextColor={theme.colors.sheetHandle}
                  style={[styles.input, styles.amountInput]}
                  value={value}
                />
              </View>
            )}
          />
        </Field>

        <Field
          bare
          footer={
            <View style={styles.chips}>
              {QUICK_DATES.map((label) => {
                const selected = quickDate === label;

                return (
                  <PressableScale
                    key={label}
                    onPress={() => {
                      selectionChange();
                      setQuickDate(label);
                      setValue("startDate", resolveQuickDate(label), { shouldValidate: true });
                    }}
                    style={[styles.chip, selected && styles.chipSelected]}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                      {label}
                    </Text>
                  </PressableScale>
                );
              })}
            </View>
          }
          label="Start date"
        >
          <Controller
            control={control}
            name="startDate"
            render={({ field: { value, onChange } }) => (
              <>
                <PressableScale
                  onPress={() => {
                    selectionChange();
                    setDatePickerOpen(true);
                  }}
                  style={styles.dateField}
                >
                  <Calendar color={theme.colors.muted} size={16} strokeWidth={1.5} />
                  <Text style={styles.dateFieldText}>{formatStartDate(value)}</Text>
                </PressableScale>
                <StartDatePickerModal
                  onClose={() => setDatePickerOpen(false)}
                  onSave={(isoDate) => {
                    onChange(isoDate);
                    setQuickDate(null);
                  }}
                  value={value}
                  visible={datePickerOpen}
                />
              </>
            )}
          />
        </Field>

        <Field label="Recurrence">
          <Controller
            control={control}
            name="recurrence"
            render={() => (
              <PressableScale onPress={openRecurrencePicker} style={styles.pickerField}>
                <Text style={styles.pickerValue}>{recurrenceLabels[recurrence]}</Text>
                <ChevronRight color={theme.colors.placeholder} size={18} strokeWidth={2} />
              </PressableScale>
            )}
          />
        </Field>

        <Section title="Preferences">
          <Controller
            control={control}
            name="isActive"
            render={({ field: { value, onChange } }) => (
              <View style={styles.prefRow}>
                <View style={styles.prefCopy}>
                  <Text style={styles.prefTitle}>Active</Text>
                  <Text style={styles.prefSub}>
                    Include in spending metrics and renewal tracking
                  </Text>
                </View>
                <Switch
                  onValueChange={(nextValue) => {
                    selectionChange();
                    onChange(nextValue);
                  }}
                  thumbColor={theme.colors.primaryForeground}
                  trackColor={{ false: theme.colors.switchTrackOff, true: theme.colors.primary }}
                  value={value}
                />
              </View>
            )}
          />
        </Section>
      </ScrollView>

      <CategoryPickerSheet
        ref={categoryPickerRef}
        categories={categories}
        onSelect={(category) => {
          setValue("categoryId", category.id, { shouldValidate: true });
          setTimeout(() => planRef.current?.focus(), 350);
        }}
        selectedCategoryId={categoryId}
      />

      <RecurrencePickerSheet
        ref={recurrencePickerRef}
        onSelect={(value) => {
          setValue("recurrence", value, { shouldValidate: true });
        }}
        selectedRecurrence={recurrence}
      />
    </BottomSheetModalProvider>
  );
}

function Field({
  label,
  children,
  footer,
  bare = false,
}: {
  label: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  bare?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.sectionTitle}>{label}</Text>
      {bare ? children : <View style={styles.inputCard}>{children}</View>}
      {footer}
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.inputCard}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  form: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
    gap: 18,
  },
  field: {
    gap: 8,
  },
  section: {
    gap: 8,
  },
  inputCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    gap: 12,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: theme.name === "light" ? 0.025 : 0.05,
    shadowRadius: theme.name === "light" ? 1.5 : 2,
    elevation: theme.name === "light" ? 0 : 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.muted,
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
  input: {
    paddingHorizontal: 0,
    paddingVertical: 4,
    fontSize: 14,
    color: theme.colors.text,
  },
  pickerField: {
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerPlaceholder: {
    fontSize: 14,
    color: theme.colors.placeholder,
  },
  pickerValue: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
  categoryChip: {
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryChipMain: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  categoryAvatar: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceMuted,
  },
  categoryAvatarText: {
    fontSize: 17,
  },
  categoryChipName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
  categoryClear: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  prefix: {
    position: "absolute",
    left: 0,
    top: 10,
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.muted,
    zIndex: 1,
  },
  amountInput: {
    paddingLeft: 48,
    paddingVertical: 2,
    fontSize: 24,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: "transparent",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.icon,
  },
  chipTextSelected: {
    color: theme.colors.primaryForeground,
  },
  dateField: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dateFieldText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  prefCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  prefTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.text,
  },
  prefSub: {
    fontSize: 12,
    lineHeight: 16,
    color: theme.colors.muted,
  },
}));
