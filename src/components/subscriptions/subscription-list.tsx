import { forwardRef, memo, useCallback } from "react";

import { FlashList, type FlashListRef } from "@shopify/flash-list";

import { SubscriptionRow } from "@/components/subscriptions/subscription-row";
import type { SubscriptionListItemView } from "@/features/subscriptions/view-models";

type SubscriptionListProps = {
  subscriptions: SubscriptionListItemView[];
  onSubscriptionPress: (subscriptionId: string) => void;
  contentContainerStyle?: object;
  ListEmptyComponent?: React.ReactElement | null;
};

const SubscriptionListInner = forwardRef<
  FlashListRef<SubscriptionListItemView>,
  SubscriptionListProps
>(({ subscriptions, onSubscriptionPress, contentContainerStyle, ListEmptyComponent }, ref) => {
  const renderItem = useCallback(
    ({ item }: { item: SubscriptionListItemView }) => (
      <SubscriptionRow onPress={() => onSubscriptionPress(item.id)} subscription={item} />
    ),
    [onSubscriptionPress],
  );

  const keyExtractor = useCallback((item: SubscriptionListItemView) => item.id, []);

  return (
    <FlashList
      ref={ref}
      contentContainerStyle={contentContainerStyle}
      data={subscriptions}
      keyExtractor={keyExtractor}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      ListEmptyComponent={ListEmptyComponent}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
    />
  );
});

SubscriptionListInner.displayName = "SubscriptionList";

export const SubscriptionList = memo(SubscriptionListInner);

SubscriptionList.displayName = "SubscriptionList";
