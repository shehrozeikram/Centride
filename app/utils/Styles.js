import { I18nManager, StyleSheet, Dimensions } from 'react-native'
import Color from './Color'
const { width } = Dimensions.get('window')

const Style = StyleSheet.create({
    // Common container style
    container: {
        flex: 1,
        backgroundColor: Color.white,
        // paddingTop: 36,
    },

    // Common text style
    text: {
        color: Color.text, // Default text color
        fontSize: 16,
        fontWeight: 'normal',
    },

    // Common button style
    button: {
        backgroundColor: '#3498db',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
    },

    // Common input field style
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        padding: 10,
        marginVertical: 10,
        width: '100%',
    },

    // Common header style
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2ecc71',
        marginBottom: 10,
    },
    appBackground: {
        backgroundColor: Color.background,
        opacity: 0.1,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        position: 'absolute',
    },
    flex1: {
        flex: 1,
    },
    flex2: {
        flex: 2,
    },

    hPadding: {
        paddingHorizontal: 20,
    },
    hPaddingSixteen: {
        paddingHorizontal: 16,
    },
    vPadding14: {
        paddingVertical: 14,
    },

    flexRow: {
        flexDirection: 'row',
    },

    flexWrapWrap: {
        flexWrap: 'wrap',
    },

    flexColumn: {
        flexDirection: 'column',
    },

    justifyCenter: {
        justifyContent: 'center',
    },
    justifyBetween: {
        justifyContent: 'space-between',
    },
    justifyAround: {
        justifyContent: 'space-around',
    },
    justifyEnd: {
        justifyContent: 'flex-end',
    },
    justifyStart: {
        justifyContent: 'flex-start',
    },
    alignCenter: {
        alignItems: 'center',
    },
    alignStart: {
        alignItems: 'flex-start',
    },
    selfEnd: {
        alignSelf: 'flex-end',
    },
    selfStart: {
        alignSelf: 'flex-start',
    },
    selfAlignCenter: {
        alignSelf: 'center',
    },

    hPaddingSmall: {
        paddingHorizontal: 10,
    },

    gap5: {
        gap: 5,
    },
    gap6: {
        gap: 6,
    },
    gap2: {
        gap: 2,
    },

    gap9: {
        gap: 9,
    },
    gap8: {
        gap: 8,
    },
    gap10: {
        gap: 10,
    },
    gap12: {
        gap: 12,
    },

    gap15: {
        gap: 15,
    },
    gap18: {
        gap: 18,
    },
    gap20: {
        gap: 20,
    },
    gap30: {
        gap: 30,
    },
    gap25: {
        gap: 25,
    },
    gap35: {
        gap: 35,
    },
    backgroundWhite: {
        backgroundColor: Color.white,
    },
    grayMain: {
        color: Color.greyMain,
    },

    colorSecondary: {
        color: Color.secondary,
    },
    colorSecondaryText: {
        color: Color.secondaryText,
    },
    lightGrey: {
        color: Color.lightGrey,
    },

    colorPrimary: {
        color: Color.primary,
    },
    colorBlack: {
        color: Color.blackText,
    },
    colorBlack80: {
        color: Color.black80,
    },
    colorGray: {
        color: Color.gray,
    },
    colorGray20: {
        color: Color.gray20,
    },
    colorGray1: {
        color: Color.greySlight,
    },
    colorOrange: {
        backgroundColor: Color.lightOrange,
    },
    colorSubtitleText: {
        color: Color.subtitleText,
    },

    colorWhite: {
        color: Color.white,
    },
    colorError: {
        color: Color.errorTextColor,
    },
    colorTextDisabled: {
        color: Color.textDisabled,
    },

    underlineText: {
        textDecorationLine: 'underline',
    },
    textCenter: {
        textAlign: 'center',
    },
    textleft: {
        textAlign: 'left',
    },
    textright: {
        textAlign: 'right',
    },
    labelButton: {
        fontSize: 18,
    },
    label14: {
        fontSize: 14,
    },
    label8: {
        fontSize: 8.33,
    },
    label: {
        fontSize: 16,
    },

    subTitle: {
        fontSize: 10,
    },
    fontSize11: {
        fontSize: 11.11,
    },
    fontSize20: {
        fontSize: 20,
    },
    fontSize8: {
        fontSize: 8,
    },
    subLabel: {
        fontSize: 12,
    },
    heading22: {
        fontSize: 22,
    },
    heading: {
        fontSize: 24,
    },
    heading32: {
        fontSize: 32,
    },

    fontBold: {
        fontFamily: I18nManager.isRTL ? 'Rubik-Bold' : 'Raleway-Bold',
        includeFontPadding: false,
    },
    fontExtraBold: {
        fontFamily: I18nManager.isRTL ? 'Rubik-ExtraBold' : 'Raleway-ExtraBold',
        includeFontPadding: false,
    },
    fontExtraLight: {
        fontFamily: I18nManager.isRTL ? 'Rubik-Light' : 'Raleway-ExtraLight',
        includeFontPadding: false,
    },
    fontLight: {
        fontFamily: I18nManager.isRTL ? 'Rubik-Light' : 'Raleway-Light',
        includeFontPadding: false,
    },
    fontMedium: {
        fontFamily: I18nManager.isRTL ? 'Rubik-Medium' : 'Raleway-Medium',
        includeFontPadding: false,
    },
    fontRegular: {
        fontFamily: I18nManager.isRTL ? 'Rubik-Regular' : 'Raleway-Regular',
        includeFontPadding: false,
    },
    fontSemiBold: {
        fontFamily: I18nManager.isRTL ? 'Rubik-SemiBold' : 'Raleway-SemiBold',
        includeFontPadding: false,
    },
    fontThin: {
        fontFamily: 'Raleway-Thin',
    },
    fontRalewayRegular: {
        fontFamily: 'Raleway-Regular',
        includeFontPadding: false,
    },
    fontHeading: {
        fontFamily:
            Platform.OS === 'ios'
                ? 'VersatyloRoundedRegular'
                : 'Versatylo-Rounded',
    },
    fontVersatyloRounded: {
        fontFamily: 'Versatylo-Rounded',
    },

    profileImage: {
        width: 70,
        height: 70,
        borderRadius: 10,
    },

    cardBackground: {
        width: '100%',
        backgroundColor: Color.white,
        padding: 12,
        borderRadius: 6,
    },

    positionAbsolute: {
        position: 'absolute',
    },
    backArrow: {
        height: 30,
        width: 30,
    },
    iconDirection: {
        transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],
    },
    customComponent: {
        width: width,
        backgroundColor: Color.white,
        padding: 20,
        marginTop: 5,
    },
    vMargin: {
        marginVertical: 5,
    },
    lineHeight18: {
        lineHeight: 18,
    },
    widthFull: {
        width: '100%',
    },
    widthHalf: {
        width: '50',
    },
})

export default Style
