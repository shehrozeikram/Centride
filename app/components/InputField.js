import {
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import Style from '../utils/Styles'
import Color from '../utils/Color'
import Spacing from './Spacing'
import { isEnabled } from 'react-native/Libraries/Performance/Systrace'

export default InputField = ({
    label,
    value,
    placeholder,
    keyboard,
    onChangeText,
    validation,
    validationFn,
    error,
    editable = true,
    isRegisterScreen,
    countryCode,
    onPressCountry,
    onPress,

    ...rest
}) => {
    return (
        <View>
            {label && (
                <Text
                    style={[Style.label14, Style.fontMedium, Style.colorBlack]}
                >
                    {label}
                </Text>
            )}

            <Spacing />
            <Pressable
                onPress={() => {
                    !editable && onPress()
                }}
                style={[
                    isRegisterScreen && style.inputBoxStyle,
                    Style.flexRow,
                    Style.alignCenter,
                    Style.gap10,
                    style.container,

                    validation &&
                        validationFn &&
                        !validationFn(value) &&
                        style.errorBorder,
                ]}
            >
                {isRegisterScreen && (
                    <TouchableOpacity onPress={onPressCountry}>
                        <Text
                            style={[
                                Style.label,
                                Style.fontSemiBold,
                                Style.colorBlack,
                            ]}
                        >
                            {countryCode}
                        </Text>
                    </TouchableOpacity>
                )}

                <TextInput
                    style={[
                        Style.label,
                        Style.fontSemiBold,
                        Style.colorBlack,
                        isRegisterScreen && Style.widthFull,
                        Style.flex1,
                    ]}
                    placeholder={placeholder}
                    placeholderTextColor={Color.textDisabled}
                    keyboardType={keyboard}
                    value={value}
                    onChangeText={onChangeText}
                    {...rest}
                    editable={editable}
                />
            </Pressable>
            {validation && validationFn && !validationFn(value) && (
                <>
                    <Spacing />
                    <Text
                        style={[
                            Style.subTitle,
                            Style.fontSemiBold,
                            Style.colorError,
                        ]}
                    >
                        {error}
                    </Text>
                </>
            )}
        </View>
    )
}

const style = StyleSheet.create({
    container: {
        backgroundColor: Color.inputBackground,
        borderRadius: 10,
        height: Platform.OS === 'android' ? 62 : 60,
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    errorBorder: {
        borderBottomWidth: 2.5,
        borderBottomColor: Color.errorTextColor,
    },
    inputBoxStyle: {
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 5,
    },
})
