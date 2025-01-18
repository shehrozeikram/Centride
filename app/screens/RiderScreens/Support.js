import React from 'react'
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import Spacing from '../../components/Spacing'
import Style from '../../utils/Styles'
import { useNavigation } from '@react-navigation/native'
import Header from '../../components/Header'

import { useTranslation } from 'react-i18next'

const Support = ({ navigation }) => {
    const { t, i18n } = useTranslation()
    const helpItems = [
        {
            id: '1',
            title: 'help_guide',
            description: 'help_guide_description',
            icon: 'book',
            color: '#F07FC7',
            screen: 'HelpGuide',
        },
        {
            id: '2',
            title: 'customer_service_chat',
            description: 'customer_service_chat_description',
            icon: 'comments',
            color: '#FFAA00',
            screen: 'CustomerServiceChat',
        },
    ]

    const learnMoreItems = [
        {
            id: '3',
            title: 'terms_and_privacy_policy',
            description: 'terms_and_privacy_policy_description',
            icon: 'legal',
            color: '#654313',
            screen: 'PrivacyPolicy',
        },
        {
            id: '4',
            title: 'drive_with_us',
            description: 'drive_description',
            icon: 'car',
            color: '#C1BD03',
            screen: 'DriveWithUs',
        },
        {
            id: '5',
            title: 'rate_app',
            description: 'rate_app_description',
            icon: 'star',
            color: '#EEBD5F',
            screen: 'RateApp',
        },
        {
            id: '6',
            title: 'software_licenses',
            description: 'licenses_description',
            icon: 'gavel',
            color: '#AE00C4',
            screen: 'SoftwareLicenses',
        },
        {
            id: '7',
            title: 'about_txyco',
            description: 'Learn more about our company and mission.',
            icon: 'info-circle',
            color: '#3EA5F5',
            screen: 'AboutTxyCo',
        },
    ]

    const handlePress = (screen) => {
        navigation.navigate(screen)
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.item}
            onPress={() => handlePress(item.screen)}>
            <Icon
                name={item.icon}
                color={item.color}
                size={16}
                style={styles.itemIcon}
            />
            <View style={styles.textContainer}>
                <Text style={[Style.colorBlack, Style.label]}>
                    {t(item.title)}
                </Text>
                <Text style={styles.itemDescription}>
                    {t(item.description)}
                </Text>
            </View>
            <Icon name='chevron-right' size={14} style={Style.colorBlack} />
        </TouchableOpacity>
    )

    const onBackPress = () => {
        navigation.goBack()
    }

    return (
        <View style={[Style.container, Style.hPaddingSixteen]}>
            {/* <Spacing val={Platform.OS === 'ios' && 35} /> */}
            <Spacing val={35} />
            <Text style={[Style.fontBold, Style.labelButton, Style.colorBlack]}>
                {t('support_help_title')}
            </Text>
            <Spacing val={20} />
            <View>
                <FlatList
                    data={helpItems}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                />
            </View>
            <Spacing val={36} />
            <Text style={[Style.fontBold, Style.labelButton, Style.colorBlack]}>
                {t('learn_about_us_text')}
            </Text>
            <Spacing val={20} />
            <View>
                <FlatList
                    data={learnMoreItems}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
        marginTop: 90,
    },
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginVertical: 28,
    },
    secondHeading: {
        marginTop: '-18%',
    },
    list: {
        marginBottom: 16,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: '#e0e0e0',
    },
    itemIcon: {
        marginRight: 35,
    },
    textContainer: {
        flex: 1,
    },
    itemDescription: {
        fontSize: 14,
        color: '#777',
        marginTop: 4,
    },
})

export default Support
