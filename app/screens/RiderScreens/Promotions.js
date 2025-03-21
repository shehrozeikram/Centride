import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, ActivityIndicator } from "react-native";
import AppButton from "../../components/AppButton";
import Style from "../../utils/Styles";
import Spacing from "../../components/Spacing";
import InputField from "../../components/InputField";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import AsyncStorage from '@react-native-async-storage/async-storage';

const Promotions = () => {
  const [couponCode, setCouponCode] = useState('');
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { t, i18n } = useTranslation();
  const navigation = useNavigation();

  const checkPromoCode = async () => {
    if (!couponCode || couponCode.trim() === '') {
      Alert.alert(
        'Missing Promo Code',
        'Please enter a promo code to receive your discount.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const baseUrl = 'https://appserver.txy.co/ajax_2_1_1.php';
      const params = new URLSearchParams({
        sess_id: 'N29hMmpsOGFzNjQyZ3FxdDExc3Qza2ZuajY=',
        action_get: 'promocodecheck',
        coupon_code: couponCode.trim()
      });

      const response = await fetch(`${baseUrl}?${params}`);
      const data = await response.json();
      
      console.log('data', data);

      if (data.error) {
        if (data.error === 'Promo code is invalid') {
          Alert.alert(
            'Invalid Promo Code',
            'The promo code you entered is not valid. Please check and try again.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Error',
            data.error,
            [{ text: 'OK' }]
          );
        }
        return;
      }

      if (data.usage_limit_count && data.user_usage_count) {
        if (data.user_usage_count >= data.usage_limit_count) {
          Alert.alert(
            'Usage Limit Reached',
            'You have reached the maximum usage limit for this promotion. Please try a different promo code.',
            [{ text: 'OK' }]
          );
          return;
        }
      }

      if (data.success) {
        try {
          console.log('Full API Response:', data);
          
          const promoData = {
            couponCode: couponCode,
            discount: data.discount_value || '0',
            couponTitle: data.coupon_title,
            message: data.message,
            usageCount: data.user_usage_count,
            usageLimit: data.usage_limit_count,
            city: data.city,
            daysLeft: data.days_left
          };
          
          console.log('Saving Promo Data:', promoData);
          
          await AsyncStorage.setItem('activePromoCode', JSON.stringify(promoData));
          
          Alert.alert(
            'Success',
            `Promo code applied successfully! ${data.discount_message || ''}`,
            [{ text: 'OK' }]
          );
        } catch (storageError) {
          console.error('Error saving to AsyncStorage:', storageError);
        }
      }

      setResponseData(data);
    } catch (err) {
      setError(err.message);
      Alert.alert(
        'Error',
        'An error occurred while checking the promo code. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const onPress = () => {
    checkPromoCode();
  };

  return (
    <View style={[Style.container, Style.hPaddingSixteen]}>
      <Spacing val={35} />
      <View style={[Style.flex1, styles.inputView]}>
        <Text style={[Style.fontSemiBold, Style.label, Style.colorBlack]}>
          {t("enter_promo_code")}
        </Text>
        <Spacing val={10} />
        <Text style={[Style.fontMedium, Style.label, Style.colorBlack80]}>
          {t("discout_code")}
        </Text>
        <Spacing val={20} />
        <View style={styles.inputView}>
          <InputField
            value={couponCode}
            keyboard={"default"}
            onChangeText={setCouponCode}
            placeholder="Enter promo code"
          />
        </View>
      </View>

      {responseData && responseData.success && (
        <View style={styles.infoBox}>
          <Text style={styles.titleText}>
            {responseData.coupon_title}
          </Text>
          <Text style={styles.messageText}>
            {responseData.message}
          </Text>
          <View style={styles.bottomInfoContainer}>
            <Text style={styles.bottomText}>
              {responseData.days_left} days left
            </Text>
            <Text style={styles.bottomText}>
              Times of use - {responseData.user_usage_count}/{responseData.usage_limit_count}
            </Text>
            <Text style={styles.bottomText}>
              {responseData.city}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.buttonView}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <AppButton onPress={onPress} name={t("apply")} />
        )}
      </View>
      <Spacing val={40} />
    </View>
  );
};

const styles = StyleSheet.create({
  buttonView: {
    width: "100%",
    alignSelf: "flex-end",
  },
  container: {
    marginTop: "25%",
    alignItems: "center",
  },
  discountText: {
    fontSize: 16,
    fontWeight: "300",
    marginTop: 15,
    marginLeft: "-10%",
  },
  input: {
    height: 60,
    paddingHorizontal: 20,
    borderRadius: 7,
    backgroundColor: "lightgray",
  },
  inputView: {
    width: "100%",
  },
  promoText: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: "10%",
    marginLeft: "-47%",
  },
  infoBox: {
    backgroundColor: '#8A2BE2',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  titleText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  messageText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  bottomInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomText: {
    color: 'white',
    fontSize: 12,
    flex: 1,
    textAlign: 'center',
  },
});

export default Promotions;
