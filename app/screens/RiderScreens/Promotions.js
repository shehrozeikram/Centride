import React, { useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Platform,
    Keyboard,
} from 'react-native'
import AppButton from '../../components/AppButton'
import Style from '../../utils/Styles'
import Spacing from '../../components/Spacing'
import InputField from '../../components/InputField'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'

const Promotions = () => {
    const { t, i18n } = useTranslation()
    const { phone, setPhone } = useState('')
    const onPress = () => {
        navigation.navigate('Otp')
    }
    const navigation = useNavigation()

    const onBackPress = () => {
        navigation.goBack()
    }
    return (
        <View style={[Style.container, Style.hPaddingSixteen]}>
            {/* <Spacing val={Platform.OS === 'ios' && 35} /> */}

            <Spacing val={35} />
            <View style={[Style.flex1, styles.inputView]}>
                <Text
                    style={[Style.fontSemiBold, Style.label, Style.colorBlack]}>
                    {t('enter_promo_code')}
                    {/* Enter a promo code */}
                </Text>
                <Spacing val={10} />
                <Text
                    style={[Style.fontMedium, Style.label, Style.colorBlack80]}>
                    {t('discout_code')}
                    {/* Promo discount will be applied on your next ride */}
                </Text>
                <Spacing val={20} />
                <View style={styles.inputView}>
                    <InputField
                        value={phone}
                        keyboard={'default'}
                        onChangeText={setPhone}
                    />
                    {/* <TextInput
          style={styles.input}
          placeholder="Phone"
          secureTextEntry
          value={phone}
          onChangeText={setPhone}
          autoCorrect={false}
          autoCapitalize="none"
        /> */}
                </View>
            </View>

            <View style={styles.buttonView}>
                <AppButton onPress={onPress} name={t('apply')} />
            </View>
            <Spacing val={40} />
        </View>
    )
}

const styles = StyleSheet.create({
    buttonView: {
        width: '100%',
        alignSelf: 'flex-end',
    },
    container: {
        marginTop: '25%',
        alignItems: 'center',
    },
    discountText: {
        fontSize: 16,
        fontWeight: '300',
        marginTop: 15,
        marginLeft: '-10%',
    },
    input: {
        height: 60,
        paddingHorizontal: 20,
        borderRadius: 7,
        backgroundColor: 'lightgray',
    },
    inputView: {
        width: '100%',
    },
    promoText: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: '10%',
        marginLeft: '-47%',
    },
})

export default Promotions
