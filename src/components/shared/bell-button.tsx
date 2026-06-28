import { Bell } from "lucide-react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { IconButton } from "@/components/shared/icon-button";

type BellButtonProps = {
  onPress?: () => void;
};

export function BellButton({ onPress }: BellButtonProps) {
  const { theme } = useUnistyles();

  return (
    <IconButton onPress={onPress}>
      <Bell color={theme.colors.icon} size={16} strokeWidth={1.5} style={styles.icon} />
    </IconButton>
  );
}

const styles = StyleSheet.create(() => ({
  icon: {},
}));
