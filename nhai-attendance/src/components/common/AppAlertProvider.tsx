import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@theme/ThemeProvider';
import { GlassCard } from '@components/common/GlassCard/GlassCard';

export type AlertButton = {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

export type AlertOptions = {
  title: string;
  message?: string;
  buttons?: AlertButton[];
};

type AppAlertContextType = {
  showAlert: (title: string, message?: string, buttons?: AlertButton[]) => void;
};

const AppAlertContext = createContext<AppAlertContextType | undefined>(undefined);

export const useAppAlert = () => {
  const context = useContext(AppAlertContext);
  if (!context) throw new Error('useAppAlert must be used within AppAlertProvider');
  return context;
};

export const AppAlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState<AlertOptions | null>(null);
  const { colors, fontSize, fontWeight, spacing, borderRadius } = useTheme();

  const showAlert = (title: string, message?: string, buttons?: AlertButton[]) => {
    setAlertConfig({ title, message, buttons: buttons || [{ text: 'OK' }] });
  };

  const closeAlert = () => setAlertConfig(null);

  return (
    <AppAlertContext.Provider value={{ showAlert }}>
      {children}
      <Modal
        visible={!!alertConfig}
        transparent
        animationType="fade"
        onRequestClose={closeAlert}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <GlassCard style={{ padding: spacing.xl, borderRadius: borderRadius.xl, width: '100%' }}>
              <Text style={{ color: colors.text.primary, fontSize: fontSize.xl, fontWeight: fontWeight.bold, marginBottom: spacing.md, textAlign: 'center' }}>
                {alertConfig?.title}
              </Text>
              {!!alertConfig?.message && (
                <Text style={{ color: colors.text.secondary, fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.xl }}>
                  {alertConfig.message}
                </Text>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.md }}>
                {alertConfig?.buttons?.map((btn, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      {
                        backgroundColor: btn.style === 'cancel' ? colors.background.tertiary : btn.style === 'destructive' ? colors.trust.rejected : colors.brand.primary,
                        borderRadius: borderRadius.md,
                        paddingVertical: spacing.sm,
                        paddingHorizontal: spacing.lg,
                        flex: alertConfig.buttons?.length === 2 ? 1 : undefined,
                      }
                    ]}
                    onPress={() => {
                      closeAlert();
                      btn.onPress?.();
                    }}
                  >
                    <Text style={{ color: btn.style === 'cancel' ? colors.text.primary : '#FFF', fontSize: fontSize.md, fontWeight: fontWeight.bold, textAlign: 'center' }}>
                      {btn.text || 'OK'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </GlassCard>
          </View>
        </View>
      </Modal>
    </AppAlertContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 380,
  },
  button: {
    minWidth: 100,
  }
});
